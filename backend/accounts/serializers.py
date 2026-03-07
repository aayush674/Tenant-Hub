from typing import Any, Dict
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User

class SignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

        def create(self, validated_data):
            user=User.objects.create_user(**validated_data) # This uses the create_user method from our custom UserManager to create a new user with the validated data.
            return user


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "email"

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["email"] = user.email
        return token

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        data = super().validate(attrs)

        assert self.user is not None

        response: Dict[str, Any] = dict(data)
        response["user"] = {
            "id": self.user.pk,
            "email": self.user.email,
        }

        return response