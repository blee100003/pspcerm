const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'plansculpt.db'),
    logging: false
});

async function checkUsers() {
    try {
        const [results] = await sequelize.query("SELECT id, username, role FROM Users");
        console.log("Users:", JSON.stringify(results, null, 2));
    } catch (error) {
        console.error("Error:", error);
    }
}

checkUsers();
