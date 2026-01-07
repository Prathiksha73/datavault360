from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, DoctorProfile, PatientProfile, Visit


# -------------------------------------------------
# USER SERIALIZER
# Used to display user details in Doctor/Patient APIs
# -------------------------------------------------
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role']


# -------------------------------------------------
# JWT LOGIN SERIALIZER (DAY 1)
# Adds role & user info to login response
# -------------------------------------------------
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user_id'] = self.user.id
        data['username'] = self.user.username
        data['role'] = self.user.role
        return data


# -------------------------------------------------
# DOCTOR PROFILE SERIALIZER (DAY 2)
# - Creates User + DoctorProfile together
# - Only Admin can create doctor
# -------------------------------------------------
class DoctorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    # These fields are required while creating doctor
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = DoctorProfile
        fields = ['id', 'user', 'specialization', 'username', 'password']

    def create(self, validated_data):
        # Extract login credentials
        username = validated_data.pop('username')
        password = validated_data.pop('password')

        # Create user with DOCTOR role
        user = User.objects.create_user(
            username=username,
            password=password,
            role=User.Role.DOCTOR
        )

        # Create doctor profile
        doctor = DoctorProfile.objects.create(
            user=user,
            **validated_data
        )
        return doctor


# -------------------------------------------------
# PATIENT PROFILE SERIALIZER (DAY 3)
# - Creates User + PatientProfile together
# - Doctor can auto-assign himself
# -------------------------------------------------
class PatientProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)

    # Used only by Admin while assigning doctor
    doctor_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = PatientProfile
        fields = [
            'id', 'user', 'doctor', 'doctor_id',
            'date_of_birth', 'phone_number', 'address',
            'username', 'password'
        ]
        read_only_fields = ['doctor']

    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        doctor_id = validated_data.pop('doctor_id', None)

        # Create user with PATIENT role
        user = User.objects.create_user(
            username=username,
            password=password,
            role=User.Role.PATIENT
        )

        # Create patient profile
        patient = PatientProfile.objects.create(
            user=user,
            doctor_id=doctor_id,
            **validated_data
        )
        return patient


# -------------------------------------------------
# VISIT SERIALIZER (DAY 4 - SUPPORTING FEATURE)
# Shows doctor & patient names
# -------------------------------------------------
class VisitSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(
        source='patient.user.username',
        read_only=True
    )
    doctor_name = serializers.CharField(
        source='doctor.user.username',
        read_only=True
    )

    class Meta:
        model = Visit
        fields = [
            'id', 'patient', 'doctor',
            'visit_date', 'diagnosis', 'prescription',
            'patient_name', 'doctor_name'
        ]
        read_only_fields = ['doctor']
