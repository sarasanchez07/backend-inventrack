from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from apps.inventory.models import Product
from ..serializers.movement_serializer import MovementSerializer
from ..services.movement_service import MovementService
from ..models import Movement

class MovementCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product')
        user = request.user
        
        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return Response({"error": "El producto no existe."}, status=status.HTTP_404_NOT_FOUND)

        if user.role != 'admin':
            if not user.assigned_inventories.filter(id=product.inventory.id).exists():
                return Response(
                    {"error": "No tienes permiso para este inventario."},
                    status=status.HTTP_403_FORBIDDEN
                )

        serializer = MovementSerializer(data=request.data)
        if serializer.is_valid():
            try:
                MovementService.register_movement(request.user, serializer)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ESTA ES LA CLASE QUE FALTA O TIENE UN ERROR DE NOMBRE
class MovementDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        """Permite al Admin editar movimientos registrados"""
        if request.user.role != 'admin':
            return Response({"error": "Solo el administrador puede editar."}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            movement = Movement.objects.get(pk=pk)
        except Movement.DoesNotExist:
            return Response({"error": "Movimiento no encontrado."}, status=status.HTTP_404_NOT_FOUND)

        serializer = MovementSerializer(movement, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)