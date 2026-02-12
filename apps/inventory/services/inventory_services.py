from apps.inventory.models import Inventory, BaseUnit, Presentation

class InventoryService:
    @staticmethod
    def create_inventory_with_config(data):
        option = data.get('selected_option')
        inventory = Inventory.objects.create(
            name=data.get('name'),
            description=data.get('description'),
            selected_option=option
        )

        # 1. Configuración de Switches y Catálogos
        if option == 1: # Medicamentos
            inventory.has_concentration = True
            inventory.has_presentation = True
            inventory.has_quantity_per_presentation = True
            inventory.has_expiration_date = True
            
            # Unidades predeterminadas
            units = ['mg', 'ml', 'pastilla']
            # Presentaciones predeterminadas
            pres = ['Tableta', 'Jarabe', 'Intravenoso']
            
        elif option == 2: # Alimentos
            inventory.has_concentration = False
            inventory.has_presentation = True
            inventory.has_quantity_per_presentation = True
            inventory.has_expiration_date = True
            
            units = ['Kg', 'Lb', 'g']
            pres = ['Bolsa', 'Caja', 'Frasco']

        elif option == 3: # Objetos
            inventory.has_concentration = False
            inventory.has_presentation = False
            inventory.has_quantity_per_presentation = False
            inventory.has_expiration_date = False
            
            units = ['unidad'] # Selector con números exactos
            pres = []

        else: # Opción 4: Personalizado
            units, pres = [], []

        # 2. Guardar switches y asociar catálogos
        inventory.save()
        
        for u_name in units:
            unit, _ = BaseUnit.objects.get_or_create(name=u_name)
            inventory.allowed_units.add(unit)
            
        for p_name in pres:
            p_obj, _ = Presentation.objects.get_or_create(name=p_name)
            inventory.allowed_presentations.add(p_obj)

        return inventory