from django.db import models
from django.conf import settings
from apps.inventory.models import Product
from django.core.validators import MinValueValidator
from decimal import Decimal
from django.db import transaction
from django.core.exceptions import ValidationError


class Movement(models.Model):
    MOVEMENT_TYPES = (
        ('IN', 'Entrada'),
        ('OUT', 'Salida'),
    )

    MOVEMENT_UNIT_TYPE = (
        ('BASE', 'Unidad base'),
        ('PRESENTATION', 'Presentación'),
    )

    # SET_NULL para que el reporte no se rompa si borran un producto
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, related_name='movements')
    # Guardamos el nombre del producto por si el objeto original se borra
    product_name_at_time = models.CharField(max_length=255, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    type = models.CharField(max_length=3, choices=MOVEMENT_TYPES)
    unit_type = models.CharField(
        max_length=20,
        choices=MOVEMENT_UNIT_TYPE,
        default='BASE'
    )
    quantity = models.DecimalField(
    max_digits=10,
    decimal_places=2,
    validators=[MinValueValidator(Decimal('0.01'))]
    )
    reason = models.TextField(blank=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)



    def save(self, *args, **kwargs):

        self.full_clean()

        with transaction.atomic():

            super().save(*args, **kwargs)

            if self.product:
                Movement.recalculate_product_stock(self.product)

    def delete(self, *args, **kwargs):

        with transaction.atomic():

            product = self.product
            super().delete(*args, **kwargs)

            if product:
                Movement.recalculate_product_stock(product)

    @staticmethod
    def recalculate_product_stock(product):

        movements = Movement.objects.filter(product=product)

        total_in = Decimal("0")
        total_out = Decimal("0")

        for movement in movements:

            real_quantity = product.convert_to_base_unit(
                movement.quantity,
                is_presentation=(movement.unit_type == "PRESENTATION")
            )

            if movement.type == "IN":
                total_in += real_quantity
            elif movement.type == "OUT":
                total_out += real_quantity

        product.current_stock = total_in - total_out
        product.save()

    def clean(self):

        if not self.product:
            return

        # Convertimos la cantidad a unidad base
        real_quantity = self.product.convert_to_base_unit(
            self.quantity,
            is_presentation=(self.unit_type == "PRESENTATION")
        )

        # Calculamos stock actual SIN este movimiento si estamos editando
        movements = Movement.objects.filter(product=self.product)

        if self.pk:
            movements = movements.exclude(pk=self.pk)

        total_in = Decimal("0")
        total_out = Decimal("0")

        for movement in movements:

            qty = self.product.convert_to_base_unit(
                movement.quantity,
                is_presentation=(movement.unit_type == "PRESENTATION")
            )

            if movement.type == "IN":
                total_in += qty
            else:
                total_out += qty

        current_stock = total_in - total_out

        # Si es salida validamos
        if self.type == "OUT":
            if real_quantity > current_stock:
                raise ValidationError("Stock insuficiente para realizar esta salida.")


    def __str__(self):
        # Esto es lo que aparecerá en el mensaje de éxito y en las listas
        return f"{self.type} - {self.product_name_at_time} ({self.quantity})"

    class Meta:
        ordering = ['-created_at']