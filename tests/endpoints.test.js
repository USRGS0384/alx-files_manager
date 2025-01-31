const request = require('supertest');
const { ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const app = require('../server'); // Assuming your Express app is exported from server.js
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

describe('aPI Endpoints', () => {
  let token;
  let userId;
  let fileId;

  beforeAll(async function() {
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

  describe('gET /status', function() {
    it('should return the status of Redis and DB', async function() {
      const res = await request(app).get('/status');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('redis', true);
      expect(res.body).toHaveProperty('db', true);
    });
  });

  describe('gET /stats', function() {
    it('should return the number of users and files', async function() {
      const res = await request(app).get('/stats');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('users');
      expect(res.body).toHaveProperty('files');
      expect(typeof res.body.users).toBe('number');
      expect(typeof res.body.files).toBe('number');
    });
  });

  describe('pOST /users', function() {
    it('should create a new user', async function() {
      const res = await request(app)
        .post('/users')
        .send({ email: 'newuser@example.com', password: 'newpassword' });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('email', 'newuser@example.com');
    });

    it('should return an error if email is missing', async function() {
      const res = await request(app)
        .post('/users')
        .send({ password: 'newpassword' });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Missing email');
    });
  });

  describe('gET /connect', function() {
    it('should authenticate a user and return a token', async function() {
      const res = await request(app)
        .get('/connect')
        .set('Authorization', `Basic ${Buffer.from('test@example.com:testpassword').toString('base64')}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      token = res.body.token;
    });

    it('should return an error for invalid credentials', async function() {
      const res = await request(app)
        .get('/connect')
        .set('Authorization', `Basic ${Buffer.from('test@example.com:wrongpassword').toString('base64')}`);
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Unauthorized');
    });
  });

  describe('gET /disconnect', function() {
    it('should disconnect a user', async function() {
      const res = await request(app)
        .get('/disconnect')
        .set('X-Token', token);
      expect(res.statusCode).toBe(204);
    });

    it('should return an error for invalid token', async function() {
      const res = await request(app)
        .get('/disconnect')
        .set('X-Token', 'invalid-token');
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Unauthorized');
    });
  });

  describe('gET /users/me', function() {
    it('should return the current user', async function() {
      const res = await request(app)
        .get('/users/me')
        .set('X-Token', token);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', userId);
      expect(res.body).toHaveProperty('email', 'test@example.com');
    });

    it('should return an error for invalid token', async function() {
      const res = await request(app)
        .get('/users/me')
        .set('X-Token', 'invalid-token');
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Unauthorized');
    });
  });

  describe('pOST /files', function() {
    it('should create a new file', async function() {
      const res = await request(app)
        .post('/files')
        .set('X-Token', token)
        .send({
          name: 'testfile.txt',
          type: 'file',
          data: Buffer.from('Hello, World!').toString('base64'),
        });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('userId', userId);
      expect(res.body).toHaveProperty('name', 'testfile.txt');
      fileId = res.body.id;
    });

    it('should return an error for missing name', async function() {
      const res = await request(app)
        .post('/files')
        .set('X-Token', token)
        .send({
          type: 'file',
          data: Buffer.from('Hello, World!').toString('base64'),
        });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Missing name');
    });
  });

  describe('gET /files/:id', function() {
    it('should return a specific file', async function() {
      const res = await request(app)
        .get(`/files/${fileId}`)
        .set('X-Token', token);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', fileId);
      expect(res.body).toHaveProperty('name', 'testfile.txt');
    });

    it('should return an error for non-existent file', async function() {
      const res = await request(app)
        .get(`/files/${new ObjectId()}`)
        .set('X-Token', token);
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Not found');
    });
  });

  describe('gET /files', function() {
    it('should return a list of files with pagination', async function() {
      const res = await request(app)
        .get('/files')
        .set('X-Token', token)
        .query({ page: 0 });
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeLessThanOrEqual(20);
    });

    it('should return files for a specific parent', async function() {
      const parentFolder = await dbClient.db.collection('files').insertOne({
        userId: ObjectId(userId),
        name: 'testfolder',
        type: 'folder',
        parentId: 0,
      });

      const res = await request(app)
        .get('/files')
        .set('X-Token', token)
        .query({ parentId: parentFolder.insertedId.toString() });
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('pUT /files/:id/publish', function() {
    it('should publish a file', async function() {
      const res = await request(app)
        .put(`/files/${fileId}/publish`)
        .set('X-Token', token);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('isPublic', true);
    });
  });

  describe('pUT /files/:id/unpublish', function() {
    it('should unpublish a file', async function() {
      const res = await request(app)
        .put(`/files/${fileId}/unpublish`)
        .set('X-Token', token);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('isPublic', false);
    });
  });

  describe('gET /files/:id/data', function() {
    it('should return the content of a file', async function() {
      const res = await request(app)
        .get(`/files/${fileId}/data`)
        .set('X-Token', token);
      expect(res.statusCode).toBe(200);
      expect(res.text).toBe('Hello, World!');
    });

    it('should return an error for non-existent file', async function() {
      const res = await request(app)
        .get(`/files/${new ObjectId()}/data`)
        .set('X-Token', token);
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Not found');
    });
  });
});
