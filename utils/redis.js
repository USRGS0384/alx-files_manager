// utils/redis.js
import { createClient } from 'redis';

class RedisClient {
  constructor() {
    // Create a Redis client instance
    this.client = createClient();

    // Handle errors
    this.client.on('error', (err) => {
      console.error('Redis client error:', err);
    });
  }

  // Check if Redis client is alive
  isAlive() {
    return this.client.isReady;
  }

  // Get value from Redis for a given key
  async get(key) {
    try {
      const value = await this.client.get(key);
      return value; // Returns null if the key doesn't exist
    } catch (err) {
      console.error('Error getting value from Redis:', err);
      return null;
    }
  }

  // Set value in Redis with expiration time
  async set(key, value, duration) {
    try {
      await this.client.setEx(key, duration, value);
      console.log(`Key "${key}" set with expiration of ${duration} seconds.`);
    } catch (err) {
      console.error('Error setting value in Redis:', err);
    }
  }

  // Delete value from Redis for a given key
  async del(key) {
    try {
      await this.client.del(key);
      console.log(`Key "${key}" deleted from Redis.`);
    } catch (err) {
      console.error('Error deleting value from Redis:', err);
    }
  }
}

// Create and export an instance of RedisClient
const redisClient = new RedisClient();
export default redisClient;

