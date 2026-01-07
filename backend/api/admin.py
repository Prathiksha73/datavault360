from django.contrib import admin
from .models import DoctorProfile, PatientProfile


@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'specialization', 'created_at')
    search_fields = ('user__username', 'specialization')


@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'doctor', 'created_at')
    search_fields = ('user__username',)
    list_filter = ('doctor',)
