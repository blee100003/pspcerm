const http = require('http');

function login() {
    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost', port: 3001, path: '/api/auth/login', method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, res => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => resolve(JSON.parse(body)));
        });
        req.write(JSON.stringify({ username: 'admin', password: 'password123' }));
        req.end();
    });
}

function post(path, token, data) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost', port: 3001, path, method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        }, res => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => resolve({ s: res.statusCode, b: JSON.parse(body) }));
        });
        req.write(JSON.stringify(data));
        req.end();
    });
}

function del(path, token) {
    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost', port: 3001, path, method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        }, res => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => resolve({ s: res.statusCode, b: body ? JSON.parse(body) : {} }));
        });
        req.end();
    });
}

async function test() {
    const { token } = await login();
    console.log('Logged in.');

    // 1. Create Employee
    const { b: emp } = await post('/api/employees', token, { name: 'FK Tester', role: 'X' });
    console.log('Created Emp:', emp.id);

    // 2. Add Transaction linked to Employee
    const { b: trans } = await post('/api/transactions', token, {
        type: 'expense', amount: 100, category: 'Test', description: 'Test', date: '2025-01-01',
        employeeId: emp.id
    });
    console.log('Created Transaction:', trans.id);

    // 3. Try to Delete Employee
    const res = await del(`/api/employees/${emp.id}`, token);
    console.log('DELETE Result:', res);
}

test();
