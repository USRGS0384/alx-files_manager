const redis = require('redis');
const mongoose = require('mongoose');

// Redis client (assuming Redis is running locally)
const redisClient = redis.createClient();

// MongoDB models (make sure you have the models for 'User' and 'File')
const User = mongoose.model('User');
const File = mongoose.model('File');

// Utility function to check Redis health
const checkRedis = () => {
  return new Promise((resolve) => {
    redisClient.ping((err, reply) => {
      resolve(err ? false : true);
    });
  });
};

// Utility function to check DB health
const checkDB = async () => {
  try {
    await mongoose.connection.db.admin().ping();
    return true;
  } catch (error) {
    return false;
  }
};

// Controller to handle the /status route
exports.getStatus = async (req, res) => {
  const redisStatus = await checkRedis();
  const dbStatus = await checkDB();

  return res.status(200).json({
    redis: redisStatus,
    db: dbStatus,
  });
};

// Controller to handle the /stats route
exports.getStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const fileCount = await File.countDocuments();

    return res.status(200).json({
      users: userCount,
      files: fileCount,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error fetching stats' });
  }
};

