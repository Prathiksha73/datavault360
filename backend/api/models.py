from django.db import models
from django.contrib.auth.models import AbstractUser


# -------------------------
# CUSTOM USER MODEL
# -------------------------
class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('DOCTOR', 'Doctor'),
        ('PATIENT', 'Patient'),
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='PATIENT'
    )

    def __str__(self):
        return self.username


# -------------------------
# DOCTOR PROFILE
# -------------------------
class DoctorProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='doctor_profile'
    )
    specialization = models.CharField(max_length=100)

    def __str__(self):
        return f"Doctor: {self.user.username}"


# -------------------------
# PATIENT PROFILE
# -------------------------
class PatientProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='patient_profile'
    )
    doctor = models.ForeignKey(
        DoctorProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='patients'
    )
    date_of_birth = models.DateField(null=True, blank=True)
    phone_number = models.CharField(max_length=15)
    address = models.TextField()

    def __str__(self):
        return f"Patient: {self.user.username}"


# -------------------------
# VISIT MODEL
# -------------------------
class Visit(models.Model):
    patient = models.ForeignKey(
        PatientProfile,
        on_delete=models.CASCADE
    )
    doctor = models.ForeignKey(
        DoctorProfile,
        on_delete=models.CASCADE
    )
    visit_date = models.DateTimeField(auto_now_add=True)
    diagnosis = models.TextField()
    prescription = models.TextField()

    def __str__(self):
        return f"Visit - {self.patient.user.username}"
