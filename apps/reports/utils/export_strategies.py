import csv
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

class ExportStrategy:
    def export(self, queryset, filename):
        raise NotImplementedError

class CSVExportStrategy(ExportStrategy):
    def export(self, queryset, filename):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{filename}.csv"'
        response.write('\ufeff') # Agrega BOM para que Excel detecte UTF-8
        writer = csv.writer(response, delimiter=';')
        writer.writerow(['Fecha', 'Producto', 'Inventario', 'Tipo', 'Cantidad', 'Motivo', 'Personal'])
        for m in queryset:
            inv_name = m.product.inventory.name if m.product and hasattr(m.product, 'inventory') and m.product.inventory else "N/A"
            movement_type = "Entrada" if m.type == "IN" else "Salida"
            date_formatted = m.created_at.strftime('%d/%m/%Y')
            writer.writerow([date_formatted, m.product_name_at_time, inv_name, movement_type, m.quantity, m.reason, m.user.email])
        return response

class PDFExportStrategy(ExportStrategy):
    def export(self, queryset, filename):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}.pdf"'
        p = canvas.Canvas(response, pagesize=letter)
        y = 750
        p.drawString(100, y, "Reporte de Movimientos InvenTrack")
        y -= 30
        for m in queryset:
            line = f"{m.created_at.date()} | {m.product_name_at_time} | {m.type} | {m.quantity} | {m.user.email}"
            p.drawString(50, y, line)
            y -= 20
            if y < 50: p.showPage(); y = 750
        p.save()
        return response