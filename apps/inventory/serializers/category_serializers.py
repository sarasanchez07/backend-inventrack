from rest_framework import serializers
from apps.inventory.models import Category


class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = ['id', 'name', 'inventory', 'created_at']

    def validate(self, attrs):
        """
        Valida que la categoría pertenezca al inventario seleccionado.
        """

        category = attrs.get('category')
        inventory = attrs.get('inventory')

        # Solo validar si ambos vienen en el request
        if category and inventory:
            if category.inventory_id != inventory.id:
                raise serializers.ValidationError(
                    "La categoría no pertenece al inventario seleccionado."
                )

        return attrs
