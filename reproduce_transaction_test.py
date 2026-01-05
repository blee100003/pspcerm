import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'plansculpt_backend.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from datetime import datetime

from api.views import TransactionViewSet
from api.models import User, Project, Invoice

def test_create_transaction():
    # Setup Data
    user = User.objects.filter(role='admin').first() or User.objects.create(username='admin_test', role='admin')
    project = Project.objects.first()
    if not project:
        project = Project.objects.create(name="Test Proj", client="Client")
    
    invoice = Invoice.objects.create(items="[]")

    print(f"Testing with Project ID: {project.id}, Invoice ID: {invoice.id}")

    factory = APIRequestFactory()
    view = TransactionViewSet.as_view({'post': 'create'})

    # Payload with camelCase keys
    data = {
        'type': 'income',
        'amount': 500,
        'category': 'Test',
        'description': 'Test creation',
        'date': datetime.now().isoformat(),
        'projectId': project.id,
        'invoiceId': invoice.id
    }

    request = factory.post('/api/transactions/', data, format='json')
    force_authenticate(request, user=user)
    
    response = view(request)
    print(f"Response Status: {response.status_code}")
    print(f"Response Data: {response.data}")

    # Verify ID
    if response.status_code == 201:
        tx_id = response.data['id']
        from api.models import Transaction
        tx = Transaction.objects.get(id=tx_id)
        print(f"DB Project: {tx.project}")
        print(f"DB Invoice: {tx.invoice}")
        
        if tx.project == project:
            print("SUCCESS: Project linked.")
        else:
            print("FAILURE: Project NOT linked.")

if __name__ == '__main__':
    test_create_transaction()
