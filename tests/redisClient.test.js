const redisClient = require('../utils/redis');

describe('redisClient', () => {
  jest.setTimeout(10000);

  it('isAlive returns true when connected', async function() {
    expect(redisClient.isAlive()).toBe(true);
  });

  it('get returns null for non-existent key', async function() {
    const value = await redisClient.get('nonexistentkey');
    expect(value).toBeNull();
  });

  it('set and get work correctly', async function() {
    await redisClient.set('testkey', 'testvalue', 10);
    const value = await redisClient.get('testkey');
    expect(value).toBe('testvalue');
  });

  it('del removes a key', async function() {
    await redisClient.set('testkey', 'testvalue', 10);
    await redisClient.del('testkey');
    const value = await redisClient.get('testkey');
    expect(value).toBeNull();
  });
});
