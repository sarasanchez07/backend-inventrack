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
        alerts = AlertService.get_dynamic_alerts(request.user)
        return Response(alerts)
