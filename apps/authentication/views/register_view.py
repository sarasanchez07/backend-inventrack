from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from authentication.serializers.register_serializer import RegisterSerializer


class RegisterView(APIView):
    """
    Registro de nuevos usuarios.
    """

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {"message": "Usuario creado correctamente"},
            status=status.HTTP_201_CREATED
        )
