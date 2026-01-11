from rest_framework import serializers
from .models import User, DoctorProfile, PatientProfile, Visit, Invitation

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role']

class DoctorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    password = serializers.CharField(write_only=True, required=False)
    username = serializers.CharField(write_only=True, required=False)
    specialization = serializers.CharField(required=False)

    class Meta:
        model = DoctorProfile
        fields = ['id', 'user', 'specialization', 'password', 'username']

    def create(self, validated_data):
        user_data = {}
        if 'username' in validated_data:
            user_data['username'] = validated_data.pop('username')
        if 'password' in validated_data:
            user_data['password'] = validated_data.pop('password')
        
        # Create user
        user = User.objects.create_user(role=User.Role.DOCTOR, **user_data)
        
        doctor = DoctorProfile.objects.create(user=user, **validated_data)
        return doctor

class PatientProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    doctor = DoctorProfileSerializer(read_only=True)
    password = serializers.CharField(write_only=True, required=False)
    username = serializers.CharField(write_only=True, required=False)
    doctor_id = serializers.IntegerField(write_only=True, required=False)
    doctor_name = serializers.CharField(source='doctor.user.username', read_only=True)

    class Meta:
        model = PatientProfile
        fields = ['id', 'user', 'doctor', 'doctor_id', 'doctor_name', 'date_of_birth', 'phone_number', 'address', 'profile_photo', 'password', 'username']
        read_only_fields = ['doctor']

    def create(self, validated_data):
        user_data = {}
        if 'username' in validated_data:
            user_data['username'] = validated_data.pop('username')
        if 'password' in validated_data:
            user_data['password'] = validated_data.pop('password')
            
        doctor_id = validated_data.pop('doctor_id', None)
        
        user = User.objects.create_user(role=User.Role.PATIENT, **user_data)
        
        patient = PatientProfile.objects.create(user=user, doctor_id=doctor_id, **validated_data)
        return patient

    def update(self, instance, validated_data):
        if 'doctor_id' in validated_data:
            doctor_id = validated_data.pop('doctor_id')
            instance.doctor_id = doctor_id
        
        # Allow updating other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

class VisitSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.user.username', read_only=True)
    doctor_name = serializers.CharField(source='doctor.user.username', read_only=True)

    class Meta:
        model = Visit
        fields = ['id', 'patient', 'doctor', 'visit_date', 'diagnosis', 'prescription', 'patient_name', 'doctor_name']
        read_only_fields = ['doctor']

class InvitationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invitation
        fields = ['id', 'email', 'token', 'role', 'is_used', 'created_at']
        read_only_fields = ['token', 'is_used', 'created_at']

class RegisterSerializer(serializers.ModelSerializer):
    token = serializers.UUIDField(write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'first_name', 'last_name', 'email', 'token']

    def create(self, validated_data):
        token = validated_data.pop('token')
        password = validated_data.pop('password')
        
        try:
            invitation = Invitation.objects.get(token=token, is_used=False)
        except Invitation.DoesNotExist:
            raise serializers.ValidationError({"token": "Invalid or expired invitation token."})

        # Create user
        user = User.objects.create_user(
            role=invitation.role,
            password=password,
            **validated_data
        )

        # Create profile
        if invitation.role == User.Role.DOCTOR:
            DoctorProfile.objects.create(user=user)
        elif invitation.role == User.Role.PATIENT:
            PatientProfile.objects.create(
                user=user,
                doctor=invitation.doctor
            )

        # Mark invite as used
        invitation.is_used = True
        invitation.save()

        return user