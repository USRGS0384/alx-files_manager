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

    this.client.on('connect', () => {
      console.log('Redis client connected successfully');
    });
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    try {
      return await this.getAsync(key);
    } catch (error) {
      console.error(`Error fetching key ${key}: ${error.message}`);
      return null;
    }
  }

  async set(key, value, duration = 0) {
    try {
      if (duration > 0) {
        return await this.setexAsync(key, duration, value);
      } else {
        return await this.setAsync(key, value);
      }
    } catch (error) {
      console.error(`Error setting key ${key}: ${error.message}`);
    }
  }

  async del(key) {
    try {
      return await this.delAsync(key);
    } catch (error) {
      console.error(`Error deleting key ${key}: ${error.message}`);
    }
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;

