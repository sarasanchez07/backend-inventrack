from django.utils import timezone
from datetime import timedelta
from apps.inventory.models import Product
from ..models import Alert
from django.db.models import Q

class AlertService:
    @staticmethod
    def check_low_stock():
        """
        Escanea productos con stock por debajo del mínimo y genera alertas.
        """
        # Usamos el método has_low_stock del modelo Product si es eficiente,
        # o hacemos una query optimizada.
        products = Product.objects.all()
        alerts_created = 0

        for product in products:
            if product.has_low_stock():
                # Verificar si ya existe una alerta activa para este producto y tipo
                if not Alert.objects.filter(product=product, type='LOW_STOCK', is_resolved=False).exists():
                    Alert.objects.create(
                        product=product,
                        type='LOW_STOCK',
                        message=f"El producto {product.name} tiene poco stock: {product.current_stock} unidades."
                    )
                    alerts_created += 1
        return alerts_created

    @staticmethod
    def check_expirations(days_threshold=30):
        """
        Escanea productos por vencer en los próximos X días.
        """
        threshold_date = timezone.now().date() + timedelta(days=days_threshold)
        
        # Productos que tienen fecha de vencimiento y es próxima
        products = Product.objects.filter(
            expiration_date__lte=threshold_date,
            expiration_date__gte=timezone.now().date(),
            inventory__has_expiration_date=True
        )
        
        alerts_created = 0
        for product in products:
            if not Alert.objects.filter(product=product, type='EXPIRATION', is_resolved=False).exists():
                Alert.objects.create(
                    product=product,
                    type='EXPIRATION',
                    message=f"El producto {product.name} vence el {product.expiration_date}."
                )
                alerts_created += 1
        return alerts_created

    @staticmethod
    def get_active_alerts_for_user(user):
        """
        Retorna alertas de productos a los que el usuario tiene acceso.
        """
        from apps.inventory.permissions import InventoryPermissionService
        accessible_products = InventoryPermissionService.filter_products_for_user(user)
        return Alert.objects.filter(product__in=accessible_products, is_resolved=False)
