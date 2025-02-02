const express = require('express');
const AppController = require('../controllers/AppController');
const AuthController = require('../controllers/AuthController');
const FilesController = require('../controllers/FilesController');
const UsersController = require('../controllers/UsersController');

// Initialize router
const router = express.Router();

// Status and Stats Routes
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// Authentication Routes
router.get('/connect', AuthController.connect);

// User Routes
router.post('/users', UsersController.postNew);

// File Routes
router.post('/files', FilesController.postUpload);

// Export the router module
module.exports = router;

