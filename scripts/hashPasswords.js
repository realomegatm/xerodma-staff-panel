const bcrypt = require('bcryptjs');

async function hashPassword(password) {
    const hash = await bcrypt.hash(password, 10);
    console.log(`"${password}": ${hash}`);
}

const passwords = ['password', 'hwid2024', 'dma_config', 'val_setup', 'rust_advanced'];
passwords.forEach(p => hashPassword(p));
