from django.urls import path
from apps.inventory.views import InventoryCreateView

urlpatterns = [
    path('create/', InventoryCreateView.as_view(), name='inventory-create'),
]