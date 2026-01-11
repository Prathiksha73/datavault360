from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DoctorViewSet, PatientViewSet, VisitViewSet, CustomTokenObtainPairView, LabViewSet, LabTestRequestViewSet, InvitationViewSet, RoomViewSet, AnalyticsViewSet

router = DefaultRouter()
router.register(r'doctors', DoctorViewSet, basename='doctor')
router.register(r'patients', PatientViewSet, basename='patient')
router.register(r'visits', VisitViewSet, basename='visit')
router.register(r'labs', LabViewSet, basename='lab')
router.register(r'lab-tests', LabTestRequestViewSet, basename='lab-tests')
router.register(r'invitations', InvitationViewSet, basename='invitation')
router.register(r'rooms', RoomViewSet, basename='room')
router.register(r'analytics', AnalyticsViewSet, basename='analytics')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
]
