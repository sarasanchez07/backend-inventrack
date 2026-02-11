from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.inventory.serializers import InventorySerializer
from apps.authentication.permissions import IsAdminUser

class InventoryCreateView(APIView):
    permission_classes = [IsAdminUser] # Solo Admin (Nivel 1)

    def post(self, request):
        serializer = InventorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)