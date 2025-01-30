const redis = require('redis');

class RedisClient {
  constructor() {
    this.host = process.env.REDIS_HOST || '127.0.0.1';
    this.port = process.env.REDIS_PORT || 6379;
    this.client = redis.createClient({
      host: this.host,
      port: this.port,
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error', err);
    });
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
      return new Promise((resolve, reject) => {
          this.client.get(key, (err, value) => {
              if (err) {
                  console.error("Error getting value:", err);
                  resolve(null);
              } else {
                  resolve(value);
              }
          });
      });
  }

  async set(key, value, duration) {
      return new Promise((resolve, reject) => {
          this.client.set(key, value, 'EX', duration, (err) => {
              if (err) {
                  console.error("Error setting value:", err);
                  resolve();
              } else {
                  resolve();
              }
          });
      });
  }

  async del(key) {
      return new Promise((resolve, reject) => {
          this.client.del(key, (err, res) => {
              if (err) {
                  console.error("Error deleting key:", err);
              }
              resolve();
          });
      });
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
