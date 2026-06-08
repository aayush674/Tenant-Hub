from .models import (
    UserRole,
    PGCollaborator,
    CollaboratorRolePermission
)

def has_permission(user, pg_id, permission_code):
    # Is the user role owner
    if user.role==UserRole.OWNER:
        return True
    
    # Is the user role Employee 
    if user.role!=UserRole.EMPLOYEE:
        return False
    
    # Is the Employee a collaborator in PG
    assignment=PGCollaborator.objects.filter(
        employee=user,
        pg_id=pg_id
    ).first()

    if not assignment:
        return False
    
    # Is the user having permission in this role
    return CollaboratorRolePermission.objects.filter(
        role=assignment.role,
        permission__code=permission_code
    ).exists()