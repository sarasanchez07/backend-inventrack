from django.db import transaction
from rest_framework.exceptions import ValidationError
from decimal import Decimal, ROUND_HALF_UP

from apps.inventory.models import Product
from apps.movements.models import Movement
from django.contrib.auth import get_user_model  
from django.db.models import F
User = get_user_model()
from django.utils import timezone

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

        if real_quantity <= 0:
            raise ValidationError("La cantidad debe ser mayor a 0.")
        
        # ---- calcular nuevo stock de salida ----
        if movement_type == "OUT":
            if product.current_stock < real_quantity:
                raise ValidationError(
                    f"Stock insuficiente. Disponible: {product.current_stock}"
                )
            product.current_stock = F("current_stock") - real_quantity

        else:  # IN
            product.current_stock = F("current_stock") + real_quantity

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
    def create_initial_movement(product, quantity, user=None):

        if user is None:
            user = MovementService.get_system_user()

        product = Product.objects.select_for_update().get(pk=product.pk)

        quantity = Decimal(str(quantity)).quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP
        )

        # ✅ stock inicial se SETEA, no se suma
        product.current_stock = quantity
        product.save(update_fields=["current_stock"])

        movement = Movement(
            product=product,
            product_name_at_time=product.name,
            user=user,
            type="IN",
            quantity=quantity,
            unit_type="BASE",
            reason="Carga inicial de inventario",
            is_initial=True,
        )

        movement._created_from_service = True
        movement.save()

    @staticmethod
    @transaction.atomic
    def edit_movement(*, movement, user, product=None, quantity=None, reason=None):

        movement = Movement.objects.select_for_update().get(pk=movement.pk)

        if movement.is_initial:
            raise ValidationError("El movimiento inicial no puede ser editado.")
    
        original_product = Product.objects.select_for_update().get(pk=movement.product.pk)

        old_qty = Decimal(str(movement.quantity))
        movement_type = movement.type

        # CASO 1: CAMBIO DE PRODUCTO
        if product and product != movement.product:

            new_product = Product.objects.select_for_update().get(pk=product.pk)

            # 1️Revertir impacto del producto original
            if movement_type == "OUT":
                original_product.current_stock = F("current_stock") + old_qty
            else:
                original_product.current_stock = F("current_stock") - old_qty

            original_product.save(update_fields=["current_stock"])

            # 2️ Aplicar impacto al nuevo producto
            if movement_type == "OUT":
                new_product.current_stock = F("current_stock") - old_qty
            else:
                new_product.current_stock = F("current_stock") + old_qty

            new_product.save(update_fields=["current_stock"])

            movement.product = new_product
            movement.product_name_at_time = new_product.name

        # CASO 2: CAMBIO DE CANTIDAD
        if quantity is not None:

            new_qty = Decimal(str(quantity))

            if new_qty <= 0:
                raise ValidationError("La cantidad debe ser mayor a 0.")

            # 1️⃣ Restaurar efecto anterior
            if movement_type == "OUT":
                original_product.current_stock += old_qty
            else:
                original_product.current_stock -= old_qty

            original_product.refresh_from_db()

            # 2️⃣ Validar nuevo impacto
            if movement_type == "OUT":
                if original_product.current_stock < new_qty:
                    raise ValidationError(
                        "No hay stock suficiente para esta modificación."
                    )
                original_product.current_stock -= new_qty
            else:
                original_product.current_stock += new_qty

            original_product.save(update_fields=["current_stock"])

            movement.quantity = new_qty

        # Auditoría
        if not movement.is_edited:
            movement.original_quantity = old_qty
            movement.is_edited = True

        if reason is not None:
            movement.reason = reason

        movement.edited_by = user
        movement.save()

        return movement
            

    @staticmethod
    @transaction.atomic
    def cancel_movement(*, movement, user):

        movement = Movement.objects.select_for_update().get(pk=movement.pk)
        product = Product.objects.select_for_update().get(pk=movement.product.pk)

        if movement.is_cancelled:
            raise ValidationError("El movimiento ya está anulado.")

        qty = Decimal(str(movement.quantity))

        #  Revertir impacto en stock
        if movement.type == "IN":
            # Si fue una entrada, al anular restamos
            if product.current_stock < qty:
                raise ValidationError(
                    "No se puede anular porque el stock quedaría negativo."
                )
            product.current_stock = F("current_stock") - qty

        else:  # OUT
            # Si fue una salida, al anular sumamos
            product.current_stock = F("current_stock") + qty

        product.save(update_fields=["current_stock"])
        product.refresh_from_db()

        movement.is_cancelled = True
        movement.cancelled_by = user
        movement.cancelled_at = timezone.now()

        movement.save(update_fields=["is_cancelled", "cancelled_by", "cancelled_at"])

        return movement