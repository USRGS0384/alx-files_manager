import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();
    this.client.on('error', (err) => console.error('Redis error:', err));
  }

  isAlive() {
    return this.client.connected;
  }
}

export default new RedisClient();

