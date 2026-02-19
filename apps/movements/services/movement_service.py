from django.db import transaction
from rest_framework.exceptions import ValidationError
from decimal import Decimal

from apps.inventory.models import Product
from apps.movements.models import Movement


class MovementService:

    @staticmethod
    @transaction.atomic
    def register_movement(user, serializer):

        validated_data = serializer.validated_data

        product = validated_data.get("product")
        movement_type = validated_data.get("type")
        quantity = validated_data.get("quantity")
        unit_type = validated_data.get("unit_type", "BASE")

        if not product:
            raise ValidationError("El producto no existe.")

        if quantity <= Decimal("0"):
            raise ValidationError("La cantidad debe ser mayor que 0.")

        # 🔒 Bloqueo para evitar concurrencia
        product = Product.objects.select_for_update().get(pk=product.pk)

        # 🔥 Convertir siempre a unidad base
        real_quantity = product.convert_to_base_unit(
            quantity,
            is_presentation=(unit_type == "PRESENTATION")
        )

        # Validaciones de negocio
        if movement_type == "OUT":

            if product.current_stock < real_quantity:
                raise ValidationError(
                    f"Stock insuficiente. Solo hay {product.current_stock} unidades disponibles."
                )

            product.current_stock -= real_quantity

        elif movement_type == "IN":

            product.current_stock += real_quantity

        else:
            raise ValidationError("Tipo de movimiento inválido.")

        product.save()

        # Guardamos el movimiento exactamente como fue ingresado
        movement = Movement.objects.create(
            product=product,
            product_name_at_time=product.name,
            user=user,
            type=movement_type,
            quantity=quantity,  # lo que el usuario ingresó
            unit_type=unit_type,
            reason=validated_data.get("reason", ""),
            notes=validated_data.get("notes", ""),
        )

        return movement
