const { expect } = require('chai');
const dbClient = require('../utils/db');

describe('Database Client', () => {
    it('should check if the database is alive', async () => {
        const isAlive = await dbClient.isAlive();
        expect(isAlive).to.be.a('boolean');
    });
});

