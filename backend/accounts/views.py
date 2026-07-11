from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import SignupSerializer, UserSerializer, ActivateAccountSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import EmailTokenObtainPairSerializer
from rest_framework.decorators import api_view, permission_classes
from .utils import has_permission
from django.utils import timezone
from accounts.models import User


class SignupView(APIView):
    def post(self, request):
        serializer = SignupSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            return Response(
                {
                    "message": "User created successfully",
                    "user": UserSerializer(user).data
                },
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class MeView(APIView):
    permission_classes = [IsAuthenticated] # This ensures that only authenticated users can access this view.
    def get(self, request):
        user = request.user # This gets the currently authenticated user from the request.
        serializer = UserSerializer(user) # This serializes the user data using the SignupSerializer.
        return Response(serializer.data) # This returns the data of the authenticated user in the response.
    

class LoginView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer # This tells the view to use our custom EmailTokenObtainPairSerializer for handling login.
    

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):

    user = request.user
    old_password = request.data.get("old_password")
    new_password = request.data.get("new_password")

    if not user.check_password(old_password):
        return Response({"error": "Old password incorrect"}, status=400)

    user.set_password(new_password)
    user.save()

    return Response({"message": "Password updated successfully"})


class PermissionView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request):
        pg_id=request.query_params.get("pg_id")
        permissions=[
            "view_tenants",
            "add_tenants",
            "edit_tenants",
            "delete_tenants",
        ]
        
        data = {}
        for permission in permissions:
            data[permission] = has_permission(
                request.user,
                pg_id,
                permission
            )
            
        return Response(data)
    
class ActivateAccountView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = ActivateAccountSerializer(data=request.data)
        print("recieved serializer")
        if not serializer.is_valid():
            print("Inside isvalid serailizer check")
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        token=serializer.validated_data["token"]
        password=serializer.validated_data["password"]
        
        try:
            user=User.objects.get(invitation_token=token)
        except User.DoesNotExist:
            print("inside does not exist block")
            return Response(
                {"detail": "Invalid Invitation link."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if user.invitation_expires<timezone.now():
            print("inside expire check")
            return Response(
                {"detail": "Invitation has expired."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(password)
        user.is_active=True
        user.invitation_token=None
        user.invitation_expires=None
        user.save()
        print("user saved")
        return Response(
            {"detail": "Account Activated successfully."},
            status=status.HTTP_200_OK
        )