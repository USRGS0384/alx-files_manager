const express = require('express');
const dbClient = require('./utils/db');
const redisClient = require('./utils/redis');

const app = express();
const PORT = process.env.PORT || 5000;

app.get('/status', async (req, res) => {
  res.status(200).json({ redis: redisClient.isAlive(), db: dbClient.isAlive() });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = server; // Ensure the server instance is exported

