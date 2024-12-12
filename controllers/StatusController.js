// controllers/StatusController.js

import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';

class StatusController {
    static async getStatus(req, res) {
        const redisStatus = redisClient.isAlive();
        const dbStatus = dbClient.isAlive();

        res.status(200).json({ redis: redisStatus, db: dbStatus });
    }
}

export default StatusController;

