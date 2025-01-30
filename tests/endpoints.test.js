const request = require('supertest');
const { ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const app = require('../server'); // Assuming your Express app is exported from server.js
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

describe('API Endpoints', () => {
  let token;
  let userId;
  let fileId;

  beforeAll(async () => {
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

  describe('GET /status', () => {
    it('should return the status of Redis and DB', async () => {
      const res = await request(app).get('/status');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('redis', true);
      expect(res.body).toHaveProperty('db', true);
    });
  });

  describe('GET /stats', () => {
    it('should return the number of users and files', async () => {
      const res = await request(app).get('/stats');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('users');
      expect(res.body).toHaveProperty('files');
      expect(typeof res.body.users).toBe('number');
      expect(typeof res.body.files).toBe('number');
    });
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const res = await request(app)
        .post('/users')
        .send({ email: 'newuser@example.com', password: 'newpassword' });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('email', 'newuser@example.com');
    });

    it('should return an error if email is missing', async () => {
      const res = await request(app)
        .post('/users')
        .send({ password: 'newpassword' });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Missing email');
    });
  });

  describe('GET /connect', () => {
    it('should authenticate a user and return a token', async () => {
      const res = await request(app)
        .get('/connect')
        .set('Authorization', 'Basic ' + Buffer.from('test@example.com:testpassword').toString('base64'));
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      token = res.body.token;
    });

    it('should return an error for invalid credentials', async () => {
      const res = await request(app)
        .get('/connect')
        .set('Authorization', 'Basic ' + Buffer.from('test@example.com:wrongpassword').toString('base64'));
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Unauthorized');
    });
  });

  describe('GET /disconnect', () => {
    it('should disconnect a user', async () => {
      const res = await request(app)
        .get('/disconnect')
        .set('X-Token', token);
      expect(res.statusCode).toBe(204);
    });

    it('should return an error for invalid token', async () => {
      const res = await request(app)
        .get('/disconnect')
        .set('X-Token', 'invalid-token');
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Unauthorized');
    });
  });

  describe('GET /users/me', () => {
    it('should return the current user', async () => {
      const res = await request(app)
        .get('/users/me')
        .set('X-Token', token);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', userId);
      expect(res.body).toHaveProperty('email', 'test@example.com');
    });

    it('should return an error for invalid token', async () => {
      const res = await request(app)
        .get('/users/me')
        .set('X-Token', 'invalid-token');
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Unauthorized');
    });
  });

  describe('POST /files', () => {
    it('should create a new file', async () => {
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

    it('should return an error for missing name', async () => {
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

  describe('GET /files/:id', () => {
    it('should return a specific file', async () => {
      const res = await request(app)
        .get(`/files/${fileId}`)
        .set('X-Token', token);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', fileId);
      expect(res.body).toHaveProperty('name', 'testfile.txt');
    });

    it('should return an error for non-existent file', async () => {
      const res = await request(app)
        .get(`/files/${new ObjectId()}`)
        .set('X-Token', token);
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Not found');
    });
  });

  describe('GET /files', () => {
    it('should return a list of files with pagination', async () => {
      const res = await request(app)
        .get('/files')
        .set('X-Token', token)
        .query({ page: 0 });
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeLessThanOrEqual(20);
    });

    it('should return files for a specific parent', async () => {
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

  describe('PUT /files/:id/publish', () => {
    it('should publish a file', async () => {
      const res = await request(app)
        .put(`/files/${fileId}/publish`)
        .set('X-Token', token);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('isPublic', true);
    });
  });

  describe('PUT /files/:id/unpublish', () => {
    it('should unpublish a file', async () => {
      const res = await request(app)
        .put(`/files/${fileId}/unpublish`)
        .set('X-Token', token);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('isPublic', false);
    });
  });

  describe('GET /files/:id/data', () => {
    it('should return the content of a file', async () => {
      const res = await request(app)
        .get(`/files/${fileId}/data`)
        .set('X-Token', token);
      expect(res.statusCode).toBe(200);
      expect(res.text).toBe('Hello, World!');
    });

    it('should return an error for non-existent file', async () => {
      const res = await request(app)
        .get(`/files/${new ObjectId()}/data`)
        .set('X-Token', token);
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Not found');
    });
  });
});
