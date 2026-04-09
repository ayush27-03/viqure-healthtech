// test-connection.js

const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Atlas connected:', mongoose.connection.host);
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  }
}

testConnection();