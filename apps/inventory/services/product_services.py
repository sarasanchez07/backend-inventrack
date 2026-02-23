# apps/inventory/services/product_service.py

from django.db import transaction
from apps.inventory.models import Product
from apps.movements.models import Movement

class ProductService:
    @staticmethod
    @transaction.atomic
    def create_product(validated_data, user):
        """
        Crea un producto y registra automáticamente el movimiento inicial.
        """
        # Extraemos el stock inicial para procesarlo
        initial_stock = validated_data.get('initial_stock', 0)
        
        # 1. Creamos el producto
        product = Product.objects.create(**validated_data)
        
        # 2. Si hay stock, registramos el movimiento de entrada (IN)
        if initial_stock > 0:
            Movement.objects.create(
                product=product,
                user=user,
                is_initial=True,
                quantity=initial_stock,
                type='IN',
                reason="Stock inicial de inventario al crear producto",
                # Si usas presentaciones (cajas/frascos), asegúrate de pasarlas aquí
            )
            
        return product