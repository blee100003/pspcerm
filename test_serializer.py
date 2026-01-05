
import os
import django
from django.conf import settings
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'plansculpt_backend.settings')
django.setup()

from api.models import Project
from api.serializers import ProjectSerializer

try:
    projects = Project.objects.all()
    serializer = ProjectSerializer(projects, many=True)
    data = serializer.data
    print(json.dumps(data, indent=2, default=str))
except Exception as e:
    print(f"Serializer Error: {e}")
