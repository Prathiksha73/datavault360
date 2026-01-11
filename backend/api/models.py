from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        DOCTOR = "DOCTOR", "Doctor"
        PATIENT = "PATIENT", "Patient"

    role = models.CharField(max_length=50, choices=Role.choices, default=Role.ADMIN)

    def save(self, *args, **kwargs):
        if not self.pk and self.is_superuser:
            self.role = self.Role.ADMIN
        return super().save(*args, **kwargs)

class DoctorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    specialization = models.CharField(max_length=100, blank=True)
    
    def __str__(self):
        return f"Dr. {self.user.username}"

class PatientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile')
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.SET_NULL, null=True, related_name='patients')
    date_of_birth = models.DateField(null=True, blank=True)
    phone_number = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    profile_photo = models.URLField(max_length=500, blank=True, null=True)

    def __str__(self):
        return self.user.username

class Visit(models.Model):
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='visits')
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='visits_conducted')
    visit_date = models.DateTimeField(auto_now_add=True)
    diagnosis = models.TextField()
    prescription = models.TextField()

    def __str__(self):
        return f"Visit: {self.patient} - {self.visit_date.date()}"

class Invitation(models.Model):
    email = models.EmailField()
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    role = models.CharField(max_length=50, choices=User.Role.choices)
    inviter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_invitations')
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, null=True, blank=True) # If doctor invites patient, link them
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Invite to {self.email} as {self.role}"