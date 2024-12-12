// routes/index.js

import express from 'express';
import AuthController from '../controllers/AuthController.js';
import UserController from '../controllers/UserController.js';
import FilesController from '../controllers/FilesController.js';
import StatusController from '../controllers/StatusController.js'; // Import StatusController
import StatsController from '../controllers/StatsController.js'; // Import StatsController

const router = express.Router();

router.get('/status', StatusController.getStatus); // Define the /status route
router.get('/stats', StatsController.getStats); // Define the /stats route
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', UserController.getMe);
router.post('/files', FilesController.postUpload);

export default router;

