"""
URL configuration for datavault project.

The `urlpatterns` list routes URLs to views. For more information please see:
<<<<<<< HEAD
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
=======
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
>>>>>>> 7daeb1a (Day 2 frontend)
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
<<<<<<< HEAD

=======
>>>>>>> 7daeb1a (Day 2 frontend)
from django.contrib import admin
from django.urls import path

urlpatterns = [
<<<<<<< HEAD
    path("admin/", admin.site.urls),
=======
    path('admin/', admin.site.urls),
>>>>>>> 7daeb1a (Day 2 frontend)
]
