from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import SignupSerializer
from rest_framework.permissions import IsAuthenticated
from .models import User
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import EmailTokenObtainPairSerializer
from rest_framework.decorators import api_view, permission_classes

class SignupView(APIView):
    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save() # This calls the create method in the SignupSerializer, which creates a new user using the validated data.
            return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class MeView(APIView):
    permission_classes = [IsAuthenticated] # This ensures that only authenticated users can access this view.
    def get(self, request):
        user = request.user # This gets the currently authenticated user from the request.
        serializer = SignupSerializer(user) # This serializes the user data using the SignupSerializer.
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