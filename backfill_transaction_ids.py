import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'plansculpt_backend.settings')
django.setup()

from api.models import Transaction

def backfill():
    txns = Transaction.objects.filter(customId__isnull=True)
    count = txns.count()
    print(f"Found {count} transactions without ID.")
    for t in txns:
        t.save() # Triggers the ID generation in save() method
        print(f"Updated {t.id} -> {t.customId}")

if __name__ == '__main__':
    backfill()
