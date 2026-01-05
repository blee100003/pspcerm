const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'plansculpt.db'),
    logging: false
});

async function checkSchema() {
    try {
        const [results] = await sequelize.query("PRAGMA table_info(Invoices);");
        console.log("Columns:", results.map(c => c.name).join(', '));
    } catch (error) {
        console.error("Error:", error);
    }
}

checkSchema();
