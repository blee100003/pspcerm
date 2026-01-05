import requests
import sys

BASE_URL = 'http://localhost:8000/api'

def test_flow():
    # 1. Login
    print("Testing Login...")
    try:
        resp = requests.post(f"{BASE_URL}/auth/login", json={'username': 'admin', 'password': 'admin'})
        print(f"Login Status: {resp.status_code}")
        if resp.status_code != 200:
            print(resp.text)
            return
        
        data = resp.json()
        token = data['token']
        headers = {'Authorization': f'Bearer {token}'}
        print("Login Success.")
    except Exception as e:
        print(f"Login Failed: {e}")
        return

    # 2. Create Employee
    print("\nTesting Create Employee...")
    emp_data = {
        'name': 'John Doe',
        'role': 'Developer',
        'salary': 5000,
        'department': 'Tech'
    }
    resp = requests.post(f"{BASE_URL}/employees/", json=emp_data, headers=headers)
    print(f"Create Employee Status: {resp.status_code}")
    print(resp.json())

    # 3. List Employees
    print("\nTesting List Employees...")
    resp = requests.get(f"{BASE_URL}/employees/", headers=headers)
    print(f"List Employees Count: {len(resp.json())}")

    # 4. Create Project
    print("\nTesting Create Project...")
    proj_data = {
        'name': 'New Website',
        'client': 'Acme Corp',
        'budget': 10000
    }
    resp = requests.post(f"{BASE_URL}/projects/", json=proj_data, headers=headers)
    print(f"Create Project Status: {resp.status_code}")
    print(resp.json())
    project_id = resp.json().get('id')

    # 5. Create Task
    print("\nTesting Create Task...")
    task_data = {
        'title': 'Design Home Page',
        'project': project_id,
        'cost': 500
    }
    resp = requests.post(f"{BASE_URL}/tasks/", json=task_data, headers=headers)
    print(f"Create Task Status: {resp.status_code}")
    print(resp.json())

if __name__ == "__main__":
    test_flow()
