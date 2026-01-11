from django.core.management.base import BaseCommand
from api.models import User, LabProfile

class Command(BaseCommand):
    help = 'Seeds the database with default Lab users'

    def handle(self, *args, **kwargs):
        labs = [
            "XRay Lab", "MRI Center", "Blood Test Path", "City Pathology", 
            "CT Scan Diagnostics", "Ultrasound Imaging", "Heart ECG Lab", 
            "Dental Radiography", "Eye Care Optics", "ENT Diagnostics"
        ]

        for lab_name in labs:
            username = lab_name.split()[0].lower()
            if not User.objects.filter(username=username).exists():
                user = User.objects.create_user(
                    username=username,
                    email=f"{username}@example.com",
                    password="password123",
                    role=User.Role.LAB
                )
                LabProfile.objects.create(
                    user=user,
                    name=lab_name,
                    address="123 Health St"
                )
                self.stdout.write(self.style.SUCCESS(f'Created lab: {lab_name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Lab already exists: {lab_name}'))
