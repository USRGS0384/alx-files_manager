// server.js
import express from 'express';
import { MongoClient } from 'mongodb';
import redis from 'redis';

const app = express();
// Add routes and middleware
export default app;

// Set the port to 5000 if not provided
const port = process.env.PORT || 5000;

// MongoDB connection URL and Redis setup
const mongoURL = 'mongodb://localhost:27017/files_manager';
const redisURL = 'redis://127.0.0.1:6379';

// Connect to MongoDB
let mongoClient;
const connectToMongoDB = async () => {
  try {
    mongoClient = await MongoClient.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB', err);
    process.exit(1);
  }
};

// Connect to Redis
const redisClient = redis.createClient(redisURL);
redisClient.on('connect', () => {
  console.log('Connected to Redis');
});
redisClient.on('error', (err) => {
  console.log('Redis Error:', err);
});

// Make sure MongoDB and Redis are connected before starting the server
connectToMongoDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log('Error during server startup', err);
  });


