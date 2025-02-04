const sha1 = require("sha1")
const { ObjectId } = require("mongodb")
const Bull = require("bull")
const dbClient = require("../utils/db")
const redisClient = require("../utils/redis")

const userQueue = new Bull("userQueue")

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body

    if (!email) return res.status(400).json({ error: "Missing email" })
    if (!password) return res.status(400).json({ error: "Missing password" })

    const userExists = await dbClient.client.db().collection("users").findOne({ email })
    if (userExists) return res.status(400).json({ error: "Already exist" })

    const hashedPassword = sha1(password)
    const result = await dbClient.client.db().collection("users").insertOne({ email, password: hashedPassword })

    userQueue.add({ userId: result.insertedId.toString() })

    return res.status(201).json({ id: result.insertedId, email })
  }

  static async getMe(req, res) {
    const token = req.header("X-Token")
    if (!token) return res.status(401).json({ error: "Unauthorized" })

    const userId = await redisClient.get(`auth_${token}`)
    if (!userId) return res.status(401).json({ error: "Unauthorized" })

    const user = await dbClient.client
      .db()
      .collection("users")
      .findOne({ _id: ObjectId(userId) })
    if (!user) return res.status(401).json({ error: "Unauthorized" })

    return res.status(200).json({ id: user._id, email: user.email })
  }
}

module.exports = UsersController


