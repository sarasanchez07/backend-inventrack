from django.db.models import Q
from apps.movements.models import Movement
from decimal import Decimal

class ReportService:
    @staticmethod
    def get_filtered_movements(user, start_date=None, end_date=None, movement_type=None, inventory_id=None):
        """
        Aplica filtros de seguridad y de negocio para obtener los movimientos.
        """
        # Regla de Seguridad: Personal solo ve lo que él mismo registró
        if user.role != 'admin':
            queryset = Movement.objects.filter(user=user)
        else:
            queryset = Movement.objects.all()

        # Filtro de rango de fechas
        if start_date and end_date:
            queryset = queryset.filter(created_at__date__range=[start_date, end_date])

        # Filtro por tipo de movimiento (Entrada/Salida)
        if movement_type and movement_type != 'ALL':
            queryset = queryset.filter(type=movement_type)

        # Filtro opcional por inventario (Solo para Admin o si el usuario tiene acceso)
        if inventory_id and inventory_id != 'ALL':
            queryset = queryset.filter(product__inventory_id=inventory_id)

        return queryset.select_related('product', 'user', 'product__inventory').order_by('-created_at')