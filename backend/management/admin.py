from django.contrib import admin
from .models import RoomType, PGproperty, Dues, Payment

admin.site.register(RoomType)
admin.site.register(PGproperty)
admin.site.register(Dues)
admin.site.register(Payment)
