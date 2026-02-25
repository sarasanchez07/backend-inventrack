from django.urls import path
from apps.inventory.views.inventory_views import (
    InventoryCreateView,
    InventoryDetailView,
    InventoryListView,
)
from apps.inventory.views.category_views import (
    CategoryView,
    CategoryDetailView,
    CategoryProductsView,
)
from apps.inventory.views.product_views import ProductListView, ProductDetailView

urlpatterns = [
    # Inventarios
    path('', InventoryListView.as_view(), name='inventory-list'),
    path('create/', InventoryCreateView.as_view()),
    path('<int:pk>/', InventoryDetailView.as_view()),

    # Categorías
    path('categories/', CategoryView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', CategoryDetailView.as_view(), name='category-detail'),
    path('categories/<int:pk>/products/', CategoryProductsView.as_view(), name='category-products'),

    # Productos
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/create/', ProductListView.as_view()),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
]