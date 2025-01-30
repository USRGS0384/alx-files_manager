const redisClient = require('../utils/redis');

describe('redisClient', () => {
  jest.setTimeout(10000);

  test('isAlive returns true when connected', async () => {
    expect(redisClient.isAlive()).toBe(true);
  });

  test('get returns null for non-existent key', async () => {
    const value = await redisClient.get('nonexistentkey');
    expect(value).toBeNull();
  });

  test('set and get work correctly', async () => {
    await redisClient.set('testkey', 'testvalue', 10);
    const value = await redisClient.get('testkey');
    expect(value).toBe('testvalue');
  });

  test('del removes a key', async () => {
    await redisClient.set('testkey', 'testvalue', 10);
    await redisClient.del('testkey');
    const value = await redisClient.get('testkey');
    expect(value).toBeNull();
  });
});
