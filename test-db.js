require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI.replace(/\/\/.*@/, '//<masked>@'));
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1);
    }
}

testConnection();
