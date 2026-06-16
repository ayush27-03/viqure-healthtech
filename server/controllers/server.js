require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./server/app');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✔ MongoDB connected');

    app.listen(PORT, () => {
      console.log(`🚀 Viqure Healthtech API running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();
