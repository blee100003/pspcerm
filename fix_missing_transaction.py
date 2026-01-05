import os
import django
from datetime import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'plansculpt_backend.settings')
django.setup()

from api.models import Transaction, Invoice

def fix_transaction():
    try:
        inv = Invoice.objects.get(id=8)
        if inv.status != 'Paid':
            print("Invoice not paid. Skipping.")
            return

        # Check if transaction exists
        exists = Transaction.objects.filter(invoice=inv).exists()
        if exists:
            print("Transaction already exists.")
            return

        print("Creating missing transaction...")
        Transaction.objects.create(
            type='income',
            amount=inv.total,
            category='Invoice Payment',
            description=f"Payment for Invoice #{inv.id}",
            date=datetime.now().isoformat(),
            invoice=inv,
            project=inv.project
        )
        print("Done.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    fix_transaction()
