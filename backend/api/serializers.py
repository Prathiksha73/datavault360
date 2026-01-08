from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, DoctorProfile, PatientProfile, Visit


# -------------------------
# USER SERIALIZER
# -------------------------
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'role']


# -------------------------
# JWT LOGIN SERIALIZER
# -------------------------
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user_id'] = self.user.id
        data['username'] = self.user.username
        data['role'] = self.user.role
        return data


# -------------------------
# DOCTOR SERIALIZER
# -------------------------
class DoctorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = DoctorProfile
        fields = ['id', 'user', 'specialization']


# -------------------------
# PATIENT SERIALIZER
# -------------------------
class PatientProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    doctor = DoctorProfileSerializer(read_only=True)

    class Meta:
        model = PatientProfile
        fields = [
            'id', 'user', 'doctor',
            'date_of_birth', 'phone_number', 'address'
        ]


# -------------------------
# VISIT SERIALIZER
# -------------------------
class VisitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visit
        fields = '__all__'
