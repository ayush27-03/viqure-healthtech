// reset-empty-collections.js
require('dotenv').config();
const mongoose = require('mongoose');

const toDrop = [
  'admins',
  'appointments',
  'counters',
  'users'
];

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  for (const name of toDrop) {
    try {
      await mongoose.connection.dropCollection(name);
      console.log(`✓ dropped ${name}`);
    } catch (e) {
      console.log(`  skipped ${name} (${e.message})`);
    }
  }
  process.exit(0);
});