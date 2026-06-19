from django.db import models
from django.conf import settings

class PGproperty(models.Model):  # This creates a database table, django automatically creates id primary key.
    owner=models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE) # This creates a foreign key relationship with the User model, and related_name allows us to access properties from a user instance. Cascade means if a user is deleted, all associated properties will also be deleted.
    name = models.CharField(max_length=100)
    address_line_1=models.TextField(max_length=225, blank=True)
    address_line_2 = models.TextField(max_length=225, blank=True)
    city=models.TextField(max_length=100, blank=True)
    state=models.TextField(max_length=100, blank=True)
    country=models.TextField(max_length=100, default="India", blank=True)
    postal_code=models.TextField(max_length=10, blank=True)
    total_floors=models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class RoomType(models.Model):
    pg_property=models.ForeignKey(PGproperty, on_delete=models.CASCADE)
    name=models.CharField(max_length=30)
    rent=models.DecimalField(max_digits=10, decimal_places=2)
    capacity=models.IntegerField()
    is_balcony_room=models.BooleanField(default=False)
    created_at=models.DateTimeField(auto_now_add=True)

class Room(models.Model):
    pg_property = models.ForeignKey(PGproperty, related_name='rooms', on_delete=models.CASCADE) #This creates a foreign key relationship with PGproperty, and related_name allows us to access rooms from a PGproperty instance. Cascade means if a PGproperty is deleted, all associated rooms will also be deleted.
    room_number = models.CharField(max_length=10)
    room_type=models.ForeignKey(RoomType, on_delete=models.SET_NULL, null=True, blank=True)

    #ACTUAL STORED VALUES:- Can override Room Type values
    capacity = models.IntegerField()
    rent = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    is_balcony_room=models.BooleanField(default=False)
    room_floor=models.IntegerField()
    # is_available = models.BooleanField(default=True)
    def save(self, *args, **kwargs):
        try:
            self.room_floor=int(self.room_number)//100
        except ValueError:
            self.room_floor=0
        super().save(*args, **kwargs)

    class Meta:
        constraints=[
            models.UniqueConstraint(
                fields=["pg_property", "room_number"],
                name="unique_room_per_pg"
            )
        ]

    def __str__(self):
        return f"{self.pg_property.name} - Room {self.room_number}"
    
class Tenant(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tenant_profile"
    )
    room = models.ForeignKey(Room, related_name='tenants', on_delete=models.CASCADE)
    first_name = models.CharField(max_length=100)
    last_name=models.CharField(max_length=100)
    email = models.EmailField()
    phone_number = models.CharField(max_length=15)
    join_date = models.DateField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} - Room {self.room.room_number}"

class Payment(models.Model):
    tenant = models.ForeignKey(Tenant, related_name='payments', on_delete=models.SET_NULL, null=True) # If a tenant is deleted, we set the tenant field to null instead of deleting the payment record.
    month = models.IntegerField()
    year = models.IntegerField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateField()
    is_paid = models.BooleanField(default=False)
    payment_method = models.CharField(max_length=50)

    class Meta:
        unique_together = ("tenant", "month", "year")
    def __str__(self):
        return f"{self.tenant} - {self.month}/{self.year} - {'Paid' if self.is_paid else 'Unpaid'}"

class MaintenanceRequest(models.Model):
    room = models.ForeignKey(Room, related_name='maintenance_requests', on_delete=models.SET_NULL, null=True) # If a room is deleted, we set the room field to null instead of deleting the maintenance request.
    description = models.TextField()
    request_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices = [('pending', 'Pending'), ('in_progress', 'In Progress'), ('resolved', 'Resolved')], default='pending')

    def __str__(self):
        room_number = self.room.room_number if self.room else "Deleted Room"
        return f"Room {room_number} - {self.status}"