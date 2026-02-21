# apps/inventory/permissions.py

from apps.inventory.models import Product


class InventoryPermissionService:

    @staticmethod
    def filter_products_for_user(user):
        """
        Regla de VISIBILIDAD (lo que puede ver).
        """
        if user.role == "admin":
            return Product.objects.all()

        return Product.objects.filter(
            inventory__in=user.assigned_inventories.all()
        )

    @staticmethod
    def can_create_in_inventory(user, inventory_id):
        """
        Regla de CREACIÓN.
        """
        if user.role == "admin":
            return True

        return user.assigned_inventories.filter(
            id=inventory_id
        ).exists()

    @staticmethod
    def can_modify_product(user, product):
        """
        Regla PATCH y DELETE.
        """
        if user.role == "admin":
            return True

        return user.assigned_inventories.filter(
            id=product.inventory_id
        ).exists()