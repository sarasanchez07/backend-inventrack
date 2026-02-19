# apps/inventory/models.py
from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal

class BaseUnit(models.Model):
    name = models.CharField(max_length=50) # mg, ml, kg, unidad, etc.
    def __str__(self): return self.name

class Presentation(models.Model):
    name = models.CharField(max_length=50) # Frasco, Bolsa, Caja, etc.
    def __str__(self): return self.name

class Inventory(models.Model):
    def __str__(self):
        return self.name
    
    OPTION_CHOICES = [
        (1, '(Mg, Ml, g, Pastilla) perfecto para medicamentos'),
        (2, '(Kg, Lb, unidad) perfecto para alimentos'),
        (3, '(Unidades exactas) perfecto para objetos '),
        (4, 'Personalizado'),
    ]

    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    selected_option = models.IntegerField(choices=OPTION_CHOICES)

    # Switches de configuración (SRP: El inventario define su esquema)
    has_concentration = models.BooleanField(default=False)
    has_presentation = models.BooleanField(default=False)
    has_quantity_per_presentation = models.BooleanField(default=False)
    has_expiration_date = models.BooleanField(default=False)

    # Relaciones para personalización (Nivel 1 - Configuración)
    allowed_units = models.ManyToManyField(BaseUnit, blank=True)
    allowed_presentations = models.ManyToManyField(Presentation, blank=True)

    def __str__(self):
        return self.name
    

class Category(models.Model):
    name = models.CharField(max_length=100)
    # Esta línea es el "ancla": vincula la categoría a UN solo inventario
    inventory = models.ForeignKey(
        'Inventory', 
        on_delete=models.CASCADE, 
        related_name='categories' # Esto permite el acceso desde el inventario
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Categories"
        # Opcional: Evita nombres de categorías duplicados dentro del mismo inventario
        unique_together = ('name', 'inventory') 

    def __str__(self):
        return f"{self.name} - {self.inventory.name}"
    
class Product(models.Model):
    name = models.CharField(max_length=100)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    inventory = models.ForeignKey(Inventory, on_delete=models.CASCADE)
    
    # Campos opcionales que se activan según el inventario
    concentration = models.CharField(max_length=50, blank=True, null=True)
    base_unit = models.ForeignKey(BaseUnit, on_delete=models.SET_NULL, null=True)
    presentation = models.ForeignKey(Presentation, on_delete=models.SET_NULL, null=True)
    expiration_date = models.DateField(blank=True, null=True)

    quantity_per_presentation = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=1,
        validators=[MinValueValidator(Decimal("1.00"))]
    )

    stock_initial_presentations = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )
    
    # Stock (siempre visible)
    stock_min_presentations = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    current_stock = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    def save(self, *args, **kwargs):

        # Solo convertir si es nuevo producto
        if not self.pk:
            self.current_stock = (
                self.stock_initial_presentations *
                self.quantity_per_presentation
            )

        super().save(*args, **kwargs)

    def get_stock_display(self):

        if self.quantity_per_presentation == 0:
            return f"{self.current_stock} {self.base_unit.name}"

        presentations = int(self.current_stock // self.quantity_per_presentation)
        units = int(self.current_stock % self.quantity_per_presentation)

        return (
            f"{self.current_stock} {self.base_unit.name} "
            f"({presentations} {self.presentation.name} "
            f"+ {units} {self.base_unit.name})"
        )

    def get_total_units(self):
        """
        Retorna el stock actual en unidades base.
        """
        return self.current_stock

    def get_presentations_available(self):
        """
        Convierte el stock total en:
        - cantidad de presentaciones completas
        - unidades sobrantes

        Ejemplo:
        580 unidades con 30 por presentación
        -> 19 presentaciones y 10 unidades
        """

        if not self.quantity_per_presentation:
            return {
                "presentations": 0,
                "units": self.current_stock
            }

        total_units = int(self.current_stock)
        units_per_pres = int(self.quantity_per_presentation)

        presentations = total_units // units_per_pres
        remaining_units = total_units % units_per_pres

        return {
            "presentations": presentations,
            "units": remaining_units
        }

    def has_low_stock(self):

        min_base = (
            self.stock_min_presentations *
            self.quantity_per_presentation
        )

        return self.current_stock <= min_base
    
    def convert_to_base_unit(self, quantity, is_presentation=False):

        if is_presentation:
            return quantity * self.quantity_per_presentation

        return quantity
    
    def __str__(self):
        # Esto permite que en el formulario de movimientos veas el nombre
        unit = self.base_unit.name if self.base_unit else "Sin unidad"
        return f"{self.name} ({unit})"