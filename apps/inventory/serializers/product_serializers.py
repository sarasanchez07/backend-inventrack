from rest_framework import serializers
from apps.inventory.models import Product

class ProductSerializer(serializers.ModelSerializer):
    # Campos adicionales para mostrar nombres en lugar de IDs en las respuestas GET
    category_name = serializers.ReadOnlyField(source='category.name')
    unit_name = serializers.ReadOnlyField(source='base_unit.name')
    presentation_name = serializers.ReadOnlyField(source='presentation.name')

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'category', 'category_name', 'inventory',
            'concentration', 'base_unit', 'unit_name', 
            'presentation', 'presentation_name',
            'expiration_date', 'stock_min', 'current_stock'
        ]

def validate(self, data):
    # Si es un PATCH, tomamos el inventario del objeto existente si no viene en 'data'
    inventory = data.get('inventory') or (self.instance.inventory if self.instance else None)
    unit = data.get('base_unit') or (self.instance.base_unit if self.instance else None)
    presentation = data.get('presentation') or (self.instance.presentation if self.instance else None)

    if inventory:
        # Validar unidad
        if unit and not inventory.allowed_units.filter(id=unit.id).exists():
            raise serializers.ValidationError({"base_unit": "Esta unidad no pertenece al inventario seleccionado."})

        # Validar presentación
        if presentation and not inventory.allowed_presentations.filter(id=presentation.id).exists():
            raise serializers.ValidationError({"presentation": "Esta presentación no pertenece al inventario seleccionado."})

    return data