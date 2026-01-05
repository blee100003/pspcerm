const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'plansculpt.db'),
    logging: false
});

async function makeAdmin() {
    try {
        const [results] = await sequelize.query("UPDATE Users SET role='admin' WHERE username='Miru'");
        console.log("Updated Miru to admin");

        const [users] = await sequelize.query("SELECT id, username, role FROM Users");
        console.log("Current Users:", JSON.stringify(users, null, 2));
    } catch (error) {
        console.error("Error:", error);
    }
}

makeAdmin();
