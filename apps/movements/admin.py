from django.contrib import admin
from .models import Movement


@admin.register(Movement)
class MovementAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'product_name_at_time',
        'type',
        'quantity',
        'unit_type',
        'get_unit',
        'user',
        'created_at'
    )

    readonly_fields = ('get_unit', 'product_name_at_time')

    list_filter = ('type', 'unit_type', 'created_at', 'user')
    search_fields = ('product_name_at_time', 'reason', 'notes')
    ordering = ('-created_at',)

    def get_unit(self, obj):
        if obj.product and obj.product.base_unit:
            return obj.product.base_unit.name
        return "N/A"

    get_unit.short_description = 'Unidad'

    def save_model(self, request, obj, form, change):
        obj.user = request.user
        obj.product_name_at_time = obj.product.name
        super().save_model(request, obj, form, change)

    def has_change_permission(self, request, obj=None):
        return request.user.role in ['admin', 'personal']

    def has_delete_permission(self, request, obj=None):
        return request.user.role == 'admin'
