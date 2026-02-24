from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from apps.inventory.models import Inventory, Category, Product, BaseUnit
from apps.alerts.models import Alert
from apps.alerts.services.alert_service import AlertService
from django.contrib.auth import get_user_model

User = get_user_model()

class AlertSystemTest(TestCase):
    def setUp(self):
        self.inventory = Inventory.objects.create(
            name="Test Inventory", 
            selected_option=1,
            has_expiration_date=True
        )
        self.category = Category.objects.create(name="Test Category", inventory=self.inventory)
        self.unit = BaseUnit.objects.create(name="unidad")
        
        self.user = User.objects.create_user(
            email="alert@test.com",
            password="password123",
            role=User.Role.ADMIN
        )

    def test_low_stock_alert_generation(self):
        # Producto con stock bajo (0 < 10)
        product = Product.objects.create(
            name="Bajo Stock",
            category=self.category,
            inventory=self.inventory,
            base_unit=self.unit,
            stock_min_presentations=10,
            quantity_per_presentation=1,
            current_stock=5
        )
        
        AlertService.check_low_stock()
        
        self.assertTrue(Alert.objects.filter(product=product, type='LOW_STOCK').exists())
        alert = Alert.objects.get(product=product, type='LOW_STOCK')
        self.assertIn("poco stock", alert.message)

    def test_expiration_alert_generation(self):
        # Producto que vence en 15 días
        expiry_date = timezone.now().date() + timedelta(days=15)
        product = Product.objects.create(
            name="Vence Pronto",
            category=self.category,
            inventory=self.inventory,
            base_unit=self.unit,
            expiration_date=expiry_date,
            quantity_per_presentation=1,
            current_stock=100
        )
        
        AlertService.check_expirations(days_threshold=30)
        
        self.assertTrue(Alert.objects.filter(product=product, type='EXPIRATION').exists())
        alert = Alert.objects.get(product=product, type='EXPIRATION')
        self.assertIn("vence el", alert.message)
