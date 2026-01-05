import sqlite3
import os
import django
import sys
import json
from datetime import datetime

# Setup Django Environment
sys.path.append(os.path.join(os.path.dirname(__file__), 'plansculpt_backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'plansculpt_backend.settings')
django.setup()

from api.models import User, Employee, Project, Task, Invoice, Transaction, ActivityLog

def migrate_data():
    legacy_db_path = 'server/plansculpt.db'
    if not os.path.exists(legacy_db_path):
        print(f"Error: Legacy DB not found at {legacy_db_path}")
        return

    conn = sqlite3.connect(legacy_db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    print("--- Starting Data Migration ---")

    # 1. Users
    print("Migrating Users...")
    cursor.execute("SELECT * FROM Users")
    users = cursor.fetchall()
    for u in users:
        print(f"Migrating user: {u['username']}")
        
        # Handle NULLs
        email = u['email'] if u['email'] else ''
        phone = u['phone'] if u['phone'] else ''
        full_name = u['fullName'] if u['fullName'] else ''

        # Update or Create
        user, created = User.objects.update_or_create(
            username=u['username'],
            defaults={
                'password': u['password'], # Hashed
                'role': u['role'],
                'fullName': full_name,
                'email': email,
                'phone': phone,
                'is_active': True,
                'is_staff': (u['role'] == 'admin'),
                'is_superuser': (u['role'] == 'admin')
            }
        )
        if created:
            print(f"Created user: {u['username']}")
        else:
            print(f"Updated user: {u['username']}")

            
    print(f"Migrated {len(users)} users.")

    # 2. Employees
    print("Migrating Employees...")
    cursor.execute("SELECT * FROM Employees")
    emps = cursor.fetchall()
    emp_map = {} # Old ID -> New ID
    for e in emps:
        # Check duplicate by customId
        if e['customId'] and Employee.objects.filter(customId=e['customId']).exists():
            new_emp = Employee.objects.get(customId=e['customId'])
            emp_map[e['id']] = new_emp.id
            continue

        new_emp = Employee.objects.create(
            name=e['name'],
            role=e['role'],
            department=e['department'],
            type=e['type'],
            salary=e['salary'],
            email=e['email'],
            phone=e['phone'],
            gender=e['gender'],
            dob=e['dob'],
            customId=e['customId'],
            status=e['status']
        )
        emp_map[e['id']] = new_emp.id
    print(f"Migrated {len(emps)} employees.")

    # 3. Projects
    print("Migrating Projects...")
    cursor.execute("SELECT * FROM Projects")
    projs = cursor.fetchall()
    proj_map = {}
    for p in projs:
        if p['customId'] and Project.objects.filter(customId=p['customId']).exists():
           new_proj = Project.objects.get(customId=p['customId'])
           proj_map[p['id']] = new_proj.id
           continue
           
        new_proj = Project.objects.create(
            name=p['name'],
            client=p['client'],
            clientEmail=p['clientEmail'],
            clientPhone=p['clientPhone'],
            description=p['description'],
            income=p['income'],
            startDate=p['startDate'],
            status=p['status'],
            customId=p['customId']
        )
        proj_map[p['id']] = new_proj.id
    print(f"Migrated {len(projs)} projects.")

    # 4. Tasks
    print("Migrating Tasks...")
    cursor.execute("SELECT * FROM Tasks")
    tasks = cursor.fetchall()
    for t in tasks:
        # Map IDs
        pid = proj_map.get(t['projectId'])
        aid = emp_map.get(t['assigneeId'])
        
        if not pid: continue # Skip orphan tasks (shouldn't happen with CASCADE but possible)

        Task.objects.create(
            title=t['title'],
            project_id=pid,
            assignee_id=aid,
            cost=t['cost'],
            status=t['status'],
            paymentStatus=t['paymentStatus']
        )
    print(f"Migrated {len(tasks)} tasks.")

    # 5. Invoices
    print("Migrating Invoices...")
    cursor.execute("SELECT * FROM Invoices")
    invs = cursor.fetchall()
    inv_map = {}
    for i in invs:
        pid = proj_map.get(i['projectId'])
        new_inv = Invoice.objects.create(
            project_id=pid,
            clientName=i['clientName'],
            clientEmail=i['clientEmail'],
            items=i['items'], # JSON string
            total=i['total'],
            status=i['status'],
            date=i['date']
        )
        inv_map[i['id']] = new_inv.id
    print(f"Migrated {len(invs)} invoices.")

    # 6. Transactions
    print("Migrating Transactions...")
    cursor.execute("SELECT * FROM Transactions")
    trans = cursor.fetchall()
    for t in trans:
        pid = proj_map.get(t['projectId'])
        eid = emp_map.get(t['employeeId'])
        iid = inv_map.get(t['invoiceId'])
        
        Transaction.objects.create(
            type=t['type'],
            amount=t['amount'],
            category=t['category'],
            description=t['description'],
            date=t['date'],
            project_id=pid,
            employee_id=eid,
            invoice_id=iid
        )
    print(f"Migrated {len(trans)} transactions.")

    conn.close()
    print("--- Migration Complete ---")

if __name__ == '__main__':
    migrate_data()
