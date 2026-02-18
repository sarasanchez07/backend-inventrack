from django.urls import path
from .views.movement_views import MovementCreateView, MovementDetailView # Verifica que el nombre sea exacto

urlpatterns = [
    path('register/', MovementCreateView.as_view(), name='movement-register'),
    path('<int:pk>/', MovementDetailView.as_view(), name='movement-detail'),
]