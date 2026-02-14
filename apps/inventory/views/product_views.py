from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from apps.inventory.models import Product, Inventory
from apps.inventory.serializers.product_serializers import ProductSerializer
from rest_framework.permissions import IsAuthenticated

class ProductListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        inventory_id = request.query_params.get('inventory_id')
        search = request.query_params.get('search')
        
        # 1. Base de la consulta según el ROL
        if user.role == 'admin':
            # El Admin puede ver absolutamente todo
            products = Product.objects.all()
        else:
            # El Personal SOLO ve productos de sus inventarios asignados
            products = Product.objects.filter(inventory__in=user.assigned_inventories.all())

        # 2. Filtros adicionales (opcionales)
        if inventory_id:
            # Si el personal asignado a varios inventarios quiere ver solo uno
            products = products.filter(inventory_id=inventory_id)
        
        if search:
            products = products.filter(name__icontains=search)

        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

    def post(self, request):
        inventory_id = request.data.get('inventory')
        user = request.user

        # 1. El Admin tiene permiso total
        if user.role == 'admin':
            pass 
        else:
            # 2. Verificamos si el inventario está en su lista de asignados
            if not user.assigned_inventories.filter(id=inventory_id).exists():
                return Response(
                    {"error": "Acceso denegado. No tienes permiso para operar en este inventario."},
                    status=status.HTTP_403_FORBIDDEN
                )

        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ProductDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        """Para editar campos específicos como la presentación"""
        product = get_object_or_404(Product, pk=pk)
        
        # Validación de seguridad: solo personal asignado o admin
        if request.user.role != 'admin' and not request.user.assigned_inventories.filter(id=product.inventory.id).exists():
            return Response({"error": "No tienes permiso"}, status=status.HTTP_403_FORBIDDEN)

        serializer = ProductSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        user = request.user

        # Seguridad: Solo admin o personal asignado al inventario del producto
        if user.role != 'admin' and not user.assigned_inventories.filter(id=product.inventory.id).exists():
            return Response(
                {"error": "No tienes permiso para eliminar este producto."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        product.delete()
        return Response({"message": "Producto eliminado"}, status=status.HTTP_204_NO_CONTENT)