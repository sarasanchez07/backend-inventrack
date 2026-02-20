from django.contrib import admin
from .models import Movement
from django.utils.html import format_html
from django.utils import timezone

@admin.register(Movement)
class MovementAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'product_name_at_time',
        'type',
        'quantity_display',
        'get_unit_fixed',
        'status_display',
        'is_edited',
        'unit_type',
        'get_unit_fixed',
        'user',
        'created_at'
    )

    readonly_fields = (
        'get_unit_fixed',
        'product_name_at_time', 
        'is_edited',
        'original_quantity', 
        'edited_by', 
        'unit_name_at_time',
        'cancelled_at', 
        'cancelled_by'
    )

    list_filter = ('type', 'unit_type', 'created_at', 'user','is_edited', 'is_cancelled')
    search_fields = ('product_name_at_time', 'reason', 'notes')
    ordering = ('-created_at',)
    actions = ['cancel_movements']

    def get_unit_fixed(self, obj):
        # 1. Prioridad al respaldo histórico
        if obj.unit_name_at_time:
            return obj.unit_name_at_time
        
        # 2. Si es N/A, intentar recuperarlo del producto vivo
        if obj.product and obj.product.base_unit:
            return obj.product.base_unit.name
            
        return "N/A"

    def save_model(self, request, obj, form, change):
        # Si NO es un objeto nuevo (change=True), guardamos quién lo editó
        if change:
            obj.edited_by = request.user
        else:
            # Si es nuevo, asignamos el usuario creador y el nombre del producto
            obj.user = request.user
            if obj.product:
                obj.product_name_at_time = obj.product.name
                if obj.product.base_unit:
                    obj.unit_name_at_time = obj.product.base_unit.name
        
        super().save_model(request, obj, form, change)

    def has_change_permission(self, request, obj=None):
        return request.user.role in ['admin', 'personal']

    def has_delete_permission(self, request, obj=None):
        return request.user.role == 'admin'
    
    def quantity_display(self, obj):
        if obj.is_edited and obj.original_quantity:
            # Esto crea un "globo" de texto nativo del navegador en el Admin
            return format_html(
                '<span title="Originalmente era: {}" style="color: #ff9800; cursor: help;">{}</span>',
                obj.original_quantity,
                obj.quantity
            )
        return obj.quantity

    quantity_display.short_description = 'Cantidad' 

    @admin.action(description="Anular movimientos seleccionados")
    def cancel_movements(self, request, queryset):

        ahora = timezone.now()

        for movement in queryset:
            if not movement.is_cancelled:
                # Validación preventiva
                if movement.type == 'IN':
                    new_stock = movement.product.current_stock - movement.quantity
                    if new_stock < 0:
                        self.message_user(request, f"No se puede anular la entrada del producto {movement.product.name} porque el stock quedaría negativo.", level='ERROR')
                        continue
                
                # Si pasa la validación, anular
                movement.is_cancelled = True
                movement.cancelled_at = ahora
                movement.cancelled_by = request.user
                movement.save()

    def status_display(self, obj):
        if obj.is_cancelled:
            return format_html('<span style="color: red; font-weight: bold;">Anulado</span>')
        
        if not obj.product:
            return format_html(
                '<span style="color: #666; font-weight: bold;">'
                'Inactivo</span>'
            )
        
        return format_html('<span style="color: green;">Activo</span>')
    
    status_display.short_description = 'Estado'