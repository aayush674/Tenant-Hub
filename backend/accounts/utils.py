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

REQUEST_CATEGORY_LABELS = {
    "room_furniture": "Room Furniture",
    "electricity": "Electricity",
    "plumbing": "Plumbing",
    "internet": "Internet",
    "other": "Other Issue",
  };

def send_resolve_otp_mail(emails, otp, category):
    # context = {
    #         "otp": otp,
    #         "category": category
    # }
    # html_message = render_to_string(
    #     "emails/sendResolveOTP.html",
    #     context
    # )
    email = EmailMultiAlternatives(
        subject="Validate your maintainence request",
        body=f"Your maintenance request ({REQUEST_CATEGORY_LABELS[category]}) is being marked as resolved.\n\n"
                    f"OTP: {otp}\n\n"
                    "Share this OTP only if the issue has actually been fixed. "
                    "It expires in 10 minutes.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=emails,
    )
    # email.attach_alternative(html_message, "text/html")
    email.send()
