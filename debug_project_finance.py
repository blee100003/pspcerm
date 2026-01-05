import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'plansculpt_backend.settings')
django.setup()

from api.models import Project, Transaction, Invoice, Task
from django.db.models import Sum

def debug_project():
    try:
        p = Project.objects.filter(name__icontains='Hydrology').first()
        if not p:
            print("Project 'Hydrology' not found. Listing all:")
            for proj in Project.objects.all():
                print(f"- {proj.name} (ID: {proj.id})")
            return

        print(f"Project: {p.name} (ID: {p.id})")
        print(f"Budget (Income field): {p.income}")
        
        # Transactions
        print("\n--- Transactions ---")
        trans = Transaction.objects.filter(project=p)
        income_total = 0
        expense_total = 0
        for t in trans:
            print(f"ID: {t.id} | Type: {t.type} | Amount: {t.amount} | Desc: {t.description}")
            if t.type == 'income': income_total += t.amount
            if t.type == 'expense': expense_total += t.amount
            
        print(f"Total Income (Got): {income_total}")
        print(f"Total Expense: {expense_total}")
        print(f"Calc Remaining: {p.income - expense_total}")

        # Invoices
        print("\n--- Invoices ---")
        invs = Invoice.objects.filter(project=p)
        for i in invs:
            print(f"ID: {i.id} | Status: {i.status} | Total: {i.total} | ProjectID in DB: {i.project_id}")

    except Exception as e:
        print(e)

if __name__ == '__main__':
    debug_project()
