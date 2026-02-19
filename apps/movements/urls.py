from django.urls import path
from .views.movement_views import MovementCreateView, MovementDetailView, MovementListView

urlpatterns = [
    path('', MovementListView.as_view(), name='movement-list'),
    path('movements/register/', MovementCreateView.as_view(), name='movement-register'),
    path('movements/<int:pk>/', MovementDetailView.as_view(), name='movement-detail'),
]
