"""
ASGI config for datavault project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

<<<<<<< HEAD
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "datavault.settings")
=======
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'datavault.settings')
>>>>>>> b49c53f (Initialized BACKEND)

application = get_asgi_application()
