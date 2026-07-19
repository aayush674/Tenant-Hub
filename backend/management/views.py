from rest_framework import viewsets
from django.db.models import Count, Q
from .models import MaintenanceRequest, PGproperty, Room, Tenant, Payment, RoomType, Dues
from .serializers import MaintenanceRequestSerializer, PGpropertySerializer, RoomSerializer, TenantSerializer, PaymentSerializer, DueSerializer, RoomTypeSerializer
from accounts.models import UserRole
from accounts.utils import has_permission
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from datetime import date

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
            queryset = Tenant.objects.filter(
                room__pg_property__owner=user
            )
        
        elif user.role == UserRole.EMPLOYEE:
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
                    
            queryset = Tenant.objects.filter(
                room__pg_property__id__in=assigned_pg_ids
            )
        
        elif user.role == UserRole.TENANT:
            queryset = Tenant.objects.filter(
                user=user
            )
        
        
        else:
            queryset = Tenant.objects.none()
            
        pg_property = self.request.query_params.get("pg_property")
        if pg_property:
            queryset = queryset.filter(room__pg_property__id = pg_property)
        
        room = self.request.query_params.get("room")
        if room:
            queryset=queryset.filter(room = room)
            
        return queryset

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
    def get_queryset(self):
        queryset=self.queryset
        pg_property = self.request.query_params.get("pg_property")
        if pg_property:
            queryset = queryset.filter(due__tenant__room__pg_property = pg_property)
    
        return queryset

class DuesViewSet(viewsets.ModelViewSet):
    serializer_class=DueSerializer
    queryset=Dues.objects.all()
    def get_queryset(self):
        queryset=Dues.objects.all()
        tenant=self.request.query_params.get("tenant")
        status=self.request.query_params.get("status")
        exclude_status=self.request.query_params.get("exclude_status")
        pg_property = self.request.query_params.get("pg_property")
        
        if tenant:
            queryset=queryset.filter(tenant_id=tenant)
        
        if status:
            queryset=queryset.filter(status=status)
            
        if exclude_status:
            queryset=queryset.exclude(status=exclude_status)
        
        if pg_property:
            queryset=queryset.filter(tenant__room__pg_property = pg_property)
        
        return queryset
    
    @action(detail = False, methods = ["post"])
    def generate_rent_dues(self, request):
        pgId=request.data["pg_property"]
        dueDate = request.data["due_date"]
        tenants=Tenant.objects.filter(
            room__pg_property = pgId,
            is_active = True
        )
        
        created = 0
        
        for tenant in tenants:
            Dues.objects.create(
                tenant=tenant,
                due_amount = tenant.room.rent,
                due_type = "rent",
                due_date = dueDate,
                status = "pending"
            )
            created+=1
        
        return Response({
            "created": created
        })

class MaintenanceRequestViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceRequest.objects.all()
    serializer_class = MaintenanceRequestSerializer