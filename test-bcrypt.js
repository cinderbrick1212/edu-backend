const bcrypt = require('bcryptjs');

async function verify() {
    const hash = '$2a$10$xl86m1JslA222u9GMRB87.tpJ9bgOxUbCeEJqbo9zdjYUiNFGG0Wu';
    const pw = 'password123';
    const match = await bcrypt.compare(pw, hash);
    console.log(`Password 'password123' matches hash: ${match}`);
}

verify();
