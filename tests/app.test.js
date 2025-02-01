const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;
const sinon = require('sinon');
const { v4: uuidv4 } = require('uuid');
const { app } = require('../server');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

chai.use(chaiHttp);

describe('API Integration Tests', function() {
  let dbClientConnectStub;
  let dbClientUsersCollectionStub;
  let dbClientFilesCollectionStub;
  let redisClientGetStub;
  let redisClientSetStub;

  before(async function() {
    // Stub database methods
    dbClientConnectStub = sinon.stub(dbClient, 'connect').resolves();
    dbClientUsersCollectionStub = sinon.stub(dbClient, 'usersCollection').returns({
      insertOne: sinon.stub().resolves({ insertedId: 'some-id' }),
      findOne: sinon.stub().resolves(null),
    });
    dbClientFilesCollectionStub = sinon.stub(dbClient, 'filesCollection').returns({
      insertOne: sinon.stub().resolves({ insertedId: 'some-file-id' }),
      findOne: sinon.stub().resolves(null),
    });

    // Stub Redis methods
    redisClientGetStub = sinon.stub(redisClient, 'get').resolves(null);
    redisClientSetStub = sinon.stub(redisClient, 'set').resolves();

    // Stub isAlive methods
    sinon.stub(dbClient, 'isAlive').returns(true);
    sinon.stub(redisClient, 'isAlive').returns(true);

    // Connect to the database
    await dbClient.connect();
  });

  after(function() {
    // Restore all stubbed methods
    sinon.restore();
  });

  describe('GET /status', function() {
    it('should return the status of Redis and DB', function(done) {
      chai.request(app)
        .get('/status')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('redis', true);
          expect(res.body).to.have.property('db', true);
          done();
        });
    });
  });

  describe('GET /stats', function() {
    it('should return the number of users and files', function(done) {
      // Stub the countDocuments method for this test
      const countStub = sinon.stub().resolves(5);
      dbClientUsersCollectionStub.returns({ countDocuments: countStub });
      dbClientFilesCollectionStub.returns({ countDocuments: countStub });

      chai.request(app)
        .get('/stats')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('users', 5);
          expect(res.body).to.have.property('files', 5);
          done();
        });
    });
  });

  // Add more test cases for other endpoints here
});
