import os
import django
import sys
from rest_framework.serializers import ValidationError

# Setup Django
sys.path.append(os.path.join(os.path.dirname(__file__), 'plansculpt_backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'plansculpt_backend.settings')
django.setup()

from api.serializers import ProjectSerializer

def test_email_validation():
    print("--- Testing Email Validation ---")

    # Case 1: Empty String
    print("\n1. Testing with empty string ('')")
    data = {'name': 'Test', 'client': 'Client', 'clientEmail': ''}
    serializer = ProjectSerializer(data=data)
    if serializer.is_valid():
        print("VALID")
    else:
        print(f"INVALID: {serializer.errors}")

    # Case 2: Null
    print("\n2. Testing with None (null)")
    data = {'name': 'Test', 'client': 'Client', 'clientEmail': None}
    serializer = ProjectSerializer(data=data)
    if serializer.is_valid():
        print("VALID")
    else:
        print(f"INVALID: {serializer.errors}")

    # Case 4: Whitespace
    print("\n4. Testing with whitespace (' ')")
    data = {'name': 'Test', 'client': 'Client', 'clientEmail': ' '}
    serializer = ProjectSerializer(data=data)
    if serializer.is_valid():
        print("VALID")
    else:
        print(f"INVALID: {serializer.errors}")

if __name__ == "__main__":
    test_email_validation()
