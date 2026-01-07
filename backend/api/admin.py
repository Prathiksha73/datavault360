from django.contrib import admin
from .models import DoctorProfile

@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'specialization', 'created_at')
    search_fields = ('user__username', 'specialization')
