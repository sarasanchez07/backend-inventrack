from django.db import transaction
from rest_framework.exceptions import ValidationError

class MovementService:
    @staticmethod
    @transaction.atomic
    def register_movement(user, serializer):
        # 1. Guardamos el movimiento pero no lo confirmamos en DB aún
        movement = serializer.save(user=user)
        product = movement.product

        if not product:
            raise ValidationError("El producto no existe o fue eliminado.")

        # 2. Validaciones de Negocio
        if movement.type == 'OUT':
            if product.current_stock <= 0:
                raise ValidationError("No se puede realizar la salida: El stock actual es 0.")
            
            if product.current_stock < movement.quantity:
                raise ValidationError(f"Stock insuficiente. Solo hay {product.current_stock} unidades disponibles.")
            
            # Restamos del stock del producto
            product.current_stock -= movement.quantity
            
        elif movement.type == 'IN':
            # Sumamos al stock del producto
            product.current_stock += movement.quantity
        
        # 3. Guardamos el cambio en el modelo Product
        # Esto actualiza automáticamente lo que se ve en el apartado de Productos
        product.save() 
        
        return movement