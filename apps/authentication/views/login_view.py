from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from authentication.serializers.login_serializer import LoginSerializer
from authentication.services.auth_service import AuthService


class LoginView(APIView):
    """
    Endpoint para login de usuarios.
    """

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            result = AuthService.login(**serializer.validated_data)
            return Response(result, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_401_UNAUTHORIZED
            )
