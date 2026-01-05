import os
import django
import sys

# Setup Django Environment
sys.path.append(os.path.join(os.path.dirname(__file__), 'plansculpt_backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'plansculpt_backend.settings')
django.setup()

from api.models import Project
from rest_framework.test import APIRequestFactory, force_authenticate
from api.views import ProjectViewSet
from django.contrib.auth import get_user_model

User = get_user_model()

def reproduce():
    factory = APIRequestFactory()
    view = ProjectViewSet.as_view({'post': 'create'})
    
    # Create request with same data as frontend
    data = {
        'name': 'Crash Test Project',
        'client': 'Crash Dummy',
        'income': 0,
        'status': 'In Progress'
    }
    
    request = factory.post('/api/projects/', data, format='json')
    
    # Authenticate
    try:
        user = User.objects.get(username='admin')
        force_authenticate(request, user=user)
    except Exception as e:
        print(f"Admin user not found or auth failed: {e}")
        return

    try:
        response = view(request)
        print(f"Status: {response.status_code}")
        print(f"Data: {response.data}")
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    reproduce()
