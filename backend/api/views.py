from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.shortcuts import get_object_or_404
from .models import User, DoctorProfile, PatientProfile, Visit, LabProfile, LabTestRequest, Invitation, Room, InventoryItem, FinancialRecord
from .serializers import UserSerializer, DoctorProfileSerializer, PatientProfileSerializer, VisitSerializer, LabProfileSerializer, LabTestRequestSerializer, InvitationCreateSerializer, InvitationViewSerializer, InvitationCompleteSerializer, RoomSerializer
import uuid
from django.core.mail import send_mail
from django.conf import settings

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Allow users to login with @username
        if 'username' in attrs and attrs['username'].startswith('@'):
            attrs['username'] = attrs['username'][1:]
            
        data = super().validate(attrs)
        data['role'] = self.user.role
        data['user_id'] = self.user.id
        data['username'] = self.user.username
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class DoctorViewSet(viewsets.ModelViewSet):
    queryset = DoctorProfile.objects.all()
    serializer_class = DoctorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Admin sees all, others see none? Or patients see their doctor?
        # Requirement: "Patient profile... showing doctor information"
        user = self.request.user
        if user.role == User.Role.ADMIN:
            return DoctorProfile.objects.all()
        elif user.role == User.Role.PATIENT:
            # Patient sees their own doctor
            return DoctorProfile.objects.filter(patients__user=user)
        elif user.role == User.Role.DOCTOR:
            # Doctor sees themselves
            return DoctorProfile.objects.filter(user=user)
        return DoctorProfile.objects.none()

class PatientViewSet(viewsets.ModelViewSet):
    queryset = PatientProfile.objects.all()
    serializer_class = PatientProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.ADMIN:
            return PatientProfile.objects.all()
        elif user.role == User.Role.DOCTOR:
            # Doctor sees their own patients
            return PatientProfile.objects.filter(doctors__user=user)
        elif user.role == User.Role.PATIENT:
            return PatientProfile.objects.filter(user=user)
        return PatientProfile.objects.none()

    def perform_create(self, serializer):
        # When doctor creates patient, assign doctor automatically
        if self.request.user.role == User.Role.DOCTOR:
            doctor = self.request.user.doctor_profile
            serializer.save(doctor_ids=[doctor.id])
        else:
            serializer.save()

class VisitViewSet(viewsets.ModelViewSet):
    queryset = Visit.objects.all()
    serializer_class = VisitSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.DOCTOR:
            # Doctor sees all visits for their assigned patients
            return Visit.objects.filter(patient__doctors__user=user)
        elif user.role == User.Role.PATIENT:
            return Visit.objects.filter(patient__user=user)
        return Visit.objects.all() # Admin

    def perform_create(self, serializer):
        if self.request.user.role == User.Role.DOCTOR:
            serializer.save(doctor=self.request.user.doctor_profile)

class LabViewSet(viewsets.ModelViewSet):
    queryset = LabProfile.objects.all()
    serializer_class = LabProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    # Allow reading labs by anyone authenticated (Doctor needs to select, Admin needs to see)

class LabTestRequestViewSet(viewsets.ModelViewSet):
    queryset = LabTestRequest.objects.all()
    serializer_class = LabTestRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.LAB:
            return LabTestRequest.objects.filter(lab__user=user)
        elif user.role == User.Role.DOCTOR:
            # Doctor sees all lab requests for their assigned patients
            return LabTestRequest.objects.filter(patient__doctors__user=user)
        elif user.role == User.Role.PATIENT:
            return LabTestRequest.objects.filter(patient__user=user)
        return LabTestRequest.objects.all() # Admin

    def perform_create(self, serializer):
        if self.request.user.role == User.Role.DOCTOR:
            serializer.save(doctor=self.request.user.doctor_profile)

class InvitationViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny] # Need AllowAny for retrieve/complete, IsAuth for create usually

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def create(self, request):
        serializer = InvitationCreateSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            role = serializer.validated_data['role']
            extra_data = serializer.validated_data.get('extra_data', {})
            
            token = uuid.uuid4()
            invitation = Invitation.objects.create(
                email=email,
                role=role,
                token=token,
                invited_by=request.user,
                extra_data=extra_data
            )
            
            # Generate Link
            # Generate Link
            setup_link = f"{settings.FRONTEND_URL}/setup-account/{token}"
            
            # Send Email
            # Send Email - Fail loudly if error
            send_mail(
                subject='DataVault360 Account Setup',
                message=f'You have been invited to join DataVault360. Please set up your account here: {setup_link}',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
            
            return Response({
                'message': 'Invitation sent successfully',
                'link': setup_link, 
                'token': token
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='check/(?P<token>[^/.]+)')
    def check_token(self, request, token=None):
        invitation = get_object_or_404(Invitation, token=token, status='PENDING')
        return Response({
            'email': invitation.email,
            'role': invitation.role,
            'extra_data': invitation.extra_data
        })

    @action(detail=False, methods=['post'])
    def complete(self, request):
        serializer = InvitationCompleteSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.validated_data['token']
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            
            invitation = get_object_or_404(Invitation, token=token, status='PENDING')
            
            first_name = serializer.validated_data['first_name']
            last_name = serializer.validated_data['last_name']
            
            # Create User
            if User.objects.filter(username=username).exists():
                return Response({'error': 'Username already taken'}, status=status.HTTP_400_BAD_REQUEST)
                
            user = User.objects.create_user(username=username, password=password, email=invitation.email, role=invitation.role, first_name=first_name, last_name=last_name)
            
            # Create Profile based on Role
            if invitation.role == User.Role.DOCTOR:
                specialization = invitation.extra_data.get('specialization', '')
                DoctorProfile.objects.create(user=user, specialization=specialization)
            elif invitation.role == User.Role.PATIENT:
                # Handle extra patient data
                doctor_id = invitation.extra_data.get('doctor_id')
                dob = invitation.extra_data.get('date_of_birth')
                phone = invitation.extra_data.get('phone_number')
                address = invitation.extra_data.get('address')
                
                patient = PatientProfile.objects.create(
                    user=user,
                    date_of_birth=dob,
                    phone_number=phone,
                    address=address
                )
                if doctor_id:
                    patient.doctors.add(doctor_id)
            
            # Mark invitation as used
            invitation.status = 'USED'
            invitation.save()
            
            return Response({'message': 'Account setup complete. Please login.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Auto-discharge rooms whose scheduled time has passed
        from django.utils import timezone
        now = timezone.now()
        
        # Find rooms to discharge
        to_discharge = Room.objects.filter(scheduled_discharge__lte=now, patient__isnull=False)
        count = to_discharge.count()
        if count > 0:
            print(f"Auto-discharging {count} rooms...")
            for room in to_discharge:
                room.patient = None
                room.scheduled_discharge = None
                room.save()
                
        return Room.objects.all()

    @action(detail=True, methods=['post'])
    def admit(self, request, pk=None):
        room = self.get_object()
        patient_id = request.data.get('patient_id')
        
        if not patient_id:
            return Response({'error': 'Patient ID is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        patient = get_object_or_404(PatientProfile, id=patient_id)
        
        # Check if room is occupied - Room.patient is OneToOne/ForeignKey (if unique=True)
        # Assuming OneToOneField as per Model definition
        if room.patient:
             return Response({'error': f'Room is already occupied by {room.patient}'}, status=status.HTTP_400_BAD_REQUEST)
             
        # Check if patient is already in another room (via reverse relation assigned_room)
        # Since OneToOne, patient.assigned_room works
        if hasattr(patient, 'assigned_room') and patient.assigned_room:
             return Response({'error': f'Patient is already assigned to {patient.assigned_room}'}, status=status.HTTP_400_BAD_REQUEST)

        room.patient = patient
        room.scheduled_discharge = None # Reset
        room.save()
        return Response({'message': f'Patient {patient.user.username} admitted to {room.room_number}'})

    @action(detail=True, methods=['post'])
    def discharge(self, request, pk=None):
        room = self.get_object()
        
        if not room.patient:
             return Response({'error': 'Room is empty'}, status=status.HTTP_400_BAD_REQUEST)
        
        discharge_time_str = request.data.get('discharge_time')
        if not discharge_time_str:
            return Response({'error': 'Discharge time is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        from django.utils.dateparse import parse_datetime
        from django.utils import timezone
        
        discharge_time = parse_datetime(discharge_time_str)
        if not discharge_time:
             return Response({'error': 'Invalid date format'}, status=status.HTTP_400_BAD_REQUEST)
             
        if timezone.is_naive(discharge_time):
             discharge_time = timezone.make_aware(discharge_time)
             
        if discharge_time <= timezone.now():
             return Response({'error': 'Discharge time must be in the future'}, status=status.HTTP_400_BAD_REQUEST)
             
        room.scheduled_discharge = discharge_time
        room.save()
        return Response({'message': f'Discharge scheduled for {discharge_time}'})



class AnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        # 1. Counts
        from django.db.models import Count, Sum, F
        from django.db.models.functions import TruncMonth

        doctors_count = DoctorProfile.objects.count()
        patients_count = PatientProfile.objects.count()
        rooms_total = Room.objects.count()
        rooms_active = Room.objects.filter(room_status='ACTIVE').count()
        rooms_maintenance = Room.objects.filter(room_status='MAINTENANCE').count()
        rooms_occupied = Room.objects.filter(patient__isnull=False).count()
        rooms_available = rooms_active - rooms_occupied
        
        labs_count = User.objects.filter(role='LAB').count()

        counts = {
            'doctors': doctors_count,
            'patients': patients_count,
            'labs': labs_count,
            'rooms_total': rooms_total,
            'rooms_active': rooms_active,
            'rooms_maintenance': rooms_maintenance,
            'rooms_occupied': rooms_occupied,
            'rooms_available': rooms_available
        }

        # 2. Financials (Monthly Income vs Expense)
        # Group by month
        financials = FinancialRecord.objects.annotate(
            month=TruncMonth('date')
        ).values('month', 'transaction_type').annotate(
            total=Sum('amount')
        ).order_by('month')
        
        # Format for frontend: [{ month, income, expense }]
        fin_data = {}
        for entry in financials:
            m = entry['month'].strftime('%Y-%m') # Key as YYYY-MM
            if m not in fin_data:
                fin_data[m] = {'name': m, 'Income': 0, 'Expense': 0}
            
            t_type = entry['transaction_type']
            if t_type == 'INCOME':
                fin_data[m]['Income'] = float(entry['total'])
            else:
                fin_data[m]['Expense'] = float(entry['total'])
        
        financials_list = sorted(list(fin_data.values()), key=lambda x: x['name'])

        # 3. Inventory (Low Stock & Recent)
        low_stock = InventoryItem.objects.filter(quantity__lte=F('low_stock_threshold')).values()
        all_inventory = InventoryItem.objects.all().order_by('quantity')[:20].values() # Top 20 lowest stock

        return Response({
            'counts': counts,
            'financials': financials_list,
            'inventory': list(all_inventory)
        })
