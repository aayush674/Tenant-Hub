from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

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
    
def send_invitation_mail(user):
    activation_link = (f"{settings.FRONTEND_URL}/activate/{user.invitation_token}")
    context = {
        "activation_link": activation_link,
    }
    html_message = render_to_string(
        "emails/activateAccount.html",
        context
    )
    email = EmailMultiAlternatives(
        subject="Welcome to Tenant Hub",
        body=f"Activate your account:\n{activation_link}",
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
    )
    email.attach_alternative(html_message, "text/html")
    email.send()