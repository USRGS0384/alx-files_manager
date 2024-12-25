import redis from 'redis';

class RedisClient {
  constructor() {
    // Create Redis client
    this.client = redis.createClient({
      host: '127.0.0.1', // Ensure Redis is bound to localhost (default)
      port: 6379, // Default Redis port
    });

    // Error handling
    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    // No need to explicitly connect in Redis v3.x
    // this.client.connect(); <-- Remove this line
  }

  // Check if Redis connection is alive
  isAlive() {
    return this.client.connected; // `connected` property tells if the client is connected
  }

  // Get value by key
  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  }

  // Set key-value pair with expiration time
  async set(key, value, duration) {
    return new Promise((resolve, reject) => {
      this.client.setex(key, duration, value, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  }

  // Delete key
  async del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  }
}

// Export a single instance of the RedisClient
const redisClient = new RedisClient();
export default redisClient;
