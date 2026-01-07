<<<<<<< HEAD
from django.shortcuts import render

# Create your views here.
=======
from rest_framework import viewsets, permissions
>>>>>>> ea95a4f (Implemented JWT auth, doctor and patient modules with role-based access control)
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User, DoctorProfile, PatientProfile, Visit
from .serializers import (
    CustomTokenObtainPairSerializer,
    DoctorProfileSerializer,
    PatientProfileSerializer,
    VisitSerializer
)


# -------------------------------------------------
# JWT LOGIN VIEW (DAY 1)
# -------------------------------------------------
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


# -------------------------------------------------
# DOCTOR VIEWSET (DAY 2)
# -------------------------------------------------
class DoctorViewSet(viewsets.ModelViewSet):
    serializer_class = DoctorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Admin can see all doctors
        if user.role == User.Role.ADMIN:
            return DoctorProfile.objects.all()

        # Doctor can see only his own profile
        if user.role == User.Role.DOCTOR:
            return DoctorProfile.objects.filter(user=user)

        # Patient can see only assigned doctor
        if user.role == User.Role.PATIENT:
            return DoctorProfile.objects.filter(patients__user=user)

        return DoctorProfile.objects.none()


# -------------------------------------------------
# PATIENT VIEWSET (DAY 3)
# -------------------------------------------------
class PatientViewSet(viewsets.ModelViewSet):
    serializer_class = PatientProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Admin sees all patients
        if user.role == User.Role.ADMIN:
            return PatientProfile.objects.all()

        # Doctor sees only his patients
        if user.role == User.Role.DOCTOR:
            return PatientProfile.objects.filter(doctor__user=user)

        # Patient sees only his profile
        if user.role == User.Role.PATIENT:
            return PatientProfile.objects.filter(user=user)

        return PatientProfile.objects.none()

    def perform_create(self, serializer):
        # Doctor auto-assigns himself while creating patient
        if self.request.user.role == User.Role.DOCTOR:
            serializer.save(doctor=self.request.user.doctor_profile)
        else:
            serializer.save()


# -------------------------------------------------
# VISIT VIEWSET
# -------------------------------------------------
class VisitViewSet(viewsets.ModelViewSet):
    serializer_class = VisitSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Doctor sees his visits
        if user.role == User.Role.DOCTOR:
            return Visit.objects.filter(doctor__user=user)

        # Patient sees his visits
        if user.role == User.Role.PATIENT:
            return Visit.objects.filter(patient__user=user)

        # Admin sees all
        return Visit.objects.all()

    def perform_create(self, serializer):
        # Doctor is auto-assigned during visit creation
        if self.request.user.role == User.Role.DOCTOR:
            serializer.save(doctor=self.request.user.doctor_profile)
