from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.authentication.serializers.personnel_serializer import PersonnelCreateSerializer
from apps.authentication.services.personnel_service import PersonnelService
from apps.authentication.permissions import IsAdminUser
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from apps.authentication.models import User


class PersonnelCreateView(APIView):
    permission_classes = [IsAdminUser]
    serializer_class = PersonnelCreateSerializer # Solo Nivel 1 puede acceder

    def post(self, request):
        serializer = PersonnelCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = PersonnelService.create_personnel(serializer.validated_data)
            return Response(
                {"message": "Personal registrado exitosamente"}, 
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        """Permite al Admin editar datos del personal"""
        if request.user.role != 'admin':
            return Response({"error": "No tienes permiso para editar personal."}, status=status.HTTP_403_FORBIDDEN)
        
        user_to_edit = get_object_or_404(User, pk=pk)
        serializer = PersonnelCreateSerializer(user_to_edit, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Permite al Admin eliminar un usuario de la fundación"""
        if request.user.role != 'admin':
            return Response({"error": "No tienes permiso para eliminar personal."}, status=status.HTTP_403_FORBIDDEN)
        
        user_to_delete = get_object_or_404(User, pk=pk)
        user_to_delete.delete()
        return Response({"message": "Usuario eliminado correctamente."}, status=status.HTTP_204_NO_CONTENT)
