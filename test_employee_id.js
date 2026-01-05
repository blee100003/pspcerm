const { Employee, sequelize } = require('./server/models');

async function testEmployeeIdGeneration() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database');

        const allEmps = await Employee.findAll({ attributes: ['customId'] });
        console.log('Existing employee IDs:', allEmps.map(e => e.customId));

        const year = new Date().getFullYear();
        let maxSeq = 0;
        const prefix = `E-`;
        const suffix = `-${year}`;

        allEmps.forEach(e => {
            if (e.customId && e.customId.startsWith(prefix) && e.customId.endsWith(suffix)) {
                const parts = e.customId.split('-');
                if (parts.length === 3) {
                    const seq = parseInt(parts[1], 10);
                    if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
                }
            }
        });

        const nextSeq = String(maxSeq + 1).padStart(3, '0');
        const customId = `E-${nextSeq}-${year}`;
        console.log('Next ID would be:', customId);

    } catch (e) {
        console.error('Error:', e);
    }
}

testEmployeeIdGeneration();
