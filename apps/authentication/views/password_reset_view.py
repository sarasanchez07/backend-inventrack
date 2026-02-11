from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from authentication.serializers.password_reset_serializer import PasswordResetSerializer


class PasswordResetView(APIView):
    """
    Solicitud de recuperación de contraseña.
    """

    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Aquí luego va email / token
        return Response(
            {"message": "Si el email existe, se enviará un enlace"},
            status=status.HTTP_200_OK
        )
