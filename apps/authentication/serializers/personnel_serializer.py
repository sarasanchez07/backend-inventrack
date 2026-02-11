from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class PersonnelCreateSerializer(serializers.ModelSerializer):
    # Campo para recibir la lista de IDs de inventarios del formulario
    assigned_inventories = serializers.ListField(
        child=serializers.IntegerField(), 
        write_only=True,
        required=False
    )
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'first_name', 'email', 'password', 'role', 'assigned_inventories']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este correo ya está registrado.")
        return value