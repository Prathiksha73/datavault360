"""
WSGI config for datavault project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
<<<<<<< HEAD
https://docs.djangoproject.com/en/6.0/howto/deployment/wsgi/
=======
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
>>>>>>> 7daeb1a (Day 2 frontend)
"""

import os

from django.core.wsgi import get_wsgi_application

<<<<<<< HEAD
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "datavault.settings")

=======
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'datavault.settings')
>>>>>>> 7daeb1a (Day 2 frontend)
application = get_wsgi_application()
