from rest_framework import serializers
from apps.inventory.models import Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'inventory', 'created_at']