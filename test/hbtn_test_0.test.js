import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../server'; // Update if needed to point to your Express app

const { expect } = chai;

chai.use(chaiHttp);

describe('API Tests', () => {
  describe('GET /status', () => {
    it('should return Redis and MongoDB status', (done) => {
      chai.request(app)
        .get('/status')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('redis', true);
          expect(res.body).to.have.property('db', true);
          done();
        });
    });
  });

  describe('GET /stats', () => {
    it('should return user and file counts', (done) => {
      chai.request(app)
        .get('/stats')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('users').that.is.a('number');
          expect(res.body).to.have.property('files').that.is.a('number');
          done();
        });
    });
  });
});

