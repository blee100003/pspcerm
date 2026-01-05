
import os
import django
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'plansculpt_backend.settings')
django.setup()

from api.models import Task
from api.serializers import TaskSerializer

try:
    tasks = Task.objects.all()
    serializer = TaskSerializer(tasks, many=True)
    data = serializer.data
    print(json.dumps(data, indent=2, default=str))
except Exception as e:
    print(f"Serializer Error: {e}")
