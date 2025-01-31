const { expect } = require('chai');
const redisClient = require('../utils/redis');

describe('redisClient', function () {
  this.timeout(10000); // Set timeout for Mocha

  it('should return true when connected', function (done) {
    expect(redisClient.isAlive()).to.be.true;
    done();
  });

  it('should return null for a non-existent key', async function () {
    const value = await redisClient.get('nonexistentkey');
    expect(value).to.be.null;
  });

  it('should set and get values correctly', async function () {
    await redisClient.set('testkey', 'testvalue', 10);
    const value = await redisClient.get('testkey');
    expect(value).to.equal('testvalue');
  });

  it('should delete a key successfully', async function () {
    await redisClient.set('testkey', 'testvalue', 10);
    await redisClient.del('testkey');
    const value = await redisClient.get('testkey');
    expect(value).to.be.null;
  });
});

