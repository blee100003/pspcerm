const { Employee, Project, sequelize } = require('./models');

async function verify() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected');

        // Test Project Creation
        console.log('Testing Project Creation...');
        try {
            const project = await Project.create({
                customId: `P-TEST-${Date.now()}`,
                name: 'Test Project fix',
                client: 'Test Client',
                status: 'In Progress',
                budget: 1000,
                createdAt: new Date()
            });
            console.log('Project created successfully:', project.id);
        } catch (e) {
            console.error('Project Creation Failed:', e.message);
        }

        // Test Employee ID Generation
        console.log('Testing Employee Creation...');
        // Simulate the logic in index.js to see what it generates
        const year = new Date().getFullYear();
        const allEmps = await Employee.findAll({ attributes: ['customId'] });

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
        console.log('Calculated Next Employee ID:', customId);

    } catch (e) {
        console.error(e);
    }
}

verify();
