from rest_framework import serializers
from apps.movements.models import Movement

class ReportMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product_name_at_time')
    user_full_name = serializers.SerializerMethodField()
    inventory_name = serializers.CharField(source='product.inventory.name', read_only=True)
    stock_after_movement = serializers.SerializerMethodField()

    class Meta:
        model = Movement
        fields = [
            'created_at', 'product_name', 'inventory_name', 'type', 
            'quantity', 'stock_after_movement', 'reason', 'user_full_name'
        ]

    def get_user_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.email

    def get_stock_after_movement(self, obj):
        # Aquí se muestra el stock actual del producto. 
        # Para trazabilidad histórica exacta, se recomienda guardar el snapshot en el modelo Movement.
        return obj.product.current_stock if obj.product else "N/A"