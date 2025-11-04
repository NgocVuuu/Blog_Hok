const mongoose = require('mongoose');

// Disable mongoose buffering globally
mongoose.set('bufferCommands', false);

const mongoURI = process.env.MONGODB_URI;

// Validate MongoDB URI
if (!mongoURI) {
  console.error('MONGODB_URI environment variable is not set');
  process.exit(1);
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 30000,
      socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT) || 60000,
      connectTimeoutMS: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 30000,
      maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 10,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('Error during MongoDB disconnection:', err);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = {
  connectDB,
  mongoURI
}; 