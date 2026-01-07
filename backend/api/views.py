from django.shortcuts import render

# Create your views here.
<<<<<<< Updated upstream
# Create your views here.
=======
>>>>>>> Stashed changes
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer


# -------------------------
# LOGIN VIEW
# -------------------------
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
