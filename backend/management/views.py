from rest_framework import viewsets
from .models import MaintenanceRequest, PGproperty, Room, Tenant, Payment
from .serializers import MaintenanceRequestSerializer, PGpropertySerializer, RoomSerializer, TenantSerializer, PaymentSerializer


class PGpropertyViewSet(viewsets.ModelViewSet):
    queryset = PGproperty.objects.all()
    serializer_class = PGpropertySerializer

class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class TenantViewSet(viewsets.ModelViewSet):
    queryset = Tenant.objects.all()
    serializer_class = TenantSerializer

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer

class MaintenanceRequestViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceRequest.objects.all()
    serializer_class = MaintenanceRequestSerializer