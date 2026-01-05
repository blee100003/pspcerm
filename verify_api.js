
async function testApi() {
    console.log("Testing API...");
    try {
        // 1. Test GET Transactions
        const resGet = await fetch('http://localhost:3001/api/transactions');
        if (!resGet.ok) throw new Error(`GET failed: ${resGet.status} ${resGet.statusText}`);
        console.log("GET /api/transactions: OK");

        // 2. Test POST Transaction
        const testTransaction = {
            type: 'expense',
            amount: 10.50,
            category: 'Office', // This was the missing field
            description: 'API Test Transaction',
            date: new Date().toISOString()
        };

        const resPost = await fetch('http://localhost:3001/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testTransaction)
        });

        if (!resPost.ok) {
            const errText = await resPost.text();
            throw new Error(`POST failed: ${resPost.status} ${resPost.statusText} - ${errText}`);
        }

        const data = await resPost.json();
        console.log("POST /api/transactions: OK", data);

    } catch (err) {
        console.error("API TEST FAILED:", err.message);
        if (err.cause) console.error(err.cause);
    }
}

testApi();
