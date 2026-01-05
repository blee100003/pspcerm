const http = require('http');

const options = {
    hostname: '192.168.0.103',
    port: 3001,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 2000 // 2s timeout
};

console.log(`Attempting connection to http://${options.hostname}:${options.port}...`);

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
    res.on('end', () => {
        console.log('No more data in response.');
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(JSON.stringify({ username: 'admin', password: 'password123' }));
req.end();
