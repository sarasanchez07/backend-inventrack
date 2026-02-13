from django.contrib import admin
from .models import Inventory, Category, Product, BaseUnit, Presentation

# Registro simple para catálogos
admin.site.register(BaseUnit)
admin.site.register(Presentation)

# Registro con buscador y filtros para Inventarios
@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'selected_option', 'created_at')
    search_fields = ('name',)

# Registro para Categorías
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'inventory')
    list_filter = ('inventory',)
    search_fields = ('name',)

# Registro para Productos (el más detallado)
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'inventory', 'current_stock', 'expiration_date')
    list_filter = ('inventory', 'category')
    search_fields = ('name',)