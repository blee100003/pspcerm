const { sequelize } = require('./models');

const run = async () => {
    try {
        await sequelize.query('ALTER TABLE Projects ADD COLUMN customId TEXT;');
        console.log('Column added successfully.');
    } catch (e) {
        console.log('Error adding column (might already exist):', e.message);
    }
    process.exit(0);
};

run();
