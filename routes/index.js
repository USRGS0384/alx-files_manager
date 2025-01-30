const express = require('express');
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');
const AuthController = require('../controllers/AuthController');
const FilesController = require('../controllers/FilesController');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

const router = express.Router();

// Ensure that /status route checks Redis and MongoDB status
router.get('/status', (req, res) => {
  res.status(200).json({ redis: redisClient.isAlive(), mongo: dbClient.isAlive() });
});

// Ensure that /stats route retrieves correct counts
router.get('/stats', async (req, res) => {
  const usersCount = await dbClient.nbUsers();
  const filesCount = await dbClient.nbFiles();
  
  res.status(200).json({ users: usersCount, files: filesCount });
});

// Other routes
router.post('/users', UsersController.postNew);
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', UsersController.getMe);
router.post('/files', FilesController.postUpload);
router.get('/files/:id', FilesController.getShow);
router.get('/files', FilesController.getIndex);
router.put('/files/:id/publish', FilesController.putPublish);
router.put('/files/:id/unpublish', FilesController.putUnpublish);
router.get('/files/:id/data', FilesController.getFile);

module.exports = router;

