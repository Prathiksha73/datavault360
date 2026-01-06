from django.shortcuts import render

# Create your views here.
<<<<<<< HEAD
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer


# -------------------------
# LOGIN VIEW
# -------------------------
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
=======
>>>>>>> b49c53f (Initialized BACKEND)
