from django.db import models
from django.contrib.auth.models import AbstractUser

# User Model
class User(AbstractUser):
    role = models.CharField(max_length=20, default='user')
    fullName = models.CharField(max_length=255, null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    dob = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.username

# Employee Model
class Employee(models.Model):
    TYPES = [('fixed', 'Fixed'), ('freelance', 'Freelance')]
    
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=100)
    department = models.CharField(max_length=100, default='General', null=True, blank=True)
    type = models.CharField(max_length=20, choices=TYPES, default='fixed')
    salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=50, null=True, blank=True)
    dob = models.CharField(max_length=50, null=True, blank=True) # Keeping as string to match legacy, but DateField is better
    gender = models.CharField(max_length=20, null=True, blank=True)
    customId = models.CharField(max_length=50, unique=True, null=True, blank=True)
    
    status = models.CharField(max_length=50, default='active')
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

# Project Model
class Project(models.Model):
    name = models.CharField(max_length=255)
    client = models.CharField(max_length=255) # corrected to match legacy
    clientEmail = models.EmailField(null=True, blank=True)
    clientPhone = models.CharField(max_length=50, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    income = models.DecimalField(max_digits=10, decimal_places=2, default=0) # Budget
    startDate = models.CharField(max_length=50, null=True, blank=True) # Legacy used string
    status = models.CharField(max_length=50, default='In Progress')
    customId = models.CharField(max_length=50, unique=True, null=True, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

# Task Model
class Task(models.Model):
    title = models.CharField(max_length=255)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    assignee = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='tasks')
    assigneeName = models.CharField(max_length=255, null=True, blank=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=50, default='Pending')
    paymentStatus = models.CharField(max_length=50, default='Pending')
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

# Invoice Model
class Invoice(models.Model):
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True, related_name='invoices')
    clientName = models.CharField(max_length=255, null=True, blank=True)
    clientEmail = models.EmailField(null=True, blank=True)
    items = models.TextField() # JSON string
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=50, default='Draft')
    date = models.CharField(max_length=50, default='') # Legacy used default NOW, but as string.
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Invoice {self.id}"

# Transaction Model
class Transaction(models.Model):
    TYPES = [('income', 'income'), ('expense', 'expense')]
    
    type = models.CharField(max_length=20, choices=TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=100)
    description = models.CharField(max_length=255)
    date = models.CharField(max_length=50)
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    employee = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    invoice = models.ForeignKey(Invoice, on_delete=models.SET_NULL, null=True, blank=True, related_name='transaction_record')
    customId = models.CharField(max_length=20, unique=True, null=True, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.customId:
            import random, string
            while True:
                # 10 digit random alphabets (Uppercased for readability)
                new_id = ''.join(random.choices(string.ascii_uppercase, k=10))
                if not Transaction.objects.filter(customId=new_id).exists():
                    self.customId = new_id
                    break
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.type} - {self.amount} ({self.customId})"

# Activity Log
class ActivityLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activity_logs')
    action = models.CharField(max_length=100)
    details = models.TextField(null=True, blank=True)
    ip = models.CharField(max_length=50, null=True, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.action} by {self.user.username}"
