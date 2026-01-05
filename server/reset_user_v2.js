const { sequelize, User } = require('./models');
const bcrypt = require('bcryptjs');

async function reset() {
    try {
        const hashedPassword = await bcrypt.hash('password123', 10);
        await User.update(
            { password: hashedPassword, role: 'admin', username: 'admin' },
            { where: { id: 1 } }
        );
        const u = await User.findByPk(1);
        console.log(`RESET_SUCCESS: User ID 1 is now '${u.username}' with password 'password123'`);
    } catch (e) {
        console.error("RESET_ERROR:", e);
    }
}

reset();
