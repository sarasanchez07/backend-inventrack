from django.db import models
from django.conf import settings
from apps.inventory.models import Product

class Movement(models.Model):
    MOVEMENT_TYPES = (
        ('IN', 'Entrada'),
        ('OUT', 'Salida'),
    )

    # SET_NULL para que el reporte no se rompa si borran un producto
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, related_name='movements')
    # Guardamos el nombre del producto por si el objeto original se borra
    product_name_at_time = models.CharField(max_length=255, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    type = models.CharField(max_length=3, choices=MOVEMENT_TYPES)
    quantity = models.PositiveIntegerField()
    reason = models.TextField(blank=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.product and not self.product_name_at_time:
            self.product_name_at_time = self.product.name
        super().save(*args, **kwargs)

    def __str__(self):
        # Esto es lo que aparecerá en el mensaje de éxito y en las listas
        return f"{self.type} - {self.product_name_at_time} ({self.quantity})"

    class Meta:
        ordering = ['-created_at']