from rest_framework.routers import DefaultRouter
from .views import MaintenanceRequestViewSet, PGpropertyViewSet, PaymentViewSet, RoomViewSet, TenantViewSet

router=DefaultRouter()
router.register(r'pgs', PGpropertyViewSet)
router.register(r'rooms', RoomViewSet)
router.register(r'tenants',TenantViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'maintenance-requests', MaintenanceRequestViewSet)

urlpatterns=router.urls