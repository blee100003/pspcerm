const { Invoice, Transaction, User, ActivityLog, sequelize } = require('./models');

async function testDelete() {
    try {
        await sequelize.sync();

        // 1. Create Dummy Invoice
        const inv = await Invoice.create({
            clientName: "Test Delete",
            amount: 100,
            date: new Date()
        });
        console.log(`Created Invoice #${inv.id}`);

        // 2. Create Dummy Transaction
        await Transaction.create({
            invoiceId: inv.id,
            amount: 100,
            type: 'income',
            category: 'Sales',
            description: 'Inv Payment',
            date: new Date()
        });
        console.log('Created linked Transaction');

        // 3. Attempt Manual Delete Logic (mimic endpoint)
        console.log('Attempting delete...');
        await Transaction.destroy({ where: { invoiceId: inv.id } });
        await inv.destroy();

        console.log('Delete successful!');

        // 4. Verify
        const checkInv = await Invoice.findByPk(inv.id);
        const checkTx = await Transaction.findOne({ where: { invoiceId: inv.id } });

        if (!checkInv && !checkTx) {
            console.log('VERIFICATION PASSED: Invoice and Transaction are gone.');
        } else {
            console.log('VERIFICATION FAILED:', { invoice: !!checkInv, transaction: !!checkTx });
        }

    } catch (e) {
        console.error('TEST FAILED:', e);
    } finally {
        await sequelize.close();
    }
}

testDelete();
