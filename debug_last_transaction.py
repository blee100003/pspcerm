import os
import django
from django.conf import settings

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'plansculpt_backend.settings')
django.setup()

from api.models import Transaction, Project

def check_last_transaction():
    try:
        last_trans = Transaction.objects.order_by('-createdAt').first()
        if not last_trans:
            print("No transactions found.")
            return

        print(f"Last Transaction ID: {last_trans.id}")
        print(f"Description: {last_trans.description}")
        print(f"Amount: {last_trans.amount}")
        print(f"Project: {last_trans.project} (ID: {last_trans.project_id if last_trans.project else 'None'})")
        print(f"Invoice: {last_trans.invoice} (ID: {last_trans.invoice_id if last_trans.invoice else 'None'})")
        
        if last_trans.project:
            print("Project Link: OK")
        else:
            print("Project Link: MISSING")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    check_last_transaction()
