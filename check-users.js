require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const count = await User.countDocuments();
        console.log(`Total users in DB: ${count}`);
        if (count > 0) {
            const users = await User.find({}, { email: 1, role: 1 });
            console.log('Users found:', users);
        } else {
            console.log('❌ No users found in database.');
        }
        process.exit(0);
    } catch (err) {
        console.error('❌ Error checking users:', err.message);
        process.exit(1);
    }
}

checkUsers();
