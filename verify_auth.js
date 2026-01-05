// verify_auth.js checks auth flow using global fetch (Node 18+)

const BASE_URL = 'http://localhost:3001/api';

async function verifyAuth() {
    try {
        console.log('--- Verifying Authentication ---');

        // 1. Register
        const username = `user_${Date.now()}`;
        const password = 'password123';
        console.log(`Registering user: ${username}`);
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, role: 'admin' })
        });
        const regData = await regRes.json();
        if (!regData.success) throw new Error('Registration failed: ' + regData.error);
        console.log('Registration successful');

        // 2. Login
        console.log('Logging in...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const loginData = await loginRes.json();
        if (!loginData.token) throw new Error('Login failed: ' + loginData.error);
        const token = loginData.token;
        console.log('Login successful, token received');

        // 3. Access Protected Route (Employees)
        console.log('Accessing protected route (Employees)...');
        const empRes = await fetch(`${BASE_URL}/employees`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (empRes.status !== 200) throw new Error('Access failed: ' + empRes.status);
        console.log('Protected route access successful');

        // 4. Access without token (should fail)
        console.log('Accessing without token...');
        const failRes = await fetch(`${BASE_URL}/employees`);
        if (failRes.status !== 401 && failRes.status !== 403) throw new Error('Security check failed! Status: ' + failRes.status);
        console.log('Security check passed (access denied without token)');

        console.log('--- Verification Complete: SUCCESS ---');

    } catch (e) {
        console.error('--- Verification FAILED ---');
        console.error(e.message);
    }
}

verifyAuth();
