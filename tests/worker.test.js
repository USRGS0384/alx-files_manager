const chai = require('chai');
const { userQueue } = require('../worker');

const { expect } = chai;

describe('Worker', () => {
  it('should process valid jobs from the user queue', async () => {
    const job = await userQueue.add({ userId: 'validId' });

    userQueue.process((job) => {
      expect(job.data).to.have.property('userId', 'validId');
      console.log('Job processed successfully');
    });

    await job.finished();
  });

  it('should handle errors during job processing', async () => {
    const job = await userQueue.add({ invalidKey: 'missingUserId' });

    userQueue.process(() => {
      throw new Error('Missing userId');
    });

    try {
      await job.finished();
    } catch (err) {
      expect(err.message).to.equal('Missing userId');
    }
  });
});

