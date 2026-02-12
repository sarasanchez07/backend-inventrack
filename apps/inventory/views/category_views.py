from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from apps.inventory.models import Category
from apps.inventory.serializers.category_serializers import CategorySerializer
from django.shortcuts import get_object_or_404

# apps/inventory/views/category_views.py

class CategoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Lista categorías con filtros para Admin y Personal"""
        user = request.user
        inventory_id = request.query_params.get('inventory_id')
        inventory_name = request.query_params.get('inventory_name')
        
        # 1. El Admin puede ver TODO por defecto
        if user.role == 'admin':
            categories = Category.objects.all()
            # Filtro por nombre de inventario (Nivel 1)
            if inventory_name:
                categories = categories.filter(inventory__name__icontains=inventory_name)
        
        # 2. El Personal solo ve lo de sus inventarios asignados
        else:
            categories = Category.objects.filter(inventory__in=user.assigned_inventories.all())

        # Filtro adicional si el frontend manda un ID específico (Nivel 2)
        if inventory_id:
            categories = categories.filter(inventory_id=inventory_id)

        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Crea categorías validando permisos de asignación"""
        inventory_id = request.data.get('inventory')
        user = request.user

        # Seguridad de "Islas": Validamos si el personal tiene acceso a ese inventario
        if user.role != 'admin':
            if not user.assigned_inventories.filter(id=inventory_id).exists():
                return Response(
                    {"error": "Acceso denegado. No tienes permiso para este inventario."},
                    status=status.HTTP_403_FORBIDDEN
                )

        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class CategoryDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        category = get_object_or_404(Category, pk=pk)
        user = request.user
        
        # Validación de seguridad para PATCH
        if user.role != 'admin' and not user.assigned_inventories.filter(id=category.inventory.id).exists():
            return Response({"error": "No tienes permiso."}, status=status.HTTP_403_FORBIDDEN)

        serializer = CategorySerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        category = get_object_or_404(Category, pk=pk)
        user = request.user

        # Seguridad para DELETE
        if user.role != 'admin' and not user.assigned_inventories.filter(id=category.inventory.id).exists():
            return Response({"error": "No tienes permiso."}, status=status.HTTP_403_FORBIDDEN)
        
        if category.products.exists():
            return Response(
                {"error": "No puedes eliminar una categoría con productos registrados."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        category.delete()
        return Response({"message": "Categoría eliminada."}, status=status.HTTP_204_NO_CONTENT)