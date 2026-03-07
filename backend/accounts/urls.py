from django.urls import path
from .views import LoginView, SignupView, MeView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # TokenObtainPairView is a built-in view from the Simple JWT library that handles user login by getting valid credentials and returns an access token and a refresh token.
    # TokenRefreshView is another built-in view that receives a refresh token and returns a new access token if the refresh token is valid and not expired.

    path('me/', MeView.as_view(), name='me'),
]