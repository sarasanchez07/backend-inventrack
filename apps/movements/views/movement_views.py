from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from apps.inventory.models import Product
from ..serializers.movement_serializer import MovementSerializer
from ..models import Movement

class MovementCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        product_id = request.data.get('product')
        user = request.user

        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return Response(
                {"error": "El producto no existe."},
                status=status.HTTP_404_NOT_FOUND
            )

        # 🔐 Permisos
        if user.role != 'admin':
            if not user.assigned_inventories.filter(id=product.inventory.id).exists():
                return Response(
                    {"error": "No tienes permiso para este inventario."},
                    status=status.HTTP_403_FORBIDDEN
                )

        serializer = MovementSerializer(data=request.data)

        if serializer.is_valid():
            try:
                movement = serializer.save(
                    user=request.user,
                    product_name_at_time=product.name
                )
                return Response(
                    MovementSerializer(movement).data,
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class MovementDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):

        if request.user.role != 'admin':
            return Response(
                {"error": "Solo el administrador puede editar."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            movement = Movement.objects.get(pk=pk)
        except Movement.DoesNotExist:
            return Response(
                {"error": "Movimiento no encontrado."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = MovementSerializer(
            movement,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data)
            except Exception as e:
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request, pk):
        try:
            movement = Movement.objects.get(pk=pk)
        except Movement.DoesNotExist:
            return Response({"error": "Movimiento no encontrado."}, status=404)
        
        if request.user.role != 'admin' and movement.user != request.user:
            return Response(
                {"error": "No tienes permiso para ver este movimiento."},
                status=403
            )

        serializer = MovementSerializer(movement)
        return Response(serializer.data)

    
class MovementListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role == 'admin':
            movements = Movement.objects.all()
        else:
            movements = Movement.objects.filter(user=request.user)

        serializer = MovementSerializer(movements, many=True)
        return Response(serializer.data)