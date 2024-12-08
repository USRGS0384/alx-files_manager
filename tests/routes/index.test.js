const chai = require('chai');
const app = require('../server');

const { expect } = chai;

describe('Routes', () => {
  it('should load all routes without errors', () => {
    const routes = app._router.stack.filter((layer) => layer.route);
    expect(routes).to.be.an('array');
    expect(routes.length).to.be.greaterThan(0);
  });

  it('should respond to a valid route', async () => {
    const res = await request(app).get('/status');
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('redis');
    expect(res.body).to.have.property('db');
  });
});

