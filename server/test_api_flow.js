const http = require('http');

function post(path, data) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3001,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        }, (res) => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

function get(path, token) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3001,
            path: path,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }, (res) => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
        });
        req.on('error', reject);
        req.end();
    });
}

async function test() {
    try {
        console.log('Testing Login...');
        const loginData = JSON.stringify({ username: 'admin', password: 'password123' });
        const loginRes = await post('/api/auth/login', loginData);

        console.log('Login Status:', loginRes.status);
        if (loginRes.status !== 200) {
            console.error('Login Failed:', loginRes.body);
            return;
        }

        const token = loginRes.body.token;
        console.log('got_token');

        console.log('Testing Employees Fetch...');
        const empRes = await get('/api/employees', token);
        console.log('Employees Status:', empRes.status);
        console.log('Employees Count:', Array.isArray(empRes.body) ? empRes.body.length : 'Not Array');

    } catch (e) {
        console.error('TEST_ERROR:', e);
    }
}

test();
