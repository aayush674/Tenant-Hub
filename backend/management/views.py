from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import MaintenanceRequest, PGproperty, Room, Tenant, Payment, RoomType
from .serializers import MaintenanceRequestSerializer, PGpropertySerializer, RoomSerializer, TenantSerializer, PaymentSerializer, RoomTypeSerializer


class PGpropertyViewSet(viewsets.ModelViewSet):
    queryset = PGproperty.objects.all()
    serializer_class = PGpropertySerializer
    def get_queryset(self):
        return PGproperty.objects.filter(owner=self.request.user) # This ensures that users can only see their own properties.
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user) # This automatically sets the owner of the property to the currently authenticated user when a new property is created.

class RoomTypeViewSet(viewsets.ModelViewSet):
    queryset=RoomType.objects.all()
    serializer_class=RoomTypeSerializer

    def get_queryset(self):
        queryset=RoomType.objects.all()
        pg_property=self.request.query_params.get("pg_property")
        if pg_property:
            queryset=queryset.filter(pg_property__id=pg_property)
        return queryset

class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    
    def get_queryset(self):
        queryset=Room.objects.all()
        pg_property=self.request.query_params.get("pg_property")
        max_price=self.request.query_params.get("max_price")
        min_price=self.request.query_params.get("min_price")
        capacity=self.request.query_params.get("capacity")
        if pg_property:
            queryset=queryset.filter(pg_property__id=pg_property)
        if min_price:
            queryset=queryset.filter(rent__gte=min_price)
        if max_price:
            queryset=queryset.filter(rent__lte=max_price)
        if capacity:
            queryset=queryset.filter(capacity=capacity)    
        return queryset

class TenantViewSet(viewsets.ModelViewSet):
    queryset = Tenant.objects.all()
    serializer_class = TenantSerializer

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer

class MaintenanceRequestViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceRequest.objects.all()
    serializer_class = MaintenanceRequestSerializer