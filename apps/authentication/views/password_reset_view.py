from rest_framework.views import APIView 
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response({"error": "Por favor ingrese un correo electrónico válido."}, status=status.HTTP_400_BAD_REQUEST)
            
        # El sistema valida si el correo ya está en la BD
        if User.objects.filter(email=email).exists():
            return Response(
                {"message": "Correo válido. Puede proceder a cambiar la contraseña.", "exists": True},
                status=status.HTTP_200_OK
            )
        else:
            # Mensaje diciendo que ese correo no está registrado
            return Response(
                {"error": "Ese correo no está registrado en el sistema."},
                status=status.HTTP_404_NOT_FOUND
            )

class PasswordResetConfirmView(APIView):
    """
    Vista para actualizar directamente la contraseña una vez el correo ha sido validado en el frontend.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        new_password = request.data.get('password')
        confirm_password = request.data.get('confirm_password')

        if not email or not new_password or not confirm_password:
            return Response(
                {"error": "Todos los campos obligatorios (correo y contraseñas)."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if new_password != confirm_password:
            return Response(
                {"error": "Las contraseñas no coinciden."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)
            user.set_password(new_password)
            user.save()
            return Response(
                {"message": "Contraseña actualizada con éxito. Ya puedes iniciar sesión."}, 
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            return Response(
                {"error": "Ese correo no está registrado en el sistema."}, 
                status=status.HTTP_404_NOT_FOUND
            )