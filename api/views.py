from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Max
from .models import User, Employee, Project, Task, Invoice, Transaction, ActivityLog
from .serializers import (
    UserSerializer, EmployeeSerializer, ProjectSerializer, 
    TaskSerializer, InvoiceSerializer, TransactionSerializer, ActivityLogSerializer
)
from datetime import datetime
import json

# Helper for Activity Log
def log_activity(user, action, details, request):
    try:
        ip = request.META.get('HTTP_X_FORWARDED_FOR') or request.META.get('REMOTE_ADDR') or 'unknown'
        ActivityLog.objects.create(user=user, action=action, details=details, ip=ip)
    except Exception as e:
        print(f"Error logging activity: {e}")

# Check Admin Permission
class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

# Auth Views
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            "success": True, 
            "user": {"id": user.id, "username": user.username, "role": user.role}
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    
    if user:
        refresh = RefreshToken.for_user(user)
        # Custom payload to match legacy
        refresh['role'] = user.role
        refresh['username'] = user.username
        
        log_activity(user, 'LOGIN', 'User logged in', request)
        
        return Response({
            'token': str(refresh.access_token),
            'user': {'id': user.id, 'username': user.username, 'role': user.role}
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

# ViewSets

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]

    def perform_create(self, serializer):
        user = serializer.save()
        log_activity(self.request.user, 'CREATE_USER', f"Created user: {user.username}", self.request)

    def perform_destroy(self, instance):
        username = instance.username
        instance.delete()
        log_activity(self.request.user, 'DELETE_USER', f"Deleted user: {username}", self.request)

    @action(detail=True, methods=['put'])
    def password(self, request, pk=None):
        user = self.get_object()
        password = request.data.get('password')
        if password:
            user.set_password(password)
            user.save()
            log_activity(request.user, 'CHANGE_PASSWORD', f"Changed password for user ID: {pk}", request)
            return Response({'success': True})
        return Response({'error': 'Password required'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['put'])
    def role(self, request, pk=None):
        user = self.get_object()
        role = request.data.get('role')
        if role:
            user.role = role
            user.save()
            log_activity(request.user, 'CHANGE_ROLE', f"Changed role for user ID: {pk} to {role}", request)
            return Response({'success': True})
        return Response({'error': 'Role required'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def activity(self, request, pk=None):
        logs = ActivityLog.objects.filter(user_id=pk).order_by('-createdAt')
        serializer = ActivityLogSerializer(logs, many=True)
        return Response(serializer.data)

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all().order_by('-createdAt')
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        
        # Generate ID Logic
        if not data.get('department'): data['department'] = 'General'
        year = datetime.now().year
        
        # Find max seq
        max_seq = 0
        prefix = "E-"
        suffix = f"-{year}"
        
        # Inefficient but matches logic needed. Better to use regex in DB or separate sequence table
        # For SQLite and small scale, this is fine
        candidates = Employee.objects.filter(customId__startswith=prefix, customId__endswith=suffix)
        for emp in candidates:
            parts = emp.customId.split('-')
            if len(parts) == 3:
                try:
                    seq = int(parts[1])
                    if seq > max_seq: max_seq = seq
                except: pass
        
        next_seq = str(max_seq + 1).zfill(3)
        data['customId'] = f"E-{next_seq}-{year}"
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        instance = serializer.save()
        log_activity(self.request.user, 'CREATE_EMPLOYEE', f"Created employee {instance.name} ({instance.customId})", self.request)

    def perform_update(self, serializer):
        instance = serializer.save()
        log_activity(self.request.user, 'UPDATE_EMPLOYEE', f"Updated employee ID: {instance.id}", self.request)
        
    def perform_destroy(self, instance):
        if self.request.user.role != 'admin':
            raise permissions.PermissionDenied("Only Admins can delete entries.")
        
        id = instance.id
        # Manual Cascade
        Task.objects.filter(assignee=instance).delete()
        Transaction.objects.filter(employee=instance).delete()
        
        instance.delete()
        log_activity(self.request.user, 'DELETE_EMPLOYEE', f"Deleted employee ID: {id}", self.request)

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by('-createdAt')
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        with open('debug_payload.log', 'a') as f:
            f.write(f"CREATE DATA: {request.data}\n")
        print(f"DEBUG PROJECT CREATE DATA: {request.data}", flush=True) # Keep print just in case
        data = request.data.copy()
        
        # Generate Project ID (Sequential)
        now = datetime.now()
        year = now.year
        
        prefix = "P-"
        suffix = f"-{year}"
        
        # Find max seq for current year
        max_seq = 0
        candidates = Project.objects.filter(customId__startswith=prefix, customId__endswith=suffix)
        for proj in candidates:
            parts = proj.customId.split('-')
            if len(parts) == 3:
                try:
                    seq = int(parts[1])
                    if seq > max_seq: max_seq = seq
                except: pass
        
        next_seq = str(max_seq + 1).zfill(5) # P-00001-2026
        data['customId'] = f"P-{next_seq}-{year}"
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        with open('debug_payload.log', 'a') as f:
            f.write(f"UPDATE DATA: {request.data}\n")
        print(f"DEBUG PROJECT UPDATE DATA: {request.data}", flush=True)
        return super().update(request, *args, **kwargs)
        log_activity(self.request.user, 'CREATE_PROJECT', f"Created project {instance.name} ({instance.customId})", self.request)

    def perform_update(self, serializer):
        instance = serializer.save()
        log_activity(self.request.user, 'UPDATE_PROJECT', f"Updated project ID: {instance.id}", self.request)

    def perform_destroy(self, instance):
        id = instance.id
        # Cascade
        Transaction.objects.filter(project=instance).delete()
        Invoice.objects.filter(project=instance).delete()
        Task.objects.filter(project=instance).delete()
        
        instance.delete()
        log_activity(self.request.user, 'DELETE_PROJECT', f"Deleted project ID: {id}", self.request)

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all().order_by('-createdAt')
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        projectId = self.request.query_params.get('projectId')
        assigneeId = self.request.query_params.get('assigneeId')
        if projectId: qs = qs.filter(project_id=projectId)
        if assigneeId: qs = qs.filter(assignee_id=assigneeId)
        return qs

    def perform_create(self, serializer):
        task = serializer.save()
        log_activity(self.request.user, 'CREATE_TASK', f"Created task {task.id} for Project {task.project_id}", self.request)

    def update(self, request, *args, **kwargs):
        print(f"DEBUG TASK UPDATE: {request.data}", flush=True)
        return super().update(request, *args, **kwargs)

    def perform_update(self, serializer):
        task = serializer.save()
        log_activity(self.request.user, 'UPDATE_TASK', f"Updated task ID: {task.id}", self.request)

    @action(detail=True, methods=['post'])
    def pay(self, request, pk=None):
        print(f"DEBUG PAY TASK ID: {pk}", flush=True)
        task = self.get_object()
        print(f"DEBUG PAY TASK FOUND: {task} Cost: {task.cost}", flush=True)
        if not task.cost:
            return Response({'error': 'Invalid task cost'}, status=status.HTTP_400_BAD_REQUEST)
            
        task.paymentStatus = 'Paid'
        task.save()
        
        payee_name = task.assignee.name if task.assignee else (task.assigneeName or "Unknown")
        description = f"Task Payment: {task.title} ({payee_name})"
        
        try:
            Transaction.objects.create(
                project=task.project,
                employee=task.assignee, # Can be None
                type='expense',
                amount=task.cost,
                category='Labor',
                description=description,
                date=datetime.now().isoformat()
            )
            print("DEBUG TRANSACTION CREATED", flush=True)
        except Exception as e:
            print(f"DEBUG TRANSACTION ERROR: {e}", flush=True)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({'success': True})

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().order_by('-createdAt')
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    def perform_destroy(self, instance):
        if self.request.user.role != 'admin':
            raise permissions.PermissionDenied("Only Admins can delete entries.")
        
        # Cascade
        Transaction.objects.filter(invoice=instance).delete()
        
        id = instance.id
        instance.delete()
        log_activity(self.request.user, 'DELETE_INVOICE', f"Deleted invoice #{id}", self.request)

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all().order_by('-createdAt')
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        projectId = self.request.query_params.get('projectId')
        employeeId = self.request.query_params.get('employeeId')
        type_ = self.request.query_params.get('type')
        startDate = self.request.query_params.get('startDate')
        endDate = self.request.query_params.get('endDate')

        if projectId: qs = qs.filter(project_id=projectId)
        if employeeId: qs = qs.filter(employee_id=employeeId)
        if type_: qs = qs.filter(type=type_)
        if startDate and endDate:
            qs = qs.filter(date__range=[startDate, endDate])
        elif startDate:
            qs = qs.filter(date__gte=startDate)
            
        return qs

    def create(self, request, *args, **kwargs):
        is_many = isinstance(request.data, list)
        if is_many:
            serializer = self.get_serializer(data=request.data, many=True)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return super().create(request, *args, **kwargs)

    def perform_destroy(self, instance):
        if self.request.user.role != 'admin':
            raise permissions.PermissionDenied("Access denied")
        
        id = instance.id
        instance.delete()
        log_activity(self.request.user, 'DELETE_TRANSACTION', f"Deleted transaction ID: {id}", self.request)
