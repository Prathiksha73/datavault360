from django.db import models

from django.contrib.auth.models import AbstractUser

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
