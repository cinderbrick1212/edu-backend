require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkPasswordHash() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne({ email: 'student@college.com' });
        if (user) {
            console.log('User found:', user.email);
            console.log('Password hash:', user.password);
            console.log('Is hash valid format (starts with $2...):', user.password.startsWith('$2'));
        } else {
            console.log('❌ User not found');
        }
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

checkPasswordHash();
