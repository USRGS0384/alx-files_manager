import { createClient } from 'redis';

class RedisClient {
    constructor() {
        this.client = createClient();
        this.isClientConnected = false;

        // Bind event listeners
        this.client.on('connect', () => {
            console.log('Redis client connected');
            this.isClientConnected = true;
        });

        this.client.on('error', (err) => {
            console.error('Redis client error:', err);
            this.isClientConnected = false;
        });

        // Ensure client connects immediately
        (async () => {
            try {
                await this.client.connect();
            } catch (err) {
                console.error('Failed to connect to Redis:', err);
            }
        })();
    }

    isAlive() {
        return this.isClientConnected;
    }

    async get(key) {
        try {
            return await this.client.get(key);
        } catch (err) {
            console.error('Error retrieving key:', err);
            return null;
        }
    }

    async set(key, value, duration) {
        try {
            await this.client.set(key, value, { EX: duration });
        } catch (err) {
            console.error('Error setting key:', err);
        }
    }

    async del(key) {
        try {
            await this.client.del(key);
        } catch (err) {
            console.error('Error deleting key:', err);
        }
    }
}

const redisClient = new RedisClient();
export default redisClient;

