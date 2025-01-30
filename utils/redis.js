const redis = require('redis');
const { promisify } = require('util');

class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.client.on('error', (error) => {
      console.error(`Redis client error: ${error}`);
    });

      this.connected = false;
      this.client.on('connect', () => {
          this.connected = true;
      })
  }

  isAlive() {
      return this.connected;
  }

  async get(key) {
    const asyncGet = promisify(this.client.get).bind(this.client);
    return asyncGet(key);
  }

  async set(key, value, duration) {
    const asyncSet = promisify(this.client.setex).bind(this.client);
    return asyncSet(key, duration, value);
  }

  async del(key) {
    const asyncDel = promisify(this.client.del).bind(this.client);
    return asyncDel(key);
  }

    quit() {
        return new Promise((resolve, reject) => {
            this.client.quit((err, res) => {
                if (err) {
                    console.error("Error quitting client:", err)
                }
                resolve()
            })
        })
    }
}

const redisClient = new RedisClient();
module.exports = redisClient;
