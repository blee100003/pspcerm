import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'plansculpt_backend.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from datetime import datetime

from api.views import InvoiceViewSet, TransactionViewSet
from api.models import User, Project, Invoice, Transaction

def test_frontend_flow():
    user, _ = User.objects.get_or_create(username='admin_test', defaults={'role': 'admin'})
    project = Project.objects.first()
    if not project:
        print("No project found")
        return

    print(f"Testing Flow with Project: {project.name} (ID: {project.id})")
    
    factory = APIRequestFactory()
    
    # 1. InvoiceService.create
    print("\n--- Step 1: Create Invoice (Draft/Paid) ---")
    inv_data = {
        'clientName': 'Flow Test',
        'projectId': project.id,
        'status': 'Paid', # User selects Paid in form
        'total': 5000,
        'date': datetime.now().strftime('%Y-%m-%d'),
        'items': []
    }
    
    # Invoicing.jsx calls create -> POST /invoices/
    inv_view = InvoiceViewSet.as_view({'post': 'create'})
    req = factory.post('/api/invoices/', inv_data, format='json')
    force_authenticate(req, user=user)
    res = inv_view(req)
    
    if res.status_code != 201:
        print(f"Create Failed: {res.data}")
        return
        
    invoice_id = res.data['id']
    print(f"Invoice Created: {invoice_id}")

    # 2. FinanceService.markInvoicePaid
    # Invoicing.jsx: if (status === 'Paid') markInvoicePaid(...)
    print("\n--- Step 2: Mark Paid (Transaction) ---")
    
    # Part A: PATCH Invoice (Redundant usually)
    update_view = InvoiceViewSet.as_view({'patch': 'partial_update'})
    req = factory.patch(f'/api/invoices/{invoice_id}/', {'status': 'Paid'}, format='json')
    force_authenticate(req, user=user)
    res = update_view(req, pk=invoice_id)
    print(f"Patch Status: {res.status_code}")

    # Part B: POST Transaction
    trans_view = TransactionViewSet.as_view({'post': 'create'})
    trans_data = {
        'type': 'income',
        'amount': 5000,
        'description': f"Payment for Invoice #{invoice_id}",
        'category': 'Invoice Payment',
        'date': datetime.now().isoformat(),
        'invoiceId': invoice_id,
        'projectId': project.id # Passed from form data
    }
    
    req = factory.post('/api/transactions/', trans_data, format='json')
    force_authenticate(req, user=user)
    res = trans_view(req)
    
    if res.status_code != 201:
        print(f"Transaction Success: False. Response: {res.data}")
    else:
        print(f"Transaction Success: True. ID: {res.data['id']}")
        
        # Verify Linkage
        t = Transaction.objects.get(id=res.data['id'])
        print(f"Linked Project: {t.project}")
        if t.project == project:
            print("VERDICT: Flow SHOULD work.")
        else:
            print("VERDICT: Linked Project matches expectations? NO.")

if __name__ == '__main__':
    test_frontend_flow()
