const express = require('express');
const router = express.Router();

// Import AppController
const AppController = require('../controllers/AppController');

// Define routes
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

module.exports = router;
