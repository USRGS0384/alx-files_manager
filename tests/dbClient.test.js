const dbClient = require('../utils/db');

describe('dbClient', () => {
  jest.timeout(10000);

  test('isAlive returns true when connected', () => {
    expect(dbClient.isAlive()).toBe(true);
  });

  test('nbUsers returns the correct number of users', async () => {
    const usersCount = await dbClient.nbUsers();
    expect(typeof usersCount).toBe('number');
  });

  test('nbFiles returns the correct number of files', async () => {
    const filesCount = await dbClient.nbFiles();
    expect(typeof filesCount).toBe('number');
  });
});
