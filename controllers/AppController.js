const redisClient = require("../utils/redis")
const dbClient = require("../utils/db")

class AppController {
  static getStatus(req, res) {
    const status = {
      redis: redisClient.isAlive(),
      db: dbClient.isAlive(),
    }
    res.status(200).json(status)
  }

  static async getStats(req, res) {
    try {
      const usersCount = await dbClient.nbUsers()
      const filesCount = await dbClient.nbFiles()

      const stats = {
        users: usersCount,
        files: filesCount,
      }

      res.status(200).json(stats)
    } catch (error) {
      console.error("Error getting stats:", error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

module.exports = AppController


