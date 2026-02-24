from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from ..services.alert_service import AlertService
from ..serializers.alert_serializers import AlertSerializer
from ..models import Alert
from django.shortcuts import get_object_or_404

class AlertListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        alerts = AlertService.get_active_alerts_for_user(request.user)
        serializer = AlertSerializer(alerts, many=True)
        return Response(serializer.data)

class AlertResolveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        alert = get_object_or_404(Alert, pk=pk)
        # Aquí podrías añadir lógica de permisos si fuera necesario
        alert.is_resolved = True
        alert.save()
        return Response({"message": "Alerta marcada como resuelta"})

class AlertCheckTriggerView(APIView):
    """
    Endpoint manual para forzar el chequeo de alertas.
    Idealmente esto se correría en un Celery Task o Cron.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'admin':
            return Response({"error": "Solo administradores pueden disparar el chequeo manual."}, status=status.HTTP_403_FORBIDDEN)
            
        low_stock_count = AlertService.check_low_stock()
        expiration_count = AlertService.check_expirations()
        
        return Response({
            "message": "Chequeo completado",
            "low_stock_alerts_created": low_stock_count,
            "expiration_alerts_created": expiration_count
        })
