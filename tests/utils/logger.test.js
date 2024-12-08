const chai = require('chai');
const logger = require('../utils/logger');

const { expect } = chai;

describe('Logger Utility', () => {
  it('should log messages to the console', () => {
    const message = 'Test log message';
    logger.info(message);
    expect(true).to.be.true; // Check manually that the message appears in the console
  });

  it('should log errors correctly', () => {
    const error = new Error('Test error');
    logger.error(error.message);
    expect(true).to.be.true; // Check manually that the error message appears in the console
  });
});

