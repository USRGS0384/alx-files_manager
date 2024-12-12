// routes/index.js

import express from 'express';
import AuthController from '../controllers/AuthController';
import UserController from '../controllers/UserController';

const router = express.Router();

router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', UserController.getMe);

export default router;

