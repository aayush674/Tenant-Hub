from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

# AbstractUser is a django's built in user structure used to create a custom user model that can be extended with additional fields if needed in the future.
# BaseUserManager is a helper class Django provides to create users properly. But since we removed username, the default manager breaks. So we create our own UserManager.

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email must be provided") # Just to ensure that email is provided when creating user.
        email = self.normalize_email(email) # This method is provided by BaseUserManager to normalize the email address by lowercasing the domain part of it.
        user = self.model(email=email, **extra_fields) # This creates a new user instance
        user.set_password(password) # This method is provided by AbstractUser to set the user's password properly (hashing it).
        user.save(using=self._db) # This saves the user to the database.
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True) # This ensures that the superuser has is_staff set to True
        extra_fields.setdefault('is_superuser', True) # This ensures that the superuser has is_superuser set to True

        return self.create_user(email, password, **extra_fields) # This calls the create_user method to create a superuser with the provided email and password.
        
    


class User(AbstractUser):
    username = None # We are removing the default username field as we will be using email as the unique identifier for authentication.
    email = models.EmailField(unique=True) # This field will store the user's email address and it must be unique across all users.

    USERNAME_FIELD = 'email' # This tells Django to use the email field as the unique identifier for authentication instead of the default username field.
    REQUIRED_FIELDS = [] # This means there are no additional required fields besides email and password. 

    objects = UserManager() # This tells Django to use our custom UserManager for creating users and superusers.