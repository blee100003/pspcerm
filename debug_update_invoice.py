import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'plansculpt_backend.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from datetime import datetime

from api.views import InvoiceViewSet
from api.models import User, Invoice

def test_update_invoice():
    try:
        inv = Invoice.objects.get(id=8)
        print(f"Current Status: {inv.status}")
        
        user, _ = User.objects.get_or_create(username='admin_test', defaults={'role': 'admin'})
        factory = APIRequestFactory()
        view = InvoiceViewSet.as_view({'put': 'update'}) # Using PUT as per Service
        
        # Prepare full payload as PUT requires it usually, though partial=False default
        data = {
            'clientName': inv.clientName,
            'clientEmail': inv.clientEmail,
            'projectId': inv.project_id,
            'items': inv.items,
            'total': inv.total,
            'status': 'Paid', # CHANGING TO PAID
            'date': inv.date
        }
        
        req = factory.put(f'/api/invoices/{inv.id}/', data, format='json')
        force_authenticate(req, user=user)
        
        print("Sending Update Request...")
        res = view(req, pk=inv.id)
        print(f"Status Code: {res.status_code}")
        
        inv.refresh_from_db()
        print(f"New Status in DB: {inv.status}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    test_update_invoice()
