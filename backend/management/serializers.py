from rest_framework import serializers
from .models import MaintenanceRequest, PGproperty, Payment, Room, Tenant, RoomType, Dues
from django.db import transaction
from accounts.models import User
import uuid
from datetime import timedelta
from django.utils import timezone
from accounts.utils import send_invitation_mail

class PGpropertySerializer(serializers.ModelSerializer):
    room_count=serializers.IntegerField(read_only=True)
    tenant_count=serializers.IntegerField(read_only=True)
    class Meta:
        model = PGproperty
        fields = '__all__'
        read_only_fields = ['owner']  # This ensures that the owner field is read-only and when user create PG, frontend doesn't have to send owner field, it will be automatically set to the currently authenticated user in the viewset.

    def validate_total_floors(self, total_floors):
        if total_floors < 1:
            raise serializers.ValidationError("Total floors must be at least 1.")
        return total_floors

class RoomTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model=RoomType
        fields='__all__'

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'
        read_only_fields=['room_floor']

    def validate_capacity(self, capacity):
        if capacity not in [1, 2]:
            raise serializers.ValidationError("Room capacity must be 1 or 2.")
        return capacity

    def validate_rent(self, rent):
        if rent <= 0:
            raise serializers.ValidationError("Rent must be a positive value.")
        return rent
    
class TenantSerializer(serializers.ModelSerializer):
    room_number = serializers.CharField(
        source="room.room_number",
        read_only=True
    )
    class Meta:
        model = Tenant
        fields = '__all__'

    def validate_phone_number(self, phone_number):
        if len(phone_number) < 10:
            raise serializers.ValidationError("Phone number must be at least 10 digits.")
        return phone_number
    
    def validate_room(self, Room):
        current_active_tenants = Room.tenants.filter(is_active=True)

        if self.instance:  #While create, self.instance is None, while update, self.instance is the current tenant object being updated.
            current_active_tenants = current_active_tenants.exclude(id=self.instance.id)  # Exclude the current tenant from the count if it's an update operation.

        if current_active_tenants.count() >= Room.capacity:
            raise serializers.ValidationError("Room is already at full Capacity");
        return Room
    
    @transaction.atomic
    def create(self, validated_data):
        email = validated_data["email"]
        
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({
                "email": "A user with this email address already exists."
            })
        
        user=User.objects.create_user(
            email=email,
            role="TENANT",
            is_active=False,
            invitation_token=uuid.uuid4(),
            invitation_expires=timezone.now()+timedelta(days=7)
        )
        
        tenant=Tenant.objects.create(
            user=user,
            **validated_data
        )
        
        Dues.objects.create(
            tenant = tenant,
            due_amount = 5000,
            due_date = timezone.now().date() + timedelta(days=3),
            due_type = "security"
        )
        
        send_invitation_mail(user)
        
        return tenant
    
class PaymentSerializer(serializers.ModelSerializer):
    tenant_name=serializers.SerializerMethodField()
    class Meta:
        model = Payment
        fields = '__all__'
    
    def validate_amount(self, amount):
        if amount <= 0:
            raise serializers.ValidationError("Payment amount must be a positive value.")
        return amount
    
    def get_tenant_name(self, obj):
        if obj.due.tenant:
            return f"{obj.due.tenant.first_name} {obj.due.tenant.last_name}"
        return None
    
    @transaction.atomic
    def create(self, validated_data):
        due=validated_data["due"]
        amount=validated_data["amount"]
        payment=Payment.objects.create(**validated_data)
        due.paid_amount+=amount
        if due.paid_amount >= due.due_amount:
            due.status = "paid"
        elif due.paid_amount > 0:
            due.status = "partial"
        else:
            due.status = "pending"
        
        due.save(update_fields=["paid_amount", "status"])
        return payment
    
    def validate(self, x):
        due=x["due"]
        amount=x["amount"]
        remaining_amount = due.due_amount - due.paid_amount
        if amount > remaining_amount:
            raise serializers.ValidationError({
                "amount": "Payment exceeds remaining due amount"
            })        
        return x

class DueSerializer(serializers.ModelSerializer):
    tenant_name=serializers.SerializerMethodField()
    class Meta:
        model=Dues
        fields='__all__'
        
    def get_tenant_name(self, obj):
        if obj.tenant:
            return f"{obj.tenant.first_name} {obj.tenant.last_name}"
        return None
        
class MaintenanceRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceRequest
        fields = '__all__'

    def validate_status(self, status):
        valid_statuses = ['pending', 'in_progress', 'resolved']
        if status not in valid_statuses:
            raise serializers.ValidationError("Not a valid status.")
        return status
    
    def validate_description(self, description):
        if len(description) < 10:
            raise serializers.ValidationError("Description must be at least 10 characters long.")
        return description
    
    