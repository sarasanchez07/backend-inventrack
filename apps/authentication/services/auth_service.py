from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

User = get_user_model()


class AuthService:
    """
    Servicio de autenticación.
    """

    @staticmethod
    def login(email: str, password: str) -> dict:
        user = authenticate(email=email, password=password)

        if not user:
            raise ValueError("Credenciales inválidas")

        refresh = RefreshToken.for_user(user)

        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": user.id,
                "email": user.email,
                "name": f"{user.first_name} {user.last_name}",
            },
        }

    @staticmethod
    def register(data: dict) -> User:
        return User.objects.create_user(**data)
