// utils/redis.js
const Redis = require('ioredis');

class RedisClient {
  constructor() {
    this.client = new Redis(); // Connects to Redis on localhost:6379 by default
    this.client.on('error', (err) => {
      console.error('Redis error:', err);
    });
  }

  // Check if Redis connection is alive
  async isAlive() {
    try {
      const response = await this.client.ping();
      return response === 'PONG';
    } catch {
      return false;
    }
  }

  // Get the value of a key
  async get(key) {
    return this.client.get(key);
  }

  // Set a value with an expiration time
  async set(key, value, duration) {
    await this.client.set(key, value, 'EX', duration);
  }

  // Delete a key
  async del(key) {
    await this.client.del(key);
  }
}

module.exports = new RedisClient();

