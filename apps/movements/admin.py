from django.contrib import admin
from .models import Movement
from .services.movement_service import MovementService

@admin.register(Movement)
class MovementAdmin(admin.ModelAdmin):
    # Columnas de la tabla principal
    list_display = ('id', 'product_name_at_time', 'type', 'quantity', 'get_unit', 'user', 'created_at')
    
    # Campos de solo lectura
    readonly_fields = ('get_unit', 'product_name_at_time')
    
    # Filtros y Buscador
    list_filter = ('type', 'created_at', 'user')
    search_fields = ('product_name_at_time', 'reason', 'notes')
    ordering = ('-created_at',)

    def get_unit(self, obj):
        if obj.product and obj.product.base_unit:
            return obj.product.base_unit.name
        return "N/A"
    get_unit.short_description = 'Unidad'

    # Lógica de guardado corregida
    def save_model(self, request, obj, form, change):
        if not change:  # Registro nuevo
            # 1. Aseguramos que el usuario del registro sea el que está logueado
            obj.user = request.user
            
            # 2. Ejecutamos la lógica de stock
            from types import SimpleNamespace
            mock_serializer = SimpleNamespace(save=lambda **kwargs: obj)
            MovementService.register_movement(request.user, mock_serializer)
            
            # 3. ¡IMPORTANTE! Django Admin necesita que se llame al padre para GUARDAR físicamente
            super().save_model(request, obj, form, change)
        else:
            # Para ediciones del Admin, solo guardamos cambios de texto
            super().save_model(request, obj, form, change)

    def has_change_permission(self, request, obj=None):
        return request.user.role == 'admin'

    def has_delete_permission(self, request, obj=None):
        return request.user.role == 'admin'