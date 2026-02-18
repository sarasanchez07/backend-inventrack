from rest_framework import serializers
from ..models import Movement

class MovementSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.email')
    product_name = serializers.ReadOnlyField(source='product.name')
    # Para mostrar la unidad base en la tabla
    unit_name = serializers.ReadOnlyField(source='product.base_unit.name')

    class Meta:
        model = Movement
        fields = [
            'id', 'product', 'product_name', 'unit_name', 'user_name', 
            'type', 'quantity', 'reason', 'notes', 'created_at'
        ]
        read_only_fields = ['user']