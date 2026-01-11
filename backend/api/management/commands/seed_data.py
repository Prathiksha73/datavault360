from django.core.management.base import BaseCommand
from api.models import User, DoctorProfile, PatientProfile, LabProfile
import random

INDIAN_FIRST_NAMES = [
    "Aarav", "Vihaan", "Aditya", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan", "Shaurya",
    "Aadhya", "Diya", "Saanvi", "Ananya", "Kiara", "Pari", "Riya", "Anvi", "Myra", "Aarohi",
    "Rohan", "Vikram", "Rahul", "Amit", "Suresh", "Priya", "Neha", "Sneha", "Pooja", "Anjali"
]
INDIAN_LAST_NAMES = [
    "Patel", "Sharma", "Singh", "Kumar", "Gupta", "Verma", "Yadav", "Mishra", "Reddy", "Nair",
    "Iyer", "Joshi", "Mehta", "Malhotra", "Bhat", "Saxena", "Deshmukh", "Chopra", "Kapoor", "Khan"
]
SPECIALIZATIONS = ["Cardiologist", "Dermatologist", "Pediatrician", "General Physician", "Neurologist", "Orthopedic", "Dentist", "ENT Specialist"]
LAB_NAMES = ["City Diagnostics", "Metro Path Labs", "Dr. Lal PathLabs", "Thyrocare", "Apollo Diagnostics", "Redcliffe Labs", "SRL Diagnostics", "Max Lab", "Suburban Diagnostics", "Healthians"]

def generate_indian_name():
    return f"{random.choice(INDIAN_FIRST_NAMES)} {random.choice(INDIAN_LAST_NAMES)}"

class Command(BaseCommand):
    help = 'Seeds database with realistic Indian data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Clearing existing data (except superusers)...')
        User.objects.filter(is_superuser=False).delete()
        
        doctors = []
        patient_profiles = []
        labs = []

        self.stdout.write('Creating 100 Doctors...')
        for i in range(100):
            fullname = generate_indian_name()
            username = f"dr_{fullname.lower().replace(' ', '_')}_{i}"
            user = User.objects.create_user(username=username, email=f"{username}@example.com", password='doc', role=User.Role.DOCTOR, first_name=fullname.split()[0], last_name=fullname.split()[1])
            doc = DoctorProfile.objects.create(user=user, specialization=random.choice(SPECIALIZATIONS))
            doctors.append(doc)

        self.stdout.write('Creating 10 Labs...')
        for i in range(10):
            name = LAB_NAMES[i]
            username = f"lab_{name.lower().replace(' ', '_').replace('.', '')}"
            user = User.objects.create_user(username=username, email=f"{username}@example.com", password='lab', role=User.Role.LAB)
            lab = LabProfile.objects.create(user=user, name=name, address=f"Sector {random.randint(1, 100)}, Delhi")
            labs.append(lab)

        self.stdout.write('Creating 100 Patients...')
        for i in range(100):
            fullname = generate_indian_name()
            username = f"{fullname.lower().replace(' ', '_')}_{i}"
            user = User.objects.create_user(username=username, email=f"{username}@example.com", password='pat', role=User.Role.PATIENT, first_name=fullname.split()[0], last_name=fullname.split()[1])
            

            assigned_doctors = random.sample(doctors, k=random.randint(1, 3))
            
            patient = PatientProfile.objects.create(
                user=user, 
                date_of_birth=f"{random.randint(1960, 2010)}-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}",
                phone_number=f"+91{random.randint(7000000000, 9999999999)}",
                address_line=f"Flat {random.randint(100, 999)}, Tower {random.choice(['A', 'B', 'C'])}",
                city="Mumbai",
                state="Maharashtra",
                postal_code="400001",
                country="India",
                gender=random.choice(['male', 'female'])
            )
            patient.doctors.set(assigned_doctors)
            
        self.stdout.write(self.style.SUCCESS('Successfully seeded database!'))
