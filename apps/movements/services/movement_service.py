from django.db import transaction
from rest_framework.exceptions import ValidationError
from decimal import Decimal

from apps.inventory.models import Product
from apps.movements.models import Movement
from django.contrib.auth import get_user_model  
from django.db.models import F
User = get_user_model()

from django.db import transaction
from apps.inventory.models import Inventory


class MovementService:

    @staticmethod
    @transaction.atomic
    def create_movement(
        *,
        product,
        user,
        movement_type,
        quantity,
        unit_type,
        reason=""
    ):

        product = Product.objects.select_for_update().get(pk=product.pk)
        real_quantity = Decimal(str(quantity))

        # ---- calcular nuevo stock ----
        if movement_type == "IN":
            product.current_stock = F("current_stock") + real_quantity
        else:
            product.current_stock = F("current_stock") - real_quantity

        product.save(update_fields=["current_stock"])
        product.refresh_from_db()

        # ---- crear movimiento ----
        movement = Movement(
            product=product,
            product_name_at_time=product.name,
            user=user,
            type=movement_type,
            quantity=quantity,
            unit_type=unit_type,
            reason=reason,
        )

        movement._created_from_service = True
        movement.save()

        return movement
    
    @staticmethod
    def get_system_user():
        user, _ = User.objects.get_or_create(
            email="system@inventrak.local",
            defaults={
                "password": "!",
                "role": "ADMIN",
            }
        )
        return user
    
    @staticmethod
    @transaction.atomic
    def create_initial_movement(product, quantity):

        system_user = MovementService.get_system_user()

        product = Product.objects.select_for_update().get(pk=product.pk)

        # ✅ stock inicial se SETEA, no se suma
        product.current_stock = quantity
        product.save(update_fields=["current_stock"])

        movement = Movement(
            product=product,
            product_name_at_time=product.name,
            user=system_user,
            type="IN",
            quantity=quantity,
            unit_type="BASE",
            reason="Carga inicial automática",
        )

        movement._created_from_service = True
        movement.save()

    @staticmethod
    @transaction.atomic
    def edit_movement(*, movement, user, quantity=None, reason=None):
        # 1. Bloqueamos el movimiento y el producto relacionado
        movement = Movement.objects.select_for_update().get(pk=movement.pk)
        product = Product.objects.select_for_update().get(pk=movement.product.pk)

        if quantity is not None:
            new_qty = Decimal(str(quantity))
            old_qty = Decimal(str(movement.quantity))

            # Calculamos la diferencia
            # Si el movimiento es de salida (OUT), el impacto es inverso
            delta = new_qty - old_qty
            
            if movement.type == "OUT":
                # Si era una salida y ahora la cantidad es mayor, 
                # debemos RESTAR más stock del producto.
                actual_delta = -delta
            else:
                # Si era una entrada y ahora es mayor, SUMAMOS stock.
                actual_delta = delta

            # --- AQUÍ VA LA LÓGICA DE STOCK ---
            product.current_stock = F("current_stock") + actual_delta
            product.save(update_fields=["current_stock"])
            # ----------------------------------

            # Auditoría
            if not movement.is_edited:
                movement.original_quantity = old_qty
                movement.is_edited = True
            
            movement.quantity = new_qty

        if reason is not None:
            movement.reason = reason

        movement.save()
        return movement