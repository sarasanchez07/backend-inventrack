from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.authentication.models.user import User

User = get_user_model()

class PersonnelSerializer(serializers.ModelSerializer):
    assigned_inventories = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'first_name', 'email', 'role', 'assigned_inventories']

class PersonnelCreateSerializer(serializers.ModelSerializer):
    assigned_inventories = serializers.ListField(
        child=serializers.IntegerField(), 
        write_only=True,
        required=False
    )
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'first_name', 'email', 'password', 'role', 'assigned_inventories']

    def validate_email(self, value):
        if self.instance:
            if User.objects.filter(email=value).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError("Este correo ya está registrado.")
        else:
            if User.objects.filter(email=value).exists():
                raise serializers.ValidationError("Este correo ya está registrado.")
        return value