from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        DOCTOR = "DOCTOR", "Doctor"
        PATIENT = "PATIENT", "Patient"
        LAB = "LAB", "Lab"

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
    doctors = models.ManyToManyField(DoctorProfile, related_name='patients', blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=[('male', 'Male'), ('female', 'Female'), ('other', 'Other'), ('unknown', 'Unknown')], default='unknown')
    phone_number = models.CharField(max_length=15, blank=True)

    address_line = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, blank=True)
    active = models.BooleanField(default=True)
    
    @property
    def full_address(self):
        return f"{self.address_line}, {self.city}, {self.state} {self.postal_code}, {self.country}"

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

class LabProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='lab_profile')
    name = models.CharField(max_length=255)
    address = models.TextField(blank=True)

    def __str__(self):
        return self.name

class LabTestRequest(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
    )

    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='lab_requests')
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='lab_requests_created')
    lab = models.ForeignKey(LabProfile, on_delete=models.CASCADE, related_name='test_requests')
    test_names = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    report_file = models.FileField(upload_to='lab_reports/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Test for {self.patient} by {self.lab}"


    def __str__(self):
        return f"Test for {self.patient} by {self.lab}"

class Invitation(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('USED', 'Used'),
    )
    email = models.EmailField()
    role = models.CharField(max_length=50, choices=User.Role.choices)
    token = models.UUIDField(unique=True)
    invited_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_invitations')
    extra_data = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Invite for {self.email} ({self.role})"

class Room(models.Model):
    ROOM_TYPES = (
        ('GENERAL', 'General Ward'),
        ('ICU', 'ICU'),
        ('PRIVATE', 'Private Room'),
        ('SEMI', 'Semi-Private Room'),
    )
    
    STATUS_CHOICES = (
        ('ACTIVE', 'Active'),
        ('MAINTENANCE', 'Under Maintenance'),
    )

    room_number = models.CharField(max_length=20, unique=True)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPES, default='GENERAL')
    room_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    speciality = models.CharField(max_length=100, blank=True)
    # Patient assigned to this room. A patient can be in only one room.
    patient = models.OneToOneField(PatientProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_room')
    scheduled_discharge = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Room {self.room_number} ({self.room_type})"


class InventoryItem(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50, blank=True)
    quantity = models.IntegerField(default=0)
    unit = models.CharField(max_length=20, default='units')
    low_stock_threshold = models.IntegerField(default=10)
    cost_per_unit = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.quantity} {self.unit})"

class FinancialRecord(models.Model):
    TXN_TYPES = (
        ('INCOME', 'Income'),
        ('EXPENSE', 'Expense'),
    )
    
    transaction_type = models.CharField(max_length=10, choices=TXN_TYPES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    category = models.CharField(max_length=50) # e.g. 'Consultation', 'Salary', 'Equipment'
    description = models.CharField(max_length=200, blank=True)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.transaction_type}: {self.amount} on {self.date}"
