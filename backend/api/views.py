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
class DoctorViewSet(viewsets.ModelViewSet):
    serializer_class = DoctorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == User.Role.ADMIN:
            return DoctorProfile.objects.all()

        if user.role == User.Role.DOCTOR:
            return DoctorProfile.objects.filter(user=user)

        if user.role == User.Role.PATIENT:
            return DoctorProfile.objects.filter(patients__user=user)

        return DoctorProfile.objects.none()


# -------------------------
# PATIENT VIEWSET
# -------------------------
class PatientViewSet(viewsets.ModelViewSet):
    serializer_class = PatientProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == User.Role.ADMIN:
            return PatientProfile.objects.all()

        if user.role == User.Role.DOCTOR:
            return PatientProfile.objects.filter(doctor__user=user)

        if user.role == User.Role.PATIENT:
            return PatientProfile.objects.filter(user=user)

        return PatientProfile.objects.none()

    def perform_create(self, serializer):
        if self.request.user.role == User.Role.DOCTOR:
            serializer.save(doctor=self.request.user.doctor_profile)
        else:
            serializer.save()


# -------------------------
# VISIT VIEWSET
# -------------------------
class VisitViewSet(viewsets.ModelViewSet):
    serializer_class = VisitSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == User.Role.DOCTOR:
            return Visit.objects.filter(doctor__user=user)

        if user.role == User.Role.PATIENT:
            return Visit.objects.filter(patient__user=user)

        return Visit.objects.all()

    def perform_create(self, serializer):
        if self.request.user.role == User.Role.DOCTOR:
            serializer.save(doctor=self.request.user.doctor_profile)
