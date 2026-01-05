const { initDB, sequelize } = require('./server/models.js');

async function fix() {
    try {
        console.log('Forcing DB sync...');
        await sequelize.sync({ alter: true });
        console.log('DB synced.');
    } catch (e) {
        console.error(e);
    }
}

fix();
