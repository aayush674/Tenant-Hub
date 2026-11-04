from rest_framework import viewsets
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.db.models import Count, Q
from .models import MaintenanceRequest, PGproperty, Room, Tenant, Payment, RoomType, Dues, update_overdue_dues, Refund
from .serializers import MaintenanceRequestSerializer, PGpropertySerializer, RoomSerializer, TenantSerializer, PaymentSerializer, DueSerializer, RoomTypeSerializer, RefundSerializer
from accounts.models import UserRole, User
from accounts.serializers import UserSerializer
from accounts.utils import has_permission
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from datetime import date, timedelta
import uuid
from accounts.utils import send_invitation_mail, send_resolve_otp_mail
from django.db import transaction
import secrets
from django.contrib.auth.hashers import make_password, check_password
import logging
logger = logging.getLogger(__name__)

OTP_TTL = timedelta(minutes=1)
RESEND_COOLDOWN = timedelta(seconds=60)
MAX_OTP_ATTEMPTS = 5

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
        queryset = Room.objects.annotate(
            occupied=Count(
                "tenants",
                filter = Q(tenants__is_active = True)
                )
        )
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

        if user.role!=UserRole.OWNER:
            pg_id=serializer.room.pg_property.id
            if not has_permission(user, pg_id, "delete_tenants"):
                raise PermissionDenied("You do not have permission to delete tenants")

        with transaction.atomic():
            linked_user = serializer.user
            serializer.delete()

            if linked_user:
                linked_user.is_active = False
                linked_user.invitation_token = None
                linked_user.invitation_expires = None
                linked_user.save(update_fields = ["is_active", "invitation_token", "invitation_expires"])

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(detail=False, methods = ["post"])
    def resend_activation(self, request):
        email = request.data.get("email")

        if not email:
            return Response({"email": "Email is not valid"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email = email, is_active = False).first()

        if not user:
            return Response({"detail": "User with this email either does not exist or is already activate"}, status=status.HTTP_400_BAD_REQUEST)

        user.invitation_token = uuid.uuid4()
        user.invitation_expires = timezone.now() + timedelta(days=7)
        user.save(update_fields=["invitation_token", "invitation_expires"])
        send_invitation_mail(user)

        return Response({"detail": "Account activation mail sent successfully"}, status=status.HTTP_200_OK)

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
    serializer_class = DueSerializer
    queryset = Dues.objects.all()

    def get_queryset(self):
        update_overdue_dues()
        user = self.request.user

        # Tenant can only see their own dues
        if user.role == UserRole.TENANT:
            return Dues.objects.filter(
                tenant__user=user
            )

        # Existing owner/employee filtering
        queryset = Dues.objects.all()

        tenant = self.request.query_params.get("tenant")
        status = self.request.query_params.get("status")
        exclude_status = self.request.query_params.get("exclude_status")
        pg_property = self.request.query_params.get("pg_property")

        if tenant:
            queryset = queryset.filter(tenant_id=tenant)

        if status == "!paid":
            queryset = queryset.exclude(status="paid")
        elif status:
            queryset = queryset.filter(status=status)

        if exclude_status:
            queryset = queryset.exclude(status=exclude_status)

        if pg_property:
            queryset = queryset.filter(
                tenant__room__pg_property=pg_property
            )

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

class RefundViewSet(viewsets.ModelViewSet):
    queryset = Refund.objects.all()
    serializer_class = RefundSerializer

    @action(detail = True, methods = ["post"])
    def approve(self, request, pk=None):
        refund = self.get_object()
        refund.status = "approved"
        refund.save(update_fields = ["status"])
        return Response(RefundSerializer(refund).data)

    @action(detail = True, methods = ["post"])
    def process(self, request, pk = None):

        refund = self.get_object()
        if refund.status == "processed":
            return Response({"detail": "Refund is already processed"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            refund.process()
        except ValidationError as e:
            return Response({"detail": str(e)}, status = 400)
        refund.processed_by = request.user
        refund.save(update_fields = ["processed_by"])
        return Response(RefundSerializer(refund).data)

    @action(detail = True, methods = ["post"])
    def reject(self, request, pk = None):
        refund = self.get_object()
        refund.status = "rejected"
        refund.save(update_fields = ["status"])
        return Response(RefundSerializer(refund).data)


class MaintenanceRequestViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceRequest.objects.all()
    serializer_class = MaintenanceRequestSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = MaintenanceRequest.objects.select_related("room")

        if user.role == UserRole.OWNER:
            queryset = queryset.filter(room__pg_property__owner=user)

        # elif user.role == UserRole.EMPLOYEE:
        #     pg_ids = [
        #         a.pg_id for a in user.pg_assignments.all()
        #         if has_permission(user, a.pg_id, "view_maintenance")
        #     ]
        #     queryset = queryset.filter(room__pg_property__id__in=pg_ids)

        elif user.role == UserRole.TENANT:
            queryset = queryset.filter(
                room__tenants__user=user,
                room__tenants__is_active=True
            ).distinct()

        else:
            return queryset.none()

        pg_property = self.request.query_params.get("pg_property")
        room = self.request.query_params.get("room")
        if pg_property:
            queryset = queryset.filter(room__pg_property__id=pg_property)
        if room:
            queryset = queryset.filter(room__id = room)

        return queryset.order_by("-id")

    def perform_create(self, serializer):
        user = self.request.user
        room = serializer.validated_data["room"]

        if user.role == UserRole.TENANT:
            if not Tenant.objects.filter(user=user, room=room, is_active=True).exists():
                raise PermissionDenied("You can only raise requests for your own room.")
        elif user.role == UserRole.OWNER:
            if room.pg_property.owner != user:
                raise PermissionDenied("This room is not in your property.")
        # elif user.role == UserRole.EMPLOYEE:
        #     if not has_permission(user, room.pg_property_id, "add_maintenance"):
        #         raise PermissionDenied("You do not have permission to raise requests.")
        else:
            raise PermissionDenied()

        serializer.save(raised_by=user)

    @action(detail = True, methods = ["post"])
    def assign(self, request, pk= None):
        if request.user.role == UserRole.TENANT:
            raise PermissionDenied("Only staff can assign requests.")
        maintenance_request = self.get_object()
        if maintenance_request.status == "assigned":
            return Response({"detail": "Request is already assigned"}, status=status.HTTP_400_BAD_REQUEST)
        if maintenance_request.status != "pending":
            return Response({"detail": "Only pending requests can be assigned."}, status=400)

        maintenance_request.status = "assigned"
        maintenance_request.save(update_fields = ["status"])
        return Response({"detail": "Request assigned successfully"}, status=status.HTTP_200_OK)

    @action(detail = True, methods = ["post"])
    def send_resolve_otp(self, request, pk= None):
        if request.user.role == UserRole.TENANT:
            raise PermissionDenied("Only staff can resolve requests.")
        maintenance_request = self.get_object()
        if maintenance_request.status == "resolved":
            return Response({"detail": "Request is already resolved"}, status=status.HTTP_400_BAD_REQUEST)
        if maintenance_request.status != "assigned":
            return Response({"detail": "Only assigned requests can be resolved."}, status=400)

        now = timezone.now()
        if maintenance_request.resolve_otp_sent_at and now - maintenance_request.resolve_otp_sent_at < RESEND_COOLDOWN:
            wait = int((RESEND_COOLDOWN - (now - maintenance_request.resolve_otp_sent_at)).total_seconds())
            return Response({"detail": f"Please wait {wait}s before resending OTP"}, status=429)

        if maintenance_request.raised_by and maintenance_request.raised_by.role == UserRole.TENANT:
            emails = [maintenance_request.raised_by.email]
        else:
            emails = list(
                Tenant.objects.filter(room = maintenance_request.room, is_active = True)
                .exclude(user__email = "")
                .values_list("user__email", flat=True)
            )
        emails = [e for e in emails if e]
        if not emails:
            return Response({"detail": "No tenant email found for this room."}, status=400)

        otp = f"{secrets.randbelow(10**6):06d}"
        maintenance_request.resolve_otp_hash = make_password(otp)
        maintenance_request.resolve_otp_expires = now + OTP_TTL
        maintenance_request.resolve_otp_sent_at = now
        maintenance_request.resolve_otp_attempts = 0
        maintenance_request.save(update_fields=[
            "resolve_otp_hash", "resolve_otp_expires",
            "resolve_otp_sent_at", "resolve_otp_attempts",
        ])

        try:
            send_resolve_otp_mail(emails, otp, maintenance_request.category)
        except Exception:
            logger.exception("Failed to send resolve OTP email")
            return Response({"detail": "Could not send OTP email."}, status=500)

        return Response({"detail": "OTP sent to the tenant's email."})

    @action(detail = True, methods = ["post"])
    def resolve(self, request, pk= None):
        if request.user.role == UserRole.TENANT:
            raise PermissionDenied("Only staff can resolve requests.")
        maintenance_request = self.get_object()
        if maintenance_request.status == "resolved":
            return Response({"detail": "Request is already resolved"}, status=status.HTTP_400_BAD_REQUEST)
        if maintenance_request.status != "assigned":
            return Response({"detail": "Only assigned requests can be resolved."}, status=400)

        otp = str(request.data.get("otp")).strip()
        if not otp:
            return Response({"otp": "Please enter a valid OTP"}, status=400)

        with transaction.atomic():
            if not maintenance_request.resolve_otp_hash or not maintenance_request.resolve_otp_expires:
                return Response({"detail": "No OTP requested."}, status=400)
            if timezone.now() > maintenance_request.resolve_otp_expires:
                return Response({"detail": "OTP expired. Please resend."}, status=400)
            if maintenance_request.resolve_otp_attempts >= MAX_OTP_ATTEMPTS:
                return Response({"detail": "Too many attempts. Please resend a new OTP."}, status=429)
            if not check_password(otp, maintenance_request.resolve_otp_hash):
                maintenance_request.resolve_otp_attempts += 1
                maintenance_request.save(update_fields=["resolve_otp_attempts"])
                return Response({"detail": "Incorrect OTP."}, status=400)

        maintenance_request.status = "resolved"
        maintenance_request.resolved_at = timezone.now()
        maintenance_request.resolve_otp_hash = None
        maintenance_request.resolve_otp_expires = None
        maintenance_request.resolve_otp_attempts = 0
        maintenance_request.save(update_fields = ["status", "resolve_otp_hash", "resolve_otp_expires",
                    "resolve_otp_attempts",])
        return Response({"detail": "Request resolved successfully"}, status=status.HTTP_200_OK)
