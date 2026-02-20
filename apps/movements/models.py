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
    # Guardamos LA CANTIDAD  del producto por si el objeto original se borra
    unit_name_at_time = models.CharField(max_length=50, blank=True, null=True)
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
    is_edited = models.BooleanField(default=False)
    original_quantity = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    edited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='editor_movements'
    )

    is_cancelled = models.BooleanField(default=False, verbose_name="Anulado")
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancelled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='cancelled_movements'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # 1. Ejecutar validaciones de Django (como la de stock insuficiente)
            # 2. Lógica de Auditoría: Si el objeto ya existe en la DB, es una edición
        old_product = None
        if self.pk:
            # Obtenemos la versión que está guardada actualmente en la base de datos
            # antes de que se sobrescriba con los nuevos cambios
            old_movement = Movement.objects.get(pk=self.pk)

            if old_movement.product_id != self.product_id:
                old_product = old_movement.product
                
                # Si es la primera vez que se edita este movimiento
            if not self.is_edited:
                    # Guardamos la cantidad que tenía originalmente como respaldo histórico
                self.original_quantity = old_movement.quantity
                    # Marcamos el movimiento como editado para activar el color naranja
                self.is_edited = True
            # 2. Actualizamos el nombre histórico para que la tabla muestre el producto nuevo
        if self.product:
            self.product_name_at_time = self.product.name
            if self.product.base_unit:
                self.unit_name_at_time = self.product.base_unit.name

        self.full_clean()
                
                # Nota: Si ya estaba editado, mantenemos la 'original_quantity' 
                # que capturamos en la primera edición para no perder el rastro inicial.

            # 3. Guardar el movimiento en la base de datos
        with transaction.atomic():
            super().save(*args, **kwargs)
            # 4. Actualizar el stock del producto relacionado
            if self.product:
                Movement.recalculate_product_stock(self.product)

            if old_product:
                Movement.recalculate_product_stock(old_product)

    def delete(self, *args, **kwargs):

        with transaction.atomic():

            product = self.product
            super().delete(*args, **kwargs)

            if product:
                Movement.recalculate_product_stock(product)

    @staticmethod
    def recalculate_product_stock(product):
        
        movements = Movement.objects.filter(product=product, is_cancelled=False)

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