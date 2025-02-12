const redis = require("redis")
const { promisify } = require("util")

class RedisClient {
  constructor() {
    this.client = redis.createClient()
    this.getAsync = promisify(this.client.get).bind(this.client)

    this.client.on("error", (error) => {
      console.error(`Redis client error: ${error}`)
    })
  }

  isAlive() {
    return this.client.connected
  }

  async get(key) {
    return this.getAsync(key)
  }

  async set(key, value, duration) {
    this.client.setex(key, duration, value)
  }

  async del(key) {
    this.client.del(key)
  }
}

const redisClient = new RedisClient()
module.exports = redisClient


