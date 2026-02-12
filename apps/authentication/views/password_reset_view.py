from rest_framework.views import APIView 
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
# AGREGA ESTA LÍNEA:
from django.contrib.auth import get_user_model
import logging
from apps.authentication.serializers.password_reset_serializer import (
    PasswordResetRequestSerializer, 
    PasswordResetConfirmSerializer)
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from apps.authentication.services.auth_service import AuthService

# DEFINE EL MODELO AQUÍ:
User = get_user_model()
logger = logging.getLogger(__name__)


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            try:
                uid = urlsafe_base64_decode(request.data['uidb64']).decode()
                user = User.objects.get(pk=uid)
                
                if default_token_generator.check_token(user, request.data['token']):
                    user.set_password(request.data['new_password'])
                    user.save()
                    return Response({"message": "Contraseña actualizada con éxito"}, status=status.HTTP_200_OK)
                return Response({"error": "Token inválido o expirado"}, status=status.HTTP_400_BAD_REQUEST)
            except Exception:
                return Response({"error": "Error al procesar la solicitud"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            # Llamamos al servicio para enviar el correo
            AuthService.send_password_reset_email(email)
            return Response(
                {"message": "Si el correo existe, se ha enviado un enlace de recuperación."},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)