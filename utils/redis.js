import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();
    
    // Handling connection errors
    this.client.on('error', (err) => {
      console.error('Redis error:', err);
    });

    // Connecting event
    this.client.on('connect', () => {
      console.log('Redis client connected');
    });
  }

  // Check if Redis client is connected
  isAlive() {
    return this.client.isOpen;
  }

  // Get value for the given key
  async get(key) {
    try {
      const value = await this.client.get(key);
      return value; // Return the Redis value
    } catch (err) {
      console.error(`Failed to get value for key ${key}:`, err);
      return null;
    }
  }

  // Set key-value with an expiration time
  async set(key, value, duration) {
    try {
      await this.client.setEx(key, duration, value); // setEx sets the expiration time
      console.log(`Key ${key} set with expiration time of ${duration} seconds.`);
    } catch (err) {
      console.error(`Failed to set key ${key}:`, err);
    }
  }

  // Delete key-value from Redis
  async del(key) {
    try {
      await this.client.del(key);
      console.log(`Key ${key} deleted.`);
    } catch (err) {
      console.error(`Failed to delete key ${key}:`, err);
    }
  }
}

// Export an instance of RedisClient
const redisClient = new RedisClient();
export default redisClient;

