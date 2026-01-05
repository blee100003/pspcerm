import requests
import sys

BASE_URL = 'http://localhost:8000/api'
AUTH_URL = f"{BASE_URL}/auth/login"

def verify_empty_income():
    # Login
    resp = requests.post(AUTH_URL, json={'username': 'admin', 'password': 'admin123'})
    token = resp.json()['token']
    headers = {'Authorization': f'Bearer {token}'}

    # Create Project with empty string income
    print("Testing create project with income='' ...")
    data = {
        'name': "Test Empty Income",
        'client': 'Test Client',
        'income': "" 
    }
    r = requests.post(f"{BASE_URL}/projects/", json=data, headers=headers)
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text}")

if __name__ == "__main__":
    verify_empty_income()
