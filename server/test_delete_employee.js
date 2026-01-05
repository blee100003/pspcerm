const http = require('http');

function login(username, password) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3001,
            path: '/api/auth/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, (res) => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => resolve(JSON.parse(body)));
        });
        req.write(JSON.stringify({ username, password }));
        req.end();
    });
}

function createEmployee(token) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3001,
            path: '/api/employees',
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        }, (res) => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => resolve(JSON.parse(body)));
        });
        req.write(JSON.stringify({ name: 'DeleteMe', role: 'Tester', department: 'QA' }));
        req.end();
    });
}

function deleteEmployee(id, token) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3001,
            path: `/api/employees/${id}`,
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        }, (res) => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => resolve({ status: res.statusCode, body: body ? JSON.parse(body) : {} }));
        });
        req.end();
    });
}

async function test() {
    try {
        console.log('1. Logging in as admin...');
        const loginRes = await login('admin', 'password123');
        if (!loginRes.token) throw new Error('Login failed');
        console.log('Login successful.');

        console.log('2. Creating temp employee...');
        const emp = await createEmployee(loginRes.token);
        if (!emp.id) throw new Error('Create failed: ' + JSON.stringify(emp));
        console.log(`Created Employee ID: ${emp.id}`);

        console.log('3. Deleting employee...');
        const delRes = await deleteEmployee(emp.id, loginRes.token);
        console.log('Delete Response:', delRes);

        if (delRes.status === 200) console.log('✅ BACKEND DELETE WORKS');
        else console.log('❌ BACKEND DELETE FAILED');

    } catch (e) {
        console.error('TEST ERROR:', e);
    }
}

test();
