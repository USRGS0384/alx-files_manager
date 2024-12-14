// utils/redis.js
class RedisClient {
  constructor() {
    // Create a Redis client instance
    this.client = createClient();

    // Handle errors
    this.client.on('error', (err) => {
      console.error('Redis client error:', err);
    });

    // Ensure that the Redis client is connected before proceeding
    this.client.connect().catch((err) => {
      console.error('Error connecting to Redis:', err);
    });
  }

  // Set value in Redis with expiration time
  async set(key, value, duration) {
    try {
      // Ensure 'key' is a string
      if (typeof key !== 'string') {
        throw new TypeError('The key must be a string.');
      }

      // Ensure 'value' is a valid type (string, number, or buffer)
      if (typeof value !== 'string' && typeof value !== 'number' && !Buffer.isBuffer(value)) {
        throw new TypeError('The value must be a string, number, or buffer.');
      }

      // Ensure 'duration' is a positive integer
      if (!Number.isInteger(duration) || duration <= 0) {
        throw new TypeError('The duration must be a positive integer.');
      }

      // Set the value in Redis with expiration time
      await this.client.setEx(key, duration, value);
      console.log(`Key "${key}" set with expiration of ${duration} seconds.`);
    } catch (err) {
      console.error('Error setting value in Redis:', err);
    }
  }
}

