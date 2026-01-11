import os
import django
import sys

# Setup Django environment
sys.path.append('/Users/viditparashar/Downloads/DataVault360New/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'datavault.settings')
django.setup()

from api.models import User, DoctorProfile, PatientProfile
from rest_framework.test import APIRequestFactory, force_authenticate
from api.views import PatientViewSet, DoctorViewSet
from api.serializers import PatientProfileSerializer

def verify_flow():
    print("--- Starting Verification Flow ---")
    
    # 1. Setup Data
    print("\n1. Setting up test users...")
    admin_user, _ = User.objects.get_or_create(username='test_admin', role=User.Role.ADMIN)
    
    doctor_user, _ = User.objects.get_or_create(username='test_doc_1', role=User.Role.DOCTOR)
    if not hasattr(doctor_user, 'doctor_profile'):
        DoctorProfile.objects.create(user=doctor_user, specialization='General')
    doctor_profile = doctor_user.doctor_profile
    
    doctor_user_2, _ = User.objects.get_or_create(username='test_doc_2', role=User.Role.DOCTOR)
    if not hasattr(doctor_user_2, 'doctor_profile'):
        DoctorProfile.objects.create(user=doctor_user_2, specialization='Surgeon')
    doctor_profile_2 = doctor_user_2.doctor_profile

    # 2. Test Doctor Creating Patient (Auto-assignment)
    print("\n2. Testing Doctor Creating Patient (Auto-assignment)...")
    factory = APIRequestFactory()
    view = PatientViewSet.as_view({'post': 'create'})
    
    patient_data = {
        'username': 'patient_by_doc',
        'password': 'password123',
        'date_of_birth': '2000-01-01',
        'first_name': 'Pat',
        'last_name': 'Doc'
    }
    
    # Clean up previous run
    User.objects.filter(username='patient_by_doc').delete()
    
    request = factory.post('/api/patients/', patient_data, format='json')
    force_authenticate(request, user=doctor_user)
    response = view(request)
    
    if response.status_code == 201:
        patient_id = response.data['id']
        patient = PatientProfile.objects.get(id=patient_id)
        print(f"PASS: Patient created. Assigned Doctor ID: {patient.doctor_id}")
        if patient.doctor_id == doctor_profile.id:
            print(f"PASS: Patient correctly assigned to creating doctor (ID: {doctor_profile.id})")
        else:
            print(f"FAIL: Patient assigned to {patient.doctor_id}, expected {doctor_profile.id}")
            
        # Verify User created
        if patient.user.username == 'patient_by_doc':
             print(f"PASS: User account created for patient.")
    else:
        print(f"FAIL: Support creation failed. Status: {response.status_code}, Errors: {response.data}")

    # 3. Test Admin Creating Patient (Manual Assignment)
    print("\n3. Testing Admin Creating Patient (Manual Assignment)...")
    
    patient_admin_data = {
        'username': 'patient_by_admin',
        'password': 'password123',
        'date_of_birth': '1990-01-01',
        'doctor_id': doctor_profile_2.id
    }
    
    # Clean up
    User.objects.filter(username='patient_by_admin').delete()
    
    request = factory.post('/api/patients/', patient_admin_data, format='json')
    force_authenticate(request, user=admin_user)
    response = view(request)
    
    if response.status_code == 201:
        patient_id = response.data['id']
        patient = PatientProfile.objects.get(id=patient_id)
        print(f"PASS: Patient created by Admin. Assigned Doctor ID: {patient.doctor_id}")
        if patient.doctor_id == doctor_profile_2.id:
            print(f"PASS: Patient correctly assigned to specified doctor (ID: {doctor_profile_2.id})")
        else:
            print(f"FAIL: Patient assigned to {patient.doctor_id}, expected {doctor_profile_2.id}")
    else:
        print(f"FAIL: Admin creation failed. Status: {response.status_code}, Errors: {response.data}")
        
    # 4. Test Admin Re-assigning Doctor
    print("\n4. Testing Admin Re-assigning Doctor...")
    if 'patient' in locals(): # reuse patient created by admin
        view_update = PatientViewSet.as_view({'patch': 'partial_update'})
        
        update_data = {'doctor_id': doctor_profile.id}
        request = factory.patch(f'/api/patients/{patient.id}/', update_data, format='json')
        force_authenticate(request, user=admin_user)
        response = view_update(request, pk=patient.id)
        
        if response.status_code == 200:
            patient.refresh_from_db()
            print(f"PASS: Patient update successful. New Doctor ID: {patient.doctor_id}")
            if patient.doctor_id == doctor_profile.id:
                print(f"PASS: Patient correctly re-assigned to doctor {doctor_profile.id}")
            else:
                print(f"FAIL: Patient assigned to {patient.doctor_id}, expected {doctor_profile.id}")
        else:
             print(f"FAIL: Update failed. Status: {response.status_code}, Errors: {response.data}")

if __name__ == '__main__':
    verify_flow()
