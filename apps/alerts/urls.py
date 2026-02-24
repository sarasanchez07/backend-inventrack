from django.urls import path
from .views.alert_views import AlertListView, AlertResolveView, AlertCheckTriggerView

urlpatterns = [
    path('', AlertListView.as_view(), name='alert-list'),
    path('<int:pk>/resolve/', AlertResolveView.as_view(), name='alert-resolve'),
    path('trigger-check/', AlertCheckTriggerView.as_view(), name='alert-check-trigger'),
]
