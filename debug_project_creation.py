import requests
import sys

BASE_URL = 'http://localhost:8000/api'
AUTH_URL = f"{BASE_URL}/auth/login"

def debug_creation():
    # Login
    resp = requests.post(AUTH_URL, json={'username': 'admin', 'password': 'admin123'})
    if resp.status_code != 200:
        print("Login failed")
        return
    token = resp.json()['token']
    headers = {'Authorization': f'Bearer {token}'}

    print("\n--- Test 1: Missing Client (Expect 400) ---")
    data = {'name': 'No Client Project', 'income': 100}
    r = requests.post(f"{BASE_URL}/projects/", json=data, headers=headers)
    print(f"Status: {r.status_code}")
    print(f"Content-Type: {r.headers.get('Content-Type')}")
    print(f"Body: {r.text}")

    print("\n--- Test 2: Missing Name (Expect 400) ---")
    data = {'client': 'Client A', 'income': 100}
    r = requests.post(f"{BASE_URL}/projects/", json=data, headers=headers)
    print(f"Status: {r.status_code}")
    print(f"Body: {r.text}")

    print("\n--- Test 3: Valid Data (Expect 201) ---")
    data = {'name': 'Valid Project', 'client': 'Client B', 'income': 1000}
    r = requests.post(f"{BASE_URL}/projects/", json=data, headers=headers)
    print(f"Status: {r.status_code}")
    print(f"Body: {r.text}")

if __name__ == "__main__":
    debug_creation()
