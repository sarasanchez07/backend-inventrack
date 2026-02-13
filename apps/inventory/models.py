# apps/inventory/models.py
from django.db import models

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
    
    # Stock (siempre visible)
    stock_min = models.IntegerField(default=0)
    current_stock = models.IntegerField(default=0)