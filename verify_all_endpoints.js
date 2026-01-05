
async function testAll() {
    console.log("Testing All Endpoints...");
    const endpoints = [
        'http://localhost:3001/api/employees',
        'http://localhost:3001/api/invoices',
        'http://localhost:3001/api/transactions'
    ];

    for (const url of endpoints) {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
            console.log(`[OK] ${url}`);
        } catch (err) {
            console.error(`[FAIL] ${url} - ${err.message}`);
            if (err.cause) console.error(err.cause);
        }
    }
}

testAll();
