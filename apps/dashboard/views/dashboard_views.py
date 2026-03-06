from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.inventory.models import Product, Inventory
from apps.movements.models import Movement
from apps.inventory.permissions import InventoryPermissionService

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        inventory_id = request.query_params.get('inventory_id')
        
        # 1. Base query for products based on role
        products_qs = InventoryPermissionService.filter_products_for_user(user)
        
        if inventory_id:
            products_qs = products_qs.filter(inventory_id=inventory_id)
            total_products = products_qs.count()
            
            # Movements for this specific inventory
            movements_qs = Movement.objects.filter(product__inventory_id=inventory_id)
            # If not admin, ensure they have permission to see this inventory
            if user.role != 'admin':
                if not user.assigned_inventories.filter(id=inventory_id).exists():
                     return Response({"error": "No tienes acceso a este inventario"}, status=403)
            
            total_movements = movements_qs.count()
            inventories = Inventory.objects.filter(id=inventory_id)
        else:
            # 2. General Global/Assigned view
            total_products = products_qs.count()
            
            if user.role == 'admin':
                total_movements = Movement.objects.count()
                inventories = Inventory.objects.all()
            else:
                assigned_inventories = user.assigned_inventories.all()
                total_movements = Movement.objects.filter(product__inventory__in=assigned_inventories).count()
                inventories = assigned_inventories

        inventory_data = []
        for inv in inventories:
            inventory_data.append({
                "id": inv.id,
                "name": inv.name,
                "description": inv.description,
                "created_at": inv.created_at,
                "products_count": inv.product_set.count() if hasattr(inv, 'product_set') else Product.objects.filter(inventory=inv).count(),
                "config": {
                    "switches": {
                        "concentracion": inv.has_concentration,
                        "presentacion": inv.has_presentation,
                        "cantidad_por_presentacion": inv.has_quantity_per_presentation,
                        "vencimiento": inv.has_expiration_date,
                    },
                    "catalogos": {
                        "unidades": [{"id": u.id, "name": u.name} for u in inv.allowed_units.all()],
                        "presentaciones": [{"id": p.id, "name": p.name} for p in inv.allowed_presentations.all()],
                    }
                }
            })

        return Response({
            "total_products": total_products,
            "total_movements": total_movements,
            "inventories": inventory_data,
            "role": user.role
        })
