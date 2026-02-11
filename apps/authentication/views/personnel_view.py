from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from authentication.serializers.personnel_serializer import PersonnelCreateSerializer
from authentication.services.personnel_service import PersonnelService
from authentication.permissions import IsAdminUser

class PersonnelCreateView(APIView):
    permission_classes = [IsAdminUser] # Solo Nivel 1 puede acceder

    def post(self, request):
        serializer = PersonnelCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = PersonnelService.create_personnel(serializer.validated_data)
            return Response(
                {"message": "Personal registrado exitosamente"}, 
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)