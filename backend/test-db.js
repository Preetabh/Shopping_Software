const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;
console.log('Testing connection to MongoDB with URI:', uri ? uri.substring(0, 25) + '...' : 'NONE');

async function testConnection() {
  try {
    await mongoose.connect(uri, {
      dbName: 'flipkart_store',
      serverSelectionTimeoutMS: 8000
    });
    console.log(' Successfully connected to MongoDB Atlas! Database: flipkart_store');
    await mongoose.disconnect();
    console.log(' Disconnected successfully.');
    process.exit(0);
  } catch (error) {
    console.error(' MongoDB connection error:', error.message);
    process.exit(1);
  }
}

testConnection();
