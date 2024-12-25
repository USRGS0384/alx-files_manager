import { MongoClient } from 'mongodb';
import redis from 'redis';

// Connect to MongoDB (use your DB credentials)
const dbUrl = 'mongodb://localhost:27017';
const dbName = 'files_manager'; // Use your DB name here
let db;

MongoClient.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    db = client.db(dbName);
    console.log('Connected to MongoDB');
  })
  .catch(err => console.error('Failed to connect to MongoDB', err));

// Connect to Redis
const redisClient = redis.createClient();
redisClient.on('connect', function () {
  console.log('Connected to Redis');
});

// Controller function for /status
export const getStatus = (req, res) => {
  redisClient.ping((err, reply) => {
    if (err) {
      return res.status(500).json({ redis: false, db: true });
    }
    res.status(200).json({ redis: reply === 'PONG', db: db !== undefined });
  });
};

// Controller function for /stats
export const getStats = async (req, res) => {
  try {
    const usersCollection = db.collection('users');
    const filesCollection = db.collection('files');

    const userCount = await usersCollection.countDocuments();
    const fileCount = await filesCollection.countDocuments();

    res.status(200).json({ users: userCount, files: fileCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve stats' });
  }
};

