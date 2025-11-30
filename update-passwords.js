const bcrypt = require('bcryptjs');
const db = require('./database/db');

async function updatePasswords() {
    try {
        const password = 'password123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        console.log('Generated hash:', hashedPassword);

        const [result] = await db.query(
            'UPDATE users SET password = ? WHERE username IN (?, ?)',
            [hashedPassword, 'admin', 'pharmacist']
        );

        console.log('Updated passwords for admin and pharmacist');
        process.exit(0);
    } catch (error) {
        console.error('Error updating passwords:', error);
        process.exit(1);
    }
}

updatePasswords();
