import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'datavault.settings')
django.setup()

from api.models import Room, PatientProfile

def seed_rooms():
    # Clear existing rooms
    print("Clearing existing rooms...")
    Room.objects.all().delete()
    
    room_types = ['GENERAL', 'ICU', 'PRIVATE', 'SEMI']
    specialities = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Surgery', 'Internal Medicine', 'Oncology', 'Emergency']
    
    print("Creating 50 rooms...")
    rooms = []
    # Create 50 rooms with numbers 101 to 150
    for i in range(1, 51):
        r_type = random.choice(room_types)
        spec = random.choice(specialities)
        room_num = f"{100 + i}" 
        room = Room(room_number=room_num, room_type=r_type, speciality=spec)
        room.save()
        rooms.append(room)
        
    print(f"Created {len(rooms)} rooms.")
    
    # Assign Patients
    patients = list(PatientProfile.objects.all())
    count = len(patients)
    print(f"Found {count} patients in database.")
    
    if count < 40:
        print(f"Warning: Only {count} patients available. Will assign all valid patients.")
        patients_to_assign = patients
    else:
        patients_to_assign = random.sample(patients, 40)
        
    print(f"Assigning {len(patients_to_assign)} patients to rooms...")
    
    # Shuffle rooms to pick random ones for assignment
    random.shuffle(rooms)
    
    assigned_count = 0
    for i, patient in enumerate(patients_to_assign):
        # Double check if patient doesn't have room (though we cleared rooms, OneToOne reverse might be lingering if dirty? No, deleting Room object clears it)
        try:
            room = rooms[i]
            room.patient = patient
            room.save()
            assigned_count += 1
        except Exception as e:
            print(f"Error assigning {patient}: {e}")
        
    print("------------------------------------------------")
    print("Seeding Complete Summary:")
    print(f"Total Rooms Created: {Room.objects.count()}")
    print(f"Total Patients Assigned: {Room.objects.filter(patient__isnull=False).count()}")
    print(f"Total Empty Rooms: {Room.objects.filter(patient__isnull=True).count()}")
    print("------------------------------------------------")

if __name__ == '__main__':
    seed_rooms()
