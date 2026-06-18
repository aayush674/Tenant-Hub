from rest_framework import viewsets
from django.db.models import Count, Q
from .models import MaintenanceRequest, PGproperty, Room, Tenant, Payment, RoomType
from .serializers import MaintenanceRequestSerializer, PGpropertySerializer, RoomSerializer, TenantSerializer, PaymentSerializer, RoomTypeSerializer
from accounts.models import UserRole
from accounts.utils import has_permission
from rest_framework.exceptions import PermissionDenied

class PGpropertyViewSet(viewsets.ModelViewSet):
    queryset = PGproperty.objects.all()
    serializer_class = PGpropertySerializer
    def get_queryset(self):
        user=self.request.user
        print("USER:", self.request.user)
        print("ROLE:", self.request.user.role)
        if user.role==UserRole.OWNER:
            return PGproperty.objects.filter(
                owner=user
                ).annotate(
                    room_count=Count("rooms"),
                    tenant_count=Count("rooms__tenants"),
                        # available_rooms=Count('rooms', filter=Q(rooms__is_available==True))  
                )
      
        if user.role==UserRole.EMPLOYEE:
            assigned_pg_ids=user.pg_assignments.values_list(
                "pg_id",
                flat=True
            )  
            
            return PGproperty.objects.filter(
                id__in=assigned_pg_ids
            ).annotate(room_count=Count("rooms"),
                       tenant_count=Count("tenants"),
                       # available_rooms=Count('rooms', filter=Q(rooms__is_available==True))  
                       )
            
        return PGproperty.objects.none()
        
        # return PGproperty.objects.filter(owner=self.request.user).annotate(
        #     room_count=Count('rooms'),
        #     # available_rooms=Count('rooms', filter=Q(rooms__is_available==True))       
        #     ) # This ensures that users can only see their own properties.
        
        
        
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
        pg_property=self.request.query_params.get("pg_property") # type: ignore
        max_price=self.request.query_params.get("max_price")
        min_price=self.request.query_params.get("min_price")
        capacity=self.request.query_params.get("capacity")
        floor=self.request.query_params.get("room_floor")
        if pg_property:
            queryset=queryset.filter(pg_property__id=pg_property)
        if min_price:
            queryset=queryset.filter(rent__gte=min_price)
        if max_price:
            queryset=queryset.filter(rent__lte=max_price)
        if capacity:
            queryset=queryset.filter(capacity=capacity)    
        if floor:
            queryset=queryset.filter(room_floor=floor)
        return queryset

class TenantViewSet(viewsets.ModelViewSet):
    queryset = Tenant.objects.all()
    serializer_class = TenantSerializer
    def get_queryset(self):
        user=self.request.user

        if user.role==UserRole.OWNER:
            return Tenant.objects.filter(
                room__pg_property__owner=user
            )
        
        if user.role == UserRole.EMPLOYEE:
            assigned_pg_ids = []

            for assignment in user.pg_assignments.all():
                if has_permission(
                    user,
                    assignment.pg_id,
                    "view_tenants"
                ):
                    assigned_pg_ids.append(
                        assignment.pg_id
                    )
                    
            return Tenant.objects.filter(
                room__pg_property__id__in=assigned_pg_ids
            )
        
        if user.role == UserRole.TENANT:
            return Tenant.objects.filter(
                user=user
            )
        
        return Tenant.objects.none()

    def perform_create(self, serializer):
        user=self.request.user
        
        if user.role==UserRole.OWNER:
            serializer.save()
            return
        
        room=serializer.validated_data["room"]
        pg_id=room.pg_property.id
        
        if not has_permission(user, pg_id, "add_tenants"):
            raise PermissionDenied("You do not have permission to add tenants.")

        serializer.save()
        
    def perform_update(self, serializer):
        user=self.request.user
        
        if user.role==UserRole.OWNER:
            serializer.save()
            return
        
        pg_id=serializer.instance.room.pg_property.id
        
        if not has_permission(user, pg_id, "edit_tenants"):
            raise PermissionDenied("You do not have permission to edit tenants")
        
        serializer.save()
    
    def perform_destroy(self, serializer):
        user=self.request.user
        
        if user.role==UserRole.OWNER:
            serializer.delete()
            return
        
        pg_id=serializer.room.pg_property.id
        
        if not has_permission(user, pg_id, "delete_tenants"):
            raise PermissionDenied("You do not have permission to delete tenants")
        
        serializer.delete()

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer

class MaintenanceRequestViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceRequest.objects.all()
    serializer_class = MaintenanceRequestSerializer