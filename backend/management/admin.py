from django.contrib import admin
from .models import RoomType, PGproperty, Dues, Payment, Refund, RefundAllocations, Room, Tenant

admin.site.register(PGproperty)
admin.site.register(Room)
admin.site.register(RoomType)
admin.site.register(Dues)
admin.site.register(Payment)
admin.site.register(Refund)
admin.site.register(RefundAllocations)
admin.site.register(Tenant)
