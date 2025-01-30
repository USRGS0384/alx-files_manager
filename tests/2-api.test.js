const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;
const app = require('../server');

chai.use(chaiHttp);

describe('API endpoints', () => {
  it('GET /status should return correct status', (done) => {
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

  it('GET /stats should return correct stats', (done) => {
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

  // Add more tests for other endpoints...
});
