from rest_framework import serializers
from .models import User, Employee, Project, Task, Invoice, Transaction, ActivityLog
import json

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'role', 'fullName', 'email', 'phone', 'dob', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    actualIncome = serializers.SerializerMethodField()
    actualExpenses = serializers.SerializerMethodField()
    remainingBudget = serializers.SerializerMethodField()
    taskCount = serializers.SerializerMethodField()
    completedTaskCount = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = '__all__'

    def get_actualIncome(self, obj):
        # Sum of income transactions
        return sum(t.amount for t in obj.transactions.all() if t.type == 'income')

    def get_actualExpenses(self, obj):
        # Sum of expense transactions
        return sum(t.amount for t in obj.transactions.all() if t.type == 'expense')

    def get_remainingBudget(self, obj):
        # Budget (income field in project) - Actual Expenses
        expenses = self.get_actualExpenses(obj)
        return (obj.income or 0) - expenses

    def get_taskCount(self, obj):
        return obj.tasks.count()

    def get_completedTaskCount(self, obj):
        return obj.tasks.filter(status='Completed').count()

    def get_progress(self, obj):
        total = obj.tasks.count()
        if total == 0: return 0
        completed = obj.tasks.filter(status='Completed').count()
        return round((completed / total) * 100)

class TaskSerializer(serializers.ModelSerializer):
    assigneeId = serializers.ReadOnlyField(source='assignee_id')
    projectId = serializers.ReadOnlyField(source='project_id')

    class Meta:
        model = Task
        fields = '__all__'

    def to_internal_value(self, data):
        data = data.copy() # Make mutable
        if 'projectId' in data:
            data['project'] = data.pop('projectId')
        if 'assigneeId' in data:
            data['assignee'] = data.pop('assigneeId')
        return super().to_internal_value(data)

class InvoiceSerializer(serializers.ModelSerializer):
    items_json = serializers.JSONField(source='items', required=False) # Helper to handle JSON parsing if needed
    projectId = serializers.ReadOnlyField(source='project_id')

    class Meta:
        model = Invoice
        fields = '__all__'

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        try:
            ret['items'] = json.loads(instance.items)
        except:
            ret['items'] = []
        return ret
    
    def validate_items(self, value):
        if isinstance(value, list):
            return json.dumps(value)
        return value

    def to_internal_value(self, data):
        data = data.copy()
        # Map projectId -> project
        if 'projectId' in data:
            data['project'] = data.pop('projectId')

        # Allow sending 'items' as a list, convert to string
        if 'items' in data and isinstance(data['items'], list):
            data['items'] = json.dumps(data['items'])
        return super().to_internal_value(data)

class TransactionSerializer(serializers.ModelSerializer):
    employeeId = serializers.ReadOnlyField(source='employee_id')
    projectId = serializers.ReadOnlyField(source='project_id')
    project_details = serializers.SerializerMethodField()
    employee_details = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = '__all__'

    def get_project_details(self, obj):
        if not obj.project: return None
        return {
            'name': obj.project.name,
            'client': obj.project.client,
            'clientEmail': obj.project.clientEmail,
            'clientPhone': obj.project.clientPhone
        }

    def get_employee_details(self, obj):
        if not obj.employee: return None
        return {
            'name': obj.employee.name,
            'email': obj.employee.email,
            'phone': obj.employee.phone,
            'role': obj.employee.role
        }

    def to_internal_value(self, data):
        data = data.copy()
        if 'projectId' in data: data['project'] = data.pop('projectId')
        if 'employeeId' in data: data['employee'] = data.pop('employeeId')
        if 'invoiceId' in data: data['invoice'] = data.pop('invoiceId')
        return super().to_internal_value(data)

class ActivityLogSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    
    class Meta:
        model = ActivityLog
        fields = '__all__'
