const { sequelize } = require('./models');

async function fixEmployeeTable() {
    try {
        console.log('Checking Employee table columns...');
        const [results] = await sequelize.query("PRAGMA table_info(Employees);");
        const columns = results.map(c => c.name);
        console.log('Current columns:', columns);

        if (!columns.includes('department')) {
            console.log('Adding department column...');
            await sequelize.query("ALTER TABLE Employees ADD COLUMN department VARCHAR(255) DEFAULT 'General'");
        }
        if (!columns.includes('type')) {
            console.log('Adding type column...');
            await sequelize.query("ALTER TABLE Employees ADD COLUMN type VARCHAR(255) DEFAULT 'fixed'");
        }
        if (!columns.includes('salary')) {
            console.log('Adding salary column...');
            await sequelize.query("ALTER TABLE Employees ADD COLUMN salary DECIMAL(10, 2)");
        }
        if (!columns.includes('email')) {
            console.log('Adding email column...');
            await sequelize.query("ALTER TABLE Employees ADD COLUMN email VARCHAR(255)");
        }
        if (!columns.includes('phone')) {
            console.log('Adding phone column...');
            await sequelize.query("ALTER TABLE Employees ADD COLUMN phone VARCHAR(255)");
        }
        if (!columns.includes('dob')) {
            console.log('Adding dob column...');
            await sequelize.query("ALTER TABLE Employees ADD COLUMN dob VARCHAR(255)");
        }
        if (!columns.includes('gender')) {
            console.log('Adding gender column...');
            await sequelize.query("ALTER TABLE Employees ADD COLUMN gender VARCHAR(255)");
        }
        if (!columns.includes('customId')) {
            console.log('Adding customId column...');
            await sequelize.query("ALTER TABLE Employees ADD COLUMN customId VARCHAR(255)");
        }
        if (!columns.includes('status')) {
            console.log('Adding status column...');
            await sequelize.query("ALTER TABLE Employees ADD COLUMN status VARCHAR(255) DEFAULT 'active'");
        }

        console.log('Employee table update complete.');
    } catch (e) {
        console.error('Error fixing Employee table:', e);
    }
}

fixEmployeeTable();
