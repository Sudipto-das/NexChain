const mongoose = require('mongoose');

/**
 * Connects to MongoDB using MONGODB_URI from the environment.
 * Falls back to a local default so the server can boot during development
 * without requiring a .env file to be present.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nexchain';

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri);
  console.log(`[db] connected: ${mongoose.connection.name}`);
}

module.exports = { connectDB };
