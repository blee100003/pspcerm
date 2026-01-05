import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'plansculpt_backend.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from datetime import datetime
import json

from api.views import InvoiceViewSet, TransactionViewSet
from api.models import User, Project, Invoice, Transaction

def test_invoice_flow():
    # Setup
    print("Setting up test...")
    user, _ = User.objects.get_or_create(username='admin_test', defaults={'role': 'admin'})
    project = Project.objects.first()
    if not project:
        project = Project.objects.create(name="Test Project", client="Client")

    factory = APIRequestFactory()
    invoice_view = InvoiceViewSet.as_view({'post': 'create', 'delete': 'destroy'})

    # 1. Create Paid Invoice
    print("\n--- 1. Creating Paid Invoice ---")
    data = {
        'clientName': 'Test Client',
        'projectId': project.id,
        'status': 'Paid', # DIRECTLY creating as Paid
        'total': 1000,
        'date': datetime.now().strftime('%Y-%m-%d'),
        'items': []
    }
    req = factory.post('/api/invoices/', data, format='json')
    force_authenticate(req, user=user)
    res = invoice_view(req)
    
    print(f"Create Status: {res.status_code}")
    if res.status_code != 201:
        print(f"Error: {res.data}")
        return

    invoice_id = res.data['id']
    print(f"Invoice Created: {invoice_id}")
    
    # 2. Check for Transaction (Note: InvoiceViewSet doesn't auto-create Transaction, FinanceService does)
    # So we must manually trigger the Transaction creation like the Frontend would.
    print("\n--- 2. Simulating Frontend 'markInvoicePaid' (Transaction Create) ---")
    
    trans_view = TransactionViewSet.as_view({'post': 'create'})
    trans_data = {
        'type': 'income',
        'amount': 1000,
        'category': 'Invoice Payment',
        'description': f"Payment for Invoice #{invoice_id}",
        'date': datetime.now().isoformat(),
        'invoiceId': invoice_id,
        'projectId': project.id
    }
    req = factory.post('/api/transactions/', trans_data, format='json')
    force_authenticate(req, user=user)
    res = trans_view(req)

    print(f"Transaction Create Status: {res.status_code}")
    if res.status_code == 201:
        t_id = res.data['id']
        t = Transaction.objects.get(id=t_id)
        print(f"Transaction Created: {t_id}")
        print(f"Linked Project: {t.project} (Expected: {project})")
        print(f"Linked Invoice: {t.invoice} (Expected: Invoice {invoice_id})")
        if t.project == project and t.invoice.id == invoice_id:
            print("SUCCESS: Transaction correct.")
        else:
            print("FAILURE: Linkage incorrect.")
    else:
        print(f"Error: {res.data}")

    # 3. Delete Invoice
    print(f"\n--- 3. Deleting Invoice #{invoice_id} ---")
    req = factory.delete(f'/api/invoices/{invoice_id}/')
    force_authenticate(req, user=user)
    invoice_delete_view = InvoiceViewSet.as_view({'delete': 'destroy'})
    res = invoice_delete_view(req, pk=invoice_id)
    
    print(f"Delete Status: {res.status_code}")
    
    if res.status_code == 204:
        print("SUCCESS: Invoice deleted.")
        # Verify Cascade/SetNull
        # Transaction should still exist but invoice might be null (SET_NULL) or cascade?
        # Model says SET_NULL.
        t.refresh_from_db()
        print(f"Transaction Invoice after delete: {t.invoice}")
    else:
        print(f"Error: {res.data}")

if __name__ == '__main__':
    test_invoice_flow()
