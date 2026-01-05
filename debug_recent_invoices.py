import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'plansculpt_backend.settings')
django.setup()

from api.models import Invoice, Transaction

def debug_recent():
    print("--- Recent Invoices ---")
    invoices = Invoice.objects.order_by('-createdAt')[:5]
    for inv in invoices:
        print(f"Invoice ID: {inv.id} | Total: {inv.total} | Status: {inv.status} | Project: {inv.project} (ID: {inv.project_id})")
        
        # Check Transaction
        trans = Transaction.objects.filter(invoice=inv)
        if trans.exists():
            for t in trans:
                print(f"  -> Linked Transaction: ID {t.id} | Amount: {t.amount} | Type: {t.type} | Project: {t.project}")
        else:
            print(f"  -> NO Linked Transaction found.")
            
if __name__ == '__main__':
    debug_recent()
