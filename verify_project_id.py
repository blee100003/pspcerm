import requests
import sys

BASE_URL = 'http://localhost:8000/api'
AUTH_URL = f"{BASE_URL}/auth/login"

def verify_project_ids():
    # Login
    print("Logging in...")
    resp = requests.post(AUTH_URL, json={'username': 'admin', 'password': 'admin123'})
    if resp.status_code != 200:
        print("Login failed:", resp.text)
        return
    token = resp.json()['token']
    headers = {'Authorization': f'Bearer {token}'}

    # Create 3 Projects
    print("Creating projects...")
    ids = []
    for i in range(3):
        data = {
            'name': f"Test Project {i}",
            'client': 'Test Client',
            'budget': 1000
        }
        r = requests.post(f"{BASE_URL}/projects/", json=data, headers=headers)
        if r.status_code != 201:
            print("Create failed:", r.text)
            return
        
        custom_id = r.json().get('customId')
        ids.append(custom_id)
        print(f"Created: {custom_id}")

    # Verify
    print("\nVerifying IDs...")
    # Expect P-00001-YYYY, P-00002-YYYY ideally, but if data exists it might continue.
    # We just want to see sequential behavior in the new ones.
    
    # Check if they are sequential
    # Parse numbers
    nums = []
    for i in ids:
        try:
            # P-XXXXX-YYYY
            part = i.split('-')[1]
            nums.append(int(part))
        except:
            print(f"Invalid format: {i}")

    print(f"Sequence: {nums}")
    if len(nums) > 1:
        if nums[-1] == nums[-2] + 1:
            print("SUCCESS: IDs are sequential.")
        else:
            print("FAIL: IDs are not sequential.")
    else:
        print("Not enough IDs to verify sequence (maybe first one).")

if __name__ == "__main__":
    verify_project_ids()
