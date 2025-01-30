const { expect } = require('chai');
const dbClient = require('../utils/db');

describe('DBClient', () => {
  before(async () => {
    // Wait for the database connection to be established
    while (!dbClient.isAlive()) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  });

  it('should connect to MongoDB', () => {
    expect(dbClient.isAlive()).to.be.true;
  });

  it('should return the number of users', async () => {
    const nbUsers = await dbClient.nbUsers();
    expect(nbUsers).to.be.a('number');
  });

  it('should return the number of files', async () => {
    const nbFiles = await dbClient.nbFiles();
    expect(nbFiles).to.be.a('number');
  });
});
