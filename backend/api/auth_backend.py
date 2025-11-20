from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

User = get_user_model()

class EmailBackend(ModelBackend):
    """
    Custom authentication backend to allow login with email.
    Inherits from ModelBackend to get default permission checking.
    Allows inactive users to authenticate (they will be handled by frontend
    cuz for this web app we want the inactive users to be able to login, but
    show to them that they are inactive).
    """
    def authenticate(self, request, username=None, password=None, 
                     email=None, **kwargs):
        # Try with email first (for custom login)
        if email is None:
            email = username  # Django admin uses 'username' parameter
        
        if email is None:
            return None
            
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Run the default password hasher once to reduce timing
            # difference between existing and non-existing users
            User().set_password(password)
            return None
        
        # Check password (allow inactive users to login)
        if user.check_password(password):
            return user
        
        return None

    def get_user(self, user_id):
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
        # Return user even if inactive (frontend will handle)
        return user