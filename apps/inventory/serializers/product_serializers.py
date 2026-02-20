from rest_framework import serializers
from apps.inventory.models import Product

class ProductSerializer(serializers.ModelSerializer):
    # Campos adicionales para mostrar nombres en lugar de IDs en las respuestas GET
    category_name = serializers.ReadOnlyField(source='category.name')
    unit_name = serializers.ReadOnlyField(source='base_unit.name')
    presentation_name = serializers.ReadOnlyField(source='presentation.name')

    display_name = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'display_name', 'category', 'category_name', 'inventory',
            'concentration', 'base_unit', 'unit_name', 
            'presentation', 'presentation_name',
            'expiration_date','quantity_per_presentation', 'stock_min_presentations','stock_initial_presentations', 'current_stock'
        ]
        read_only_fields = ['current_stock', 'display_name']

    def get_display_name(self, obj):
        return str(obj)
    
    def create(self, validated_data):
        # 1. Obtenemos el usuario desde el contexto del request (quien está logueado)
        request = self.context.get('request')
        user = request.user if request else None
        
        # 2. Creamos el producto pasando el usuario como argumento adicional
        # Esto disparará el save() del modelo con la variable 'created_by_user'
        return Product.objects.create(**validated_data, created_by_user=user)

    def validate(self, data):
        inventory = data.get('inventory') or (self.instance.inventory if self.instance else None)
        unit = data.get('base_unit') or (self.instance.base_unit if self.instance else None)
        presentation = data.get('presentation') or (self.instance.presentation if self.instance else None)

        if inventory:
            if unit and not inventory.allowed_units.filter(id=unit.id).exists():
                raise serializers.ValidationError({"base_unit": "Esta unidad no pertenece al inventario seleccionado."})

            if presentation and not inventory.allowed_presentations.filter(id=presentation.id).exists():
                raise serializers.ValidationError({"presentation": "Esta presentación no pertenece al inventario seleccionado."})

        return data
