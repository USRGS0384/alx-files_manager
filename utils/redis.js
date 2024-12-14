import { createClient } from 'redis';

class RedisClient {
    constructor() {
        // Initialize Redis client
        this.client = createClient();
        this.isClientConnected = false;

        // Event listener for successful connection
        this.client.on('connect', () => {
            console.log('Redis client connected');
            this.isClientConnected = true;
        });

        // Event listener for errors
        this.client.on('error', (err) => {
            console.error('Redis client error:', err);
            this.isClientConnected = false;
        });

        // Explicitly connect to Redis
        this.client.connect().catch((err) => {
            console.error('Failed to connect to Redis:', err);
        });
    }

    // Check if Redis is alive
    isAlive() {
        return this.isClientConnected;
    }

    // Get value for a key
    async get(key) {
        try {
            return await this.client.get(key);
        } catch (err) {
            console.error('Error retrieving key:', err);
            return null;
        }
    }

    // Set value for a key with expiration in seconds
    async set(key, value, duration) {
        try {
            await this.client.set(key, value, { EX: duration });
        } catch (err) {
            console.error('Error setting key:', err);
        }
    }

    // Delete a key
    async del(key) {
        try {
            await this.client.del(key);
        } catch (err) {
            console.error('Error deleting key:', err);
        }
    }
}

// Export a single instance of RedisClient
const redisClient = new RedisClient();
export default redisClient;

