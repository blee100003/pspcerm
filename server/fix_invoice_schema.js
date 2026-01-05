const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'plansculpt.db'),
    logging: false
});

async function fixSchema() {
    try {
        await sequelize.query("ALTER TABLE Invoices ADD COLUMN clientName VARCHAR(255);");
        console.log("Added clientName");
    } catch (e) {
        if (e.message.includes('duplicate column')) console.log("clientName already exists");
        else console.error("Error adding clientName:", e.message);
    }

    try {
        await sequelize.query("ALTER TABLE Invoices ADD COLUMN clientEmail VARCHAR(255);");
        console.log("Added clientEmail");
    } catch (e) {
        if (e.message.includes('duplicate column')) console.log("clientEmail already exists");
        else console.error("Error adding clientEmail:", e.message);
    }
}

fixSchema();
