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
  let dbClientUsersCollectionStub;
  let dbClientFilesCollectionStub;
  let redisClientGetStub;
  let redisClientSetStub;

  before(function() {
    // Stub database methods
    dbClientUsersCollectionStub = sinon.stub(dbClient, 'usersCollection').returns({
      insertOne: sinon.stub().resolves({ insertedId: 'some-id' }),
      findOne: sinon.stub().resolves(null),
      countDocuments: sinon.stub().resolves(5)
    });
    dbClientFilesCollectionStub = sinon.stub(dbClient, 'filesCollection').returns({
      insertOne: sinon.stub().resolves({ insertedId: 'some-file-id' }),
      findOne: sinon.stub().resolves(null),
      countDocuments: sinon.stub().resolves(5)
    });

    // Stub Redis methods
    redisClientGetStub = sinon.stub(redisClient, 'get').resolves(null);
    redisClientSetStub = sinon.stub(redisClient, 'set').resolves('OK');

    // Stub isAlive methods
    sinon.stub(dbClient, 'isAlive').returns(true);
    sinon.stub(redisClient, 'isAlive').returns(true);
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

  describe('POST /users', function() {
    it('should create a new user', function(done) {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      chai.request(app)
        .post('/users')
        .send(userData)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('id');
          expect(res.body).to.have.property('email', userData.email);
          done();
        });
    });
  });

  describe('GET /connect', function() {
    it('should authenticate a user and return a token', function(done) {
      const authHeader = Buffer.from('test@example.com:password123').toString('base64');

      chai.request(app)
        .get('/connect')
        .set('Authorization', `Basic ${authHeader}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('token');
          done();
        });
    });
  });

  describe('GET /disconnect', function() {
    it('should disconnect a user', function(done) {
      const token = 'valid_token';
      redisClientGetStub.withArgs(`auth_${token}`).resolves('user_id');

      chai.request(app)
        .get('/disconnect')
        .set('X-Token', token)
        .end((err, res) => {
          expect(res).to.have.status(204);
          done();
        });
    });
  });

  describe('GET /users/me', function() {
    it('should return the current user', function(done) {
      const token = 'valid_token';
      const userId = 'user_id';
      redisClientGetStub.withArgs(`auth_${token}`).resolves(userId);
      dbClientUsersCollectionStub().findOne.withArgs({ _id: userId }).resolves({
        _id: userId,
        email: 'test@example.com'
      });

      chai.request(app)
        .get('/users/me')
        .set('X-Token', token)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('id', userId);
          expect(res.body).to.have.property('email', 'test@example.com');
          done();
        });
    });
  });
});
