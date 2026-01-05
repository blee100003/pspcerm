from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    register, login, UserViewSet, EmployeeViewSet, 
    ProjectViewSet, TaskViewSet, InvoiceViewSet, TransactionViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'employees', EmployeeViewSet)
router.register(r'projects', ProjectViewSet)
router.register(r'tasks', TaskViewSet)
router.register(r'invoices', InvoiceViewSet)
router.register(r'transactions', TransactionViewSet)

urlpatterns = [
    path('auth/register', register),
    path('auth/login', login),
    path('', include(router.urls)),
]
