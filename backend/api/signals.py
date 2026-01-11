from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import Group
from .models import User

@receiver(post_save, sender=User)
def assign_user_to_groups(sender, instance, created, **kwargs):
    if created:
        if instance.role == User.Role.DOCTOR:
            group, _ = Group.objects.get_or_create(name='Doctors')
            instance.groups.add(group)
        elif instance.role == User.Role.PATIENT:
            group, _ = Group.objects.get_or_create(name='Patients')
            instance.groups.add(group)
        elif instance.is_superuser:
            # Optionally add superusers to an Admin group if needed
            pass