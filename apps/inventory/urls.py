from django.urls import path
from apps.inventory.views.inventory_views import InventoryCreateView, InventoryDetailView
from apps.inventory.views.category_views import CategoryView
from apps.inventory.views.product_views import ProductListView
from apps.inventory.views.product_views import ProductDetailView
from apps.inventory.views.category_views import CategoryDetailView

urlpatterns = [
    path('create/', InventoryCreateView.as_view()),
    path('<int:pk>/', InventoryDetailView.as_view()),
    path('categories/', CategoryView.as_view(), name='category-list-create'),
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/create/', ProductListView.as_view()),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('categories/<int:pk>/', CategoryDetailView.as_view(), name='category-detail'),
]