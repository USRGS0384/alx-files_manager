// controllers/StatsController.js

import dbClient from '../utils/db.js';

class StatsController {
    static async getStats(req, res) {
        const userCount = await dbClient.nbUsers();
        const fileCount = await dbClient.nbFiles();

        res.status(200).json({ users: userCount, files: fileCount });
    }
}

export default StatsController;

