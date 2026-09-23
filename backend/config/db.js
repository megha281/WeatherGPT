const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

let connected = false;

async function connectDB() {
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
    connected = true;
    logger.info(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err) {
    connected = false;
    logger.error(`MongoDB connection failed: ${err.message}`);
    logger.warn(
      'The server keeps running so weather and chat endpoints stay usable, ' +
        'but anything that needs an account will return 503 until MongoDB is reachable.'
    );
  }

  mongoose.connection.on('disconnected', () => {
    connected = false;
    logger.warn('MongoDB disconnected.');
  });
  mongoose.connection.on('connected', () => {
    connected = true;
  });

  return connected;
}

const isDBConnected = () => mongoose.connection.readyState === 1;

module.exports = { connectDB, isDBConnected };
