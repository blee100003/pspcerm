
import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'plansculpt_backend.settings')
django.setup()

from api.models import User, Employee, Project, Task, Invoice, Transaction

print(f"Users: {User.objects.count()}")
print(f"Employees: {Employee.objects.count()}")
print(f"Projects: {Project.objects.count()}")
print(f"Tasks: {Task.objects.count()}")
print(f"Invoices: {Invoice.objects.count()}")
print(f"Transactions: {Transaction.objects.count()}")

# Try to fetch one project to see if fields work
if Project.objects.exists():
    p = Project.objects.first()
    print(f"Sample Project: {p.name} (ID: {p.id})")
