from rest_framework import serializers
from ..models import Movement

class MovementSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.email')
    product_name = serializers.ReadOnlyField(source='product.name')
    # Para mostrar la unidad base en la tabla
    unit_name = serializers.ReadOnlyField(source='product.base_unit.name')
    edited_by = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Movement
        fields = [
            'id', 'product', 'product_name', 'unit_name', 'user_name', 
            'type', 'quantity', 'reason', 'notes', 'created_at', 'is_edited', 'original_quantity', 'edited_by'
        ]
        read_only_fields = ['user', 'is_edited', 'original_quantity', 'edited_by']

    def update(self, instance, validated_data):
        # 1. Obtenemos el usuario de la petición (quien está logueado en Postman/App)
        request = self.context.get('request')
        if request and request.user:
            instance.edited_by = request.user
        
        # 2. El método save() del modelo se encargará del resto (is_edited y original_quantity)
        return super().update(instance, validated_data)