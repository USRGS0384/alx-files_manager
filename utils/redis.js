import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
    constructor() {
        // Create Redis client
        this.client = createClient();

        // Handle connection errors
        this.client.on('error', (err) => console.error('Redis Client Error', err));

        // Promisify Redis methods
        this.getAsync = promisify(this.client.get).bind(this.client);
        this.setAsync = promisify(this.client.set).bind(this.client);
        this.delAsync = promisify(this.client.del).bind(this.client);
    }

    // Check if Redis is alive
    isAlive() {
        return this.client?.isOpen || false;
    }

    // Get a value for a given key
    async get(key) {
        try {
            return await this.getAsync(key);
        } catch (err) {
            console.error('Error fetching key from Redis:', err);
            return null;
        }
    }

    // Set a value with an expiration time
    async set(key, value, duration) {
        try {
            await this.setAsync(key, value, 'EX', duration);
        } catch (err) {
            console.error('Error setting key in Redis:', err);
        }
    }

    // Delete a key
    async del(key) {
        try {
            await this.delAsync(key);
        } catch (err) {
            console.error('Error deleting key from Redis:', err);
        }
    }
}

// Export a single instance of RedisClient
const redisClient = new RedisClient();
export default redisClient;

