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
      resolve(err == null); // Ensure `err` is explicitly checked
    });
  });
};

// Utility function to check DB health
const checkDB = () => {
  return new Promise((resolve) => {
    mongoose.connection.db.admin().ping((err, result) => {
      resolve(err == null); // Ensure `err` is explicitly checked
    });
  });
};

// Controller to handle the /status route
exports.getStatus = (req, res) => {
  Promise.all([checkRedis(), checkDB()])
    .then(([redisStatus, dbStatus]) => {
      return res.status(200).json({
        redis: redisStatus,
        db: dbStatus,
      });
    })
    .catch((error) => {
      return res.status(500).json({ error: 'Error fetching status' });
    });
};

// Controller to handle the /stats route
exports.getStats = (req, res) => {
  Promise.all([
    User.countDocuments(),
    File.countDocuments(),
  ])
    .then(([userCount, fileCount]) => {
      return res.status(200).json({
        users: userCount,
        files: fileCount,
      });
    })
    .catch((error) => {
      return res.status(500).json({ error: 'Error fetching stats' });
    });
};

