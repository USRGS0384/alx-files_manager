import { createClient } from 'redis';

// Class to define methods for Redis commands
class RedisClient {
  constructor() {
    this.client = createClient();

    // Log error if Redis connection fails
    this.client.on('error', (error) => {
      console.error(`Redis client not connected to server: ${error}`);
    });
  }

  // Check connection status and return boolean
  isAlive() {
    return this.client.connected;
  }

  // Get value for the given key from Redis server
  async get(key) {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error(`Failed to get value for key ${key}: ${error}`);
      throw error;
    }
  }

  // Set key-value pair to Redis server with expiry time
  async set(key, value, time) {
    try {
      await this.client.set(key, value);
      await this.client.expire(key, time);
    } catch (error) {
      console.error(`Failed to set value for key ${key}: ${error}`);
      throw error;
    }
  }

  // Delete key-value pair from Redis server
  async del(key) {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error(`Failed to delete key ${key}: ${error}`);
      throw error;
    }
  }
}

const redisClient = new RedisClient();
export default redisClient;

