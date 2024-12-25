import express from 'express';
import { getStatus, getStats } from '../controllers/AppController.js';

const router = express.Router();

// Status route
router.get('/status', getStatus);

// Stats route
router.get('/stats', getStats);

export default router;

