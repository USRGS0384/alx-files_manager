const Bull = require('bull');
const chai = require('chai');
const dbClient = require('../utils/db');
const { userQueue } = require('../worker');

const { expect } = chai;

describe('User Queue', () => {
  it('should process jobs with valid userId', async () => {
    const userId = await dbClient.createUser({ email: 'queueuser@example.com', password: 'password' });
    const job = await userQueue.add({ userId });

    userQueue.process(async (job) => {
      expect(job.data).to.have.property('userId', userId);
      console.log(`Welcome ${job.data.email}!`);
    });

    await job.finished();
  });

  it('should throw an error for missing userId', async () => {
    const job = await userQueue.add({});
    userQueue.process(async (job) => {
      throw new Error('Missing userId');
    });

    try {
      await job.finished();
    } catch (err) {
      expect(err.message).to.equal('Missing userId');
    }
  });
});

