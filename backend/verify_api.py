from api.models import DoctorProfile, PatientProfile

def verify_patient_assignment():
    doctors = DoctorProfile.objects.all()

    for doctor in doctors:
        patients = PatientProfile.objects.filter(doctor=doctor)
        print(f"\nDoctor: {doctor}")
        print("Assigned Patients:")
        for patient in patients:
            print(f"- {patient.user.username}")


if __name__ == "__main__":
    verify_patient_assignment()
