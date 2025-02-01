const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
const server = require('../server');

chai.use(chaiHttp);
const { expect } = chai;

describe('API Integration Tests', () => {
  let usersCollectionStub;

  before(async () => {
    sinon.stub(redisClient, 'isAlive').returns(true);
    sinon.stub(dbClient, 'isAlive').returns(true);

    // Stub the usersCollection method
    usersCollectionStub = sinon.stub(dbClient, 'usersCollection').resolves({
      countDocuments: sinon.stub().resolves(5), // Ensure this returns a valid value
    });
  });

  after(() => {
    sinon.restore(); // Restore all stubbed methods
  });

  it('should return the status of Redis and DB', async () => {
    const res = await chai.request(server).get('/status');
    expect(res).to.have.status(200);
    expect(res.body).to.have.property('redis', true);
    expect(res.body).to.have.property('db', true);
  });

  it('should return the number of users and files', async () => {
    const res = await chai.request(server).get('/stats');
    expect(res).to.have.status(200);
    expect(res.body).to.have.property('users', 5);
  });
});

