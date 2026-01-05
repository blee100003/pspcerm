import requests
import sys

BASE_URL = 'http://localhost:8000/api'
AUTH_URL = f"{BASE_URL}/auth/login"

def verify_auth():
    print(f"Logging in to {AUTH_URL}...")
    try:
        resp = requests.post(AUTH_URL, json={'username': 'admin', 'password': 'admin123'})
        print(f"Login Status: {resp.status_code}")
        if resp.status_code != 200:
            print("Login failed:", resp.text)
            return

        data = resp.json()
        token = data.get('token')
        print(f"Token received: {token[:20]}...")

    # Test valid request
        headers = {'Authorization': f'Bearer {token}'}
        print("\nTesting GET /projects/ with token...")
        r = requests.get(f"{BASE_URL}/projects/", headers=headers)
        print(f"Projects Status: {r.status_code}")
        if r.status_code == 200:
            print("SUCCESS: Token is valid for GET.")
        else:
            print(f"FAILED GET: {r.text}")

        # Test POST
        print("\nTesting POST /projects/ with token...")
        data = {
            'name': 'Auth Test Project',
            'client': 'Auth Client',
            'income': 500
        }
        r = requests.post(f"{BASE_URL}/projects/", json=data, headers=headers)
        print(f"POST Status: {r.status_code}")
        if r.status_code == 201:
             print("SUCCESS: Token is valid for POST.")
        else:
             print(f"FAILED POST: {r.text}")

    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    verify_auth()
