from rest_framework import serializers
from apps.movements.models import Movement

class ReportMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.SerializerMethodField()
    user_full_name = serializers.SerializerMethodField()
    inventory_name = serializers.SerializerMethodField()
    stock_after_movement = serializers.SerializerMethodField()
    unit_name = serializers.SerializerMethodField()

    class Meta:
        model = Movement
        fields = [
            'id', 'created_at', 'product_name', 'inventory_name', 'type', 
            'quantity', 'unit_name', 'stock_after_movement', 'reason', 'user_full_name', 'notes', 'is_cancelled'
        ]

    def get_product_name(self, obj):
        return obj.product_name_at_time or (obj.product.name if obj.product else "Producto Desconocido")


    def get_unit_name(self, obj):
        if obj.unit_name_at_time:
            return obj.unit_name_at_time
        if obj.product and obj.product.base_unit:
            return obj.product.base_unit.name
        return "u"

    def get_user_full_name(self, obj):
        if not obj.user: return "Sistema"
        full_name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return full_name if full_name else (obj.user.email if obj.user else "N/A")

    def get_inventory_name(self, obj):
        if obj.product and obj.product.inventory:
            return obj.product.inventory.name
        return "N/A"

    def get_stock_after_movement(self, obj):
        return obj.product.current_stock if obj.product else "N/A"