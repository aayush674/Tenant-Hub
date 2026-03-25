from rest_framework import serializers
from .models import MaintenanceRequest, PGproperty, Payment, Room, Tenant, RoomType

class PGpropertySerializer(serializers.ModelSerializer):
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

    def validate_capacity(self, capacity):
        if capacity not in [1, 2]:
            raise serializers.ValidationError("Room capacity must be 1 or 2.")
        return capacity

    def validate_rent(self, rent):
        if rent <= 0:
            raise serializers.ValidationError("Rent must be a positive value.")
        return rent
    
class TenantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = '__all__'

    def validate_phone(self, phone):
        if len(phone) < 10:
            raise serializers.ValidationError("Phone number must be at least 10 digits.")
        return phone
    
    def validate_room(self, Room):
        current_active_tenants = Room.tenants.filter(is_active=True)

        if self.instance:  #While create, self.instance is None, while update, self.instance is the current tenant object being updated.
            current_active_tenants = current_active_tenants.exclude(id=self.instance.id)  # Exclude the current tenant from the count if it's an update operation.

        if current_active_tenants.count() >= Room.capacity:
            raise serializers.ValidationError("Room is already at full Capacity");
        return Room
    
class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
    
    def validate_amount(self, amount):
        if amount <= 0:
            raise serializers.ValidationError("Payment amount must be a positive value.")
        return amount
    
    def validate_month(self, month):
        if month < 1 or month > 12:
            raise serializers.ValidationError("This is not a valid month.")
        return month
    
    def validate_year(self, year):
        if year < 2000 or year > 2100:
            raise serializers.ValidationError("This is not a valid year.")
        return year
        
    def validate(self, data):
        if data['is_paid'] and not data.get('payment_date'):
            raise serializers.ValidationError("Payment date is required when payment is marked as paid.")
        return data

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
    
    