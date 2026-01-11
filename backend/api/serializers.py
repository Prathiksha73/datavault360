from rest_framework import serializers
from .models import User, DoctorProfile, PatientProfile, Visit, LabProfile, LabTestRequest, Invitation, Room

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role']

class DoctorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    password = serializers.CharField(write_only=True, required=False)
    username = serializers.CharField(write_only=True, required=False)
    specialization = serializers.CharField(required=False)

    class Meta:
        model = DoctorProfile
        fields = ['id', 'user', 'specialization', 'password', 'username']

    def create(self, validated_data):
        user_data = {}
        if 'username' in validated_data:
            user_data['username'] = validated_data.pop('username')
        if 'password' in validated_data:
            user_data['password'] = validated_data.pop('password')
        

        user = User.objects.create_user(role=User.Role.DOCTOR, **user_data)
        
        doctor = DoctorProfile.objects.create(user=user, **validated_data)
        return doctor

class RoomSerializer(serializers.ModelSerializer):
    patient_details = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = ['id', 'room_number', 'room_type', 'speciality', 'patient', 'scheduled_discharge', 'patient_details']
        read_only_fields = ['patient']

    def get_patient_details(self, obj):
        if obj.patient:
            return {
                'id': obj.patient.id,
                'name': f"{obj.patient.user.first_name} {obj.patient.user.last_name}" if obj.patient.user.first_name else obj.patient.user.username,
                'age': obj.patient.date_of_birth,
                'phone': obj.patient.phone_number
            }
        return None

class PatientProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    password = serializers.CharField(write_only=True, required=False)
    username = serializers.CharField(write_only=True, required=False)
    doctors = DoctorProfileSerializer(many=True, read_only=True)
    assigned_room = RoomSerializer(read_only=True)
    doctor_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )

    class Meta:
        model = PatientProfile
        fields = ['id', 'user', 'doctors', 'doctor_ids', 'assigned_room', 'date_of_birth', 'phone_number', 'address_line', 'city', 'state', 'postal_code', 'country', 'gender', 'active', 'full_address', 'password', 'username']
        read_only_fields = ['doctors', 'assigned_room']

    def create(self, validated_data):
        user_data = {}
        if 'username' in validated_data:
            user_data['username'] = validated_data.pop('username')
        if 'password' in validated_data:
            user_data['password'] = validated_data.pop('password')
            
        doctor_ids = validated_data.pop('doctor_ids', [])
        
        user = User.objects.create_user(role=User.Role.PATIENT, **user_data)
        
        patient = PatientProfile.objects.create(user=user, **validated_data)
        
        if doctor_ids:
            patient.doctors.set(doctor_ids)
            
        return patient

    def update(self, instance, validated_data):
        if 'doctor_ids' in validated_data:
            doctor_ids = validated_data.pop('doctor_ids')
            instance.doctors.set(doctor_ids)
        

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

class VisitSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()

    class Meta:
        model = Visit
        fields = ['id', 'patient', 'doctor', 'visit_date', 'diagnosis', 'prescription', 'patient_name', 'doctor_name']
        read_only_fields = ['doctor']

    def get_patient_name(self, obj):
        user = obj.patient.user
        return f"{user.first_name} {user.last_name}" if user.first_name else user.username

    def get_doctor_name(self, obj):
        user = obj.doctor.user
        return f"{user.first_name} {user.last_name}" if user.first_name else user.username

class LabProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    password = serializers.CharField(write_only=True, required=False)
    username = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = LabProfile
        fields = ['id', 'user', 'name', 'address', 'password', 'username']

    def create(self, validated_data):
        user_data = {}
        if 'username' in validated_data:
            user_data['username'] = validated_data.pop('username')
        if 'password' in validated_data:
            user_data['password'] = validated_data.pop('password')
        
        user = User.objects.create_user(role=User.Role.LAB, **user_data)
        lab = LabProfile.objects.create(user=user, **validated_data)
        return lab

class LabTestRequestSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.user.username', read_only=True)
    doctor_name = serializers.CharField(source='doctor.user.username', read_only=True)
    lab_name = serializers.CharField(source='lab.name', read_only=True)
    lab_address = serializers.CharField(source='lab.address', read_only=True)

    class Meta:
        model = LabTestRequest
        fields = ['id', 'patient', 'doctor', 'lab', 'test_names', 'status', 'report_file', 'created_at', 
                  'patient_name', 'doctor_name', 'lab_name', 'lab_address']
        read_only_fields = ['doctor', 'created_at']

class InvitationCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=User.Role.choices)
    extra_data = serializers.JSONField(required=False, default=dict)

class InvitationViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invitation
        fields = ['id', 'email', 'role', 'status', 'created_at']

class InvitationCompleteSerializer(serializers.Serializer):
    token = serializers.UUIDField()
    username = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    password = serializers.CharField()
    
    # Patient Specific Fields (Optional here, validated in view based on role)
    gender = serializers.CharField(required=False)
    date_of_birth = serializers.DateField(required=False)
    phone_number = serializers.CharField(required=False)
    address_line = serializers.CharField(required=False)
    city = serializers.CharField(required=False)
    state = serializers.CharField(required=False)
    postal_code = serializers.CharField(required=False)
    country = serializers.CharField(required=False)

