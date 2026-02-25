from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from apps.inventory.models import Inventory
from apps.inventory.services.inventory_services import InventoryService
from apps.inventory.serializers import InventorySerializer
from apps.authentication.permissions import IsAdminUser


class InventoryCreateView(APIView):
    permission_classes = [IsAdminUser]  # Solo Admin crea inventarios

    def post(self, request):
        # Usamos el servicio para aplicar la lógica de las 4 opciones
        inventory = InventoryService.create_inventory_with_config(request.data)
        serializer = InventorySerializer(inventory)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class InventoryListView(APIView):
    """Lista inventarios según el rol del usuario."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role == 'admin':
            inventories = Inventory.objects.all().order_by('name')
        else:
            inventories = user.assigned_inventories.all().order_by('name')

        serializer = InventorySerializer(inventories, many=True)
        return Response(serializer.data)


# Vista para "ENTRAR" y ver el mensaje de bienvenida (Nivel 2)
class InventoryDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        user = request.user

        if user.role != 'admin' and not user.assigned_inventories.filter(id=pk).exists():
            return Response(
                {"error": "No tienes permiso para acceder a este inventario."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Buscamos el inventario por ID
        inventory = get_object_or_404(Inventory, pk=pk)

        # Preparamos los datos legibles
        unidades = [u.name for u in inventory.allowed_units.all()]
        presentaciones = [p.name for p in inventory.allowed_presentations.all()]

        # Categorías vinculadas
        categorias = [{"id": c.id, "name": c.name} for c in inventory.categories.all()]

        return Response(
            {
                "message": f"Bienvenido al inventario {inventory.name}",
                "config": {
                    "tipo": inventory.get_selected_option_display(),
                    "switches": {
                        "concentracion": inventory.has_concentration,
                        "presentacion": inventory.has_presentation,
                        "vencimiento": inventory.has_expiration_date,
                    },
                    "catalogos": {
                        "unidades": unidades,
                        "presentaciones": presentaciones,
                    },
                },
                "categorias_registradas": categorias,
            },
            status=status.HTTP_200_OK,
        )