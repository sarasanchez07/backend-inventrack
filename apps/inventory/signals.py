from django.db.models.signals import post_save
from django.dispatch import receiver
from decimal import Decimal
from django.conf import settings
from django.db import transaction

from apps.inventory.models import Product
from apps.movements.services.movement_service import MovementService


@receiver(post_save, sender=Product)
def create_initial_stock_movement(sender, instance, created, **kwargs):

    print("✅ SIGNAL INVENTORY EJECUTADO")

    if not created:
        return

    if not instance.stock_initial_presentations:
        return

    initial_stock = (
        Decimal(instance.stock_initial_presentations)
        * Decimal(instance.quantity_per_presentation or 1)
    )

    # ✅ En tests ejecutar inmediato
    if getattr(settings, "TESTING", False):
        MovementService.create_initial_movement(
            product=instance,
            quantity=initial_stock,
        )
    else:
        transaction.on_commit(lambda: MovementService.create_initial_movement(
            product=instance,
            quantity=initial_stock,
        ))