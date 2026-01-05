const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function resetAdmin() {
    try {
        const hashedPassword = await bcrypt.hash('password123', 10);

        let admin = await User.findOne({ where: { username: 'admin' } });

        if (admin) {
            console.log(`FOUND_ADMIN: ID=${admin.id}. Updating password...`);
            await admin.update({ password: hashedPassword, role: 'admin' });
        } else {
            console.log('ADMIN_NOT_FOUND. Creating...Code');
            admin = await User.create({
                username: 'admin',
                password: hashedPassword,
                role: 'admin',
                fullName: 'System Admin'
            });
        }

        console.log(`SUCCESS: Admin user verified/created. Login with 'admin' / 'password123'`);

    } catch (e) {
        console.error("RESET_ERROR:", e);
    }
}

resetAdmin();
