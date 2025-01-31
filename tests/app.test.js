const chai = require('chai');
const chaiHttp = require('chai-http');

const { expect } = chai;
const sinon = require('sinon');
const { v4: uuidv4 } = require('uuid');
const { app } = require('../server');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

chai.use(chaiHttp);

describe('API Integration Tests', () => {
  let dbClientConnectStub;
  let dbClientUsersCollectionStub;
  let dbClientFilesCollectionStub;

  before(async function() {
    // Stub database methods
    dbClientConnectStub = sinon.stub(dbClient, 'connect').resolves();
    dbClientUsersCollectionStub = sinon.stub(dbClient, 'usersCollection').resolves({
      insertOne: sinon.stub().resolves({ insertedId: 'some-id' }),
      findOne: sinon.stub().resolves(null),
    });
    dbClientFilesCollectionStub = sinon.stub(dbClient, 'filesCollection').resolves({
      insertOne: sinon.stub().resolves({ insertedId: 'some-file-id' }),
      findOne: sinon.stub().resolves(null),
    });

    // Connect to the database
    await dbClient.connect();
  });

  after(function() {
    // Restore stubbed methods
    dbClientConnectStub.restore();
    dbClientUsersCollectionStub.restore();
    dbClientFilesCollectionStub.restore();
  });

  describe('GET /status', function() {
    it('should return the status of Redis and DB', function(done) {
      chai.request(app)
        .get('/status')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('redis').that.is.a('boolean');
          expect(res.body).to.have.property('db').that.is.a('boolean');
          done();
        });
    });
  });

  describe('GET /stats', function() {
    it('should return the number of users and files', function(done) {
      chai.request(app)
        .get('/stats')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('users').that.is.a('number');
          expect(res.body).to.have.property('files').that.is.a('number');
          done();
        });
    });
  });

  // Add more test cases for other endpoints here
});
