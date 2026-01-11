import requests
import sys
import uuid

BASE_URL = 'http://127.0.0.1:8000/api'

def log(msg):
    print(f"[TEST] {msg}")

def test_flow():
    session = requests.Session()
    unique_id = str(uuid.uuid4())[:8]
    dr_user = f"dr_{unique_id}"
    pat_user = f"pat_{unique_id}"
    
    # 1. Login Admin
    log("Logging in as Admin...")
    resp = session.post(f"{BASE_URL}/auth/login/", json={'username': 'admin', 'password': 'admin'})
    if resp.status_code != 200:
        log(f"Admin Login Failed: {resp.text}")
        sys.exit(1)
    admin_token = resp.json()['access']
    headers = {'Authorization': f'Bearer {admin_token}'}
    
    # 2. Create Doctor
    log(f"Creating Doctor '{dr_user}'...")
    
    resp = requests.post(f"{BASE_URL}/doctors/", json={
        'username': dr_user,
        'password': 'password123',
        'specialization': 'General'
    }, headers=headers)
    
    if resp.status_code == 201:
        log("Doctor Created.")
    else:
        log(f"Create Doctor Failed: {resp.text}")
        sys.exit(1)

    # 3. Login as Doctor
    log("Logging in as Doctor...")
    resp = requests.post(f"{BASE_URL}/auth/login/", json={'username': dr_user, 'password': 'password123'})
    if resp.status_code != 200:
        log(f"Doctor Login Failed: {resp.text}")
        sys.exit(1)
    doctor_token = resp.json()['access']
    dr_headers = {'Authorization': f'Bearer {doctor_token}'}
    
    # 4. Create Patient
    log(f"Creating Patient '{pat_user}'...")
    resp = requests.post(f"{BASE_URL}/patients/", json={
        'username': pat_user,
        'password': 'password123',
        'date_of_birth': '1995-05-05',
        'phone_number': '555-0199',
        'address': '123 Test St'
    }, headers=dr_headers)
    
    patient_id = None
    if resp.status_code == 201:
        log("Patient Created.")
        patient_id = resp.json()['id']
    else:
        log(f"Create Patient Failed: {resp.text}")
        sys.exit(1)
        
    if not patient_id:
        log("Could not find patient ID")
        # sys.exit(1) # Continue?

    # 5. Add Visit
    log("Adding Visit...")
    resp = requests.post(f"{BASE_URL}/visits/", json={
        'patient': patient_id,
        'diagnosis': 'Test Diagnosis',
        'prescription': 'Test Rx'
    }, headers=dr_headers)
    if resp.status_code == 201:
        log("Visit Added.")
    else:
        log(f"Add Visit Failed: {resp.text}")
        sys.exit(1)

    # 6. Login as Patient
    log("Logging in as Patient...")
    resp = requests.post(f"{BASE_URL}/auth/login/", json={'username': pat_user, 'password': 'password123'})
    if resp.status_code != 200:
        log(f"Patient Login Failed: {resp.text}")
        sys.exit(1)
    pat_token = resp.json()['access']
    pat_headers = {'Authorization': f'Bearer {pat_token}'}
    
    # 7. Check History
    log("Checking History...")
    resp = requests.get(f"{BASE_URL}/visits/", headers=pat_headers)
    visits = resp.json()
    if len(visits) > 0:
        log(f"History Verified: {len(visits)} visits found.")
    else:
        log("History Empty! Failed.")
        sys.exit(1)

    # 8. Check Profile
    log("Checking Profile...")
    resp = requests.get(f"{BASE_URL}/patients/", headers=pat_headers)
    if resp.status_code == 200 and len(resp.json()) > 0:
        log("Profile Access Verified.")
    else:
        log("Profile Check Failed.")
        sys.exit(1)

    log("ALL TESTS PASSED.")

if __name__ == '__main__':
    try:
        test_flow()
    except Exception as e:
        log(f"Exception: {e}")
        sys.exit(1)
