from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
from .views import InvitationCreateView

router = DefaultRouter()
router.register(r'doctors', views.DoctorViewSet, basename='doctor')
router.register(r'patients', views.PatientViewSet, basename='patient')
router.register(r'visits', views.VisitViewSet, basename='visit')
router.register(r'invitations', views.InvitationViewSet, basename='invitation')
router.register(r'auth', views.RegisterView, basename='auth-register')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("invitations/", InvitationCreateView.as_view()),
]