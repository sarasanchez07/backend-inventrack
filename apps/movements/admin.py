from django.contrib import admin
from .models import Movement
from django.utils.html import format_html

@admin.register(Movement)
class MovementAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'product_name_at_time',
        'type',
        'quantity_display',
        'is_edited',
        'unit_type',
        'get_unit',
        'user',
        'created_at'
    )

    readonly_fields = ('get_unit', 'product_name_at_time', 'is_edited', 'original_quantity', 'edited_by')

    list_filter = ('type', 'unit_type', 'created_at', 'user','is_edited')
    search_fields = ('product_name_at_time', 'reason', 'notes')
    ordering = ('-created_at',)

    def get_unit(self, obj):
        if obj.product and obj.product.base_unit:
            return obj.product.base_unit.name
        return "N/A"

    get_unit.short_description = 'Unidad'

    def save_model(self, request, obj, form, change):
        # Si NO es un objeto nuevo (change=True), guardamos quién lo editó
        if change:
            obj.edited_by = request.user
        else:
            # Si es nuevo, asignamos el usuario creador y el nombre del producto
            obj.user = request.user
            if obj.product:
                obj.product_name_at_time = obj.product.name
        
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
