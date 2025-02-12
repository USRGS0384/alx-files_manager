const { MongoClient } = require("mongodb")

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || "localhost"
    const port = process.env.DB_PORT || 27017
    const database = process.env.DB_DATABASE || "files_manager"
    const url = `mongodb://${host}:${port}/${database}`

    this.client = new MongoClient(url, { useUnifiedTopology: true })
    this.client.connect((err) => {
      if (err) console.error(err)
      else console.log("Connected to MongoDB")
    })
  }

  isAlive() {
    return !!this.client && !!this.client.topology && this.client.topology.isConnected()
  }

  async nbUsers() {
    return this.client.db().collection("users").countDocuments()
  }

  async nbFiles() {
    return this.client.db().collection("files").countDocuments()
  }
}

const dbClient = new DBClient()
module.exports = dbClient


