from django.contrib import admin
from .models import (
    User,
    Permission,
    CollaboratorRole,
    CollaboratorRolePermission,
    PGCollaborator
)

admin.site.register(User)
admin.site.register(Permission)
admin.site.register(CollaboratorRole)
admin.site.register(CollaboratorRolePermission)
admin.site.register(PGCollaborator)