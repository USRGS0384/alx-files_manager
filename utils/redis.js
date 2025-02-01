const redis = require('redis');
const { promisify } = require('util');

class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.setexAsync = promisify(this.client.setex).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);

    this.client.on('error', (error) => {
      console.error(`Redis client error: ${error}`);
    });
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    return this.getAsync(key);
  }

  async set(key, value, duration) {
    if (duration) {
      return this.setexAsync(key, duration, value);
    } else {
      return this.setAsync(key, value);
    }
  }

  async del(key) {
    return this.delAsync(key);
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
