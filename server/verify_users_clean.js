const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'plansculpt.db'),
    logging: false
});

async function check() {
    try {
        const [results] = await sequelize.query("SELECT id, username, role, password FROM Users");
        if (results.length === 0) {
            console.log("NO_USERS_FOUND");
        } else {
            for (const u of results) {
                console.log(`USER_FOUND: ID=${u.id} USERNAME=${u.username} ROLE=${u.role} PASS_LEN=${u.password ? u.password.length : 0}`);
            }
        }
    } catch (error) {
        console.error("DB_ERROR:", error.message);
    }
}

check();
