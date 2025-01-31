const { expect } = require('chai');
const dbClient = require('../utils/db');

describe('Database Client', function() {
  it('should check if the database is alive', async function() {
    const isAlive = await dbClient.isAlive();
    expect(isAlive).to.be.a('boolean');
  });
});

