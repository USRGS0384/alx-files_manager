const request = require('supertest');
const { ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt'); // Ensure bcrypt is installed and imported
const app = require('../server');
const dbClient = require('../utils/db');
// const redisClient = require('../utils/redis'); // Remove if not used

describe('API Endpoints', function () {
  let token;
  let userId;
  let fileId;

  beforeAll(async function () { // Use function() instead of arrow function
    // Clear the database and create a test user
    await dbClient.db.collection('users').deleteMany({});
    await dbClient.db.collection('files').deleteMany({});

    const hashedPassword = await bcrypt.hash('testpassword', 10);
    const user = await dbClient.db.collection('users').insertOne({
      email: 'test@example.com',
      password: hashedPassword,
    });
    userId = user.insertedId.toString();
  });

  describe('GET /status', function () {
    it('should return the status of Redis and DB', async function () {
      const res = await request(app).get('/status');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('redis', true);
      expect(res.body).toHaveProperty('db', true);
    });
  });

  // Continue similarly for other test cases
});

