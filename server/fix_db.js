const { initDB, sequelize } = require('./models');

async function fix() {
    try {
        console.log('Forcing DB sync via Raw SQL...');
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS Users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(255) DEFAULT 'user',
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Users table created (if not exists).');
    } catch (e) {
        console.error(e);
    }
}

fix();
