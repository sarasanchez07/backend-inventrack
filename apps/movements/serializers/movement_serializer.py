from rest_framework import serializers
from ..models import Movement

class MovementSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.email')
    product_name = serializers.ReadOnlyField(source='product.name')
    # Para mostrar la unidad base en la tabla
    unit_name = serializers.ReadOnlyField(source='unit_name_at_time')
    edited_by = serializers.PrimaryKeyRelatedField(read_only=True)
    status = serializers.SerializerMethodField()

    class Meta:
        model = Movement
        fields = [
            'id', 'product', 'product_name', 'unit_name', 'user_name', 
            'type', 'quantity', 'reason', 'notes', 'created_at', 'is_edited', 'original_quantity', 'edited_by','unit_name_at_time'
        ]
        read_only_fields = ['user', 'is_edited', 'original_quantity', 'edited_by']
    
    def get_product_name(self, obj):
        # Si el producto existe, devuelve su nombre actual, si no, el histórico
        return obj.product.name if obj.product else obj.product_name_at_time
    
    def get_unit_name(self, obj):
        # Si tiene respaldo histórico, usarlo (ideal para productos borrados)
        if obj.unit_name_at_time:
            return obj.unit_name_at_time
        # Si no hay respaldo pero el producto existe, sacarlo del producto
        if obj.product and obj.product.base_unit:
            return obj.product.base_unit.name
        return "N/A"
    
    def get_status(self, obj):
        """Esta es la lógica que tenías en el Admin, ahora disponible para la API"""
        if obj.is_cancelled:
            return "Anulado"
        if not obj.product:
            return "Inactivo"
        return "Activo"
    
    def validate(self, data):
        """
        Validación global del Serializer.
        Aquí verificamos que si es una salida, haya stock suficiente.
        """
        product = data.get('product')
        m_type = data.get('type')
        quantity = data.get('quantity')
        unit_type = data.get('unit_type', 'BASE')

        # Si el producto no existe (por seguridad)
        if not product:
            raise serializers.ValidationError({"product": "El producto no existe o está inactivo."})

        # Solo validamos stock en SALIDAS (OUT)
        if m_type == 'OUT':
            # 1. Convertimos la cantidad pedida a unidades base
            requested_qty = product.convert_to_base_unit(
                quantity, 
                is_presentation=(unit_type == 'PRESENTATION')
            )

            # 2. Verificamos contra el stock actual del producto
            if requested_qty > product.current_stock:
                raise serializers.ValidationError({
                    "quantity": f"Stock insuficiente. Disponible: {product.current_stock} unidades base."
                })

        return data

    def update(self, instance, validated_data):
        # 1. Obtenemos el usuario de la petición (quien está logueado en Postman/App)
        request = self.context.get('request')
        if request and request.user:
            instance.edited_by = request.user
        
        # 2. El método save() del modelo se encargará del resto (is_edited y original_quantity)
        return super().update(instance, validated_data)