import { createClient } from 'redis';

class RedisClient {
    constructor() {
        this.client = createClient();
        this.isClientConnected = false;

        // Handle connection events
        this.client.on('connect', () => {
            console.log('Redis client connected');
            this.isClientConnected = true;
        });

        this.client.on('error', (err) => {
            console.error('Redis Client Error:', err);
            this.isClientConnected = false;
        });

        // Connect to Redis
        this.client.connect().catch((err) => {
            console.error('Error connecting to Redis:', err);
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
            console.error('Error fetching key from Redis:', err);
            return null;
        }
    }

    // Set value for a key with expiration
    async set(key, value, duration) {
        try {
            await this.client.set(key, value, { EX: duration });
        } catch (err) {
            console.error('Error setting key in Redis:', err);
        }
    }

    // Delete a key
    async del(key) {
        try {
            await this.client.del(key);
        } catch (err) {
            console.error('Error deleting key from Redis:', err);
        }
    }
}

const redisClient = new RedisClient();
export default redisClient;

