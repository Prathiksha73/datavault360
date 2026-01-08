from rest_framework import viewsets, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User, DoctorProfile, PatientProfile, Visit
from .serializers import (
    CustomTokenObtainPairSerializer,
    DoctorProfileSerializer,
    PatientProfileSerializer,
    VisitSerializer
)


# -------------------------
# AUTH LOGIN VIEW
# -------------------------
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


# -------------------------
# DOCTOR VIEWSET
# -------------------------
class DoctorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DoctorProfile.objects.all()
    serializer_class = DoctorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]


# -------------------------
# PATIENT VIEWSET
# -------------------------
class PatientViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PatientProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Patient sees only their own profile
        if user.role == 'PATIENT':
            return PatientProfile.objects.filter(user=user)

        # Doctor sees only their patients
        if user.role == 'DOCTOR':
            return PatientProfile.objects.filter(doctor__user=user)

        # Admin sees all
        return PatientProfile.objects.all()


# -------------------------
# VISIT VIEWSET
# -------------------------
class VisitViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = VisitSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        patient_id = self.request.query_params.get('patient')

        qs = Visit.objects.all()

        # Filter by patient if query param present
        if patient_id:
            qs = qs.filter(patient_id=patient_id)

        if user.role == 'DOCTOR':
            return qs.filter(doctor__user=user)

        if user.role == 'PATIENT':
            return qs.filter(patient__user=user)

        return qs
