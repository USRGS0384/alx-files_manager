const { describe, it, before, after } = require("mocha"); // Fixed import
const request = require("supertest");
const { ObjectId } = require("mongodb");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const { expect } = require("chai"); // Use Chai for assertions
const app = require("../server");
const dbClient = require("../utils/db");
const redisClient = require("../utils/redis");

describe("API Endpoints", function () {
  let testUserId;
  let testToken;

  before(async function () { // Use 'before' instead of 'beforeAll'
    this.timeout(5000); // Increase timeout if needed

    // Clear the database
    await dbClient.db.collection("users").deleteMany({});
    await dbClient.db.collection("files").deleteMany({});

    // Create a test user
    const hashedPassword = await bcrypt.hash("testpassword", 10);
    const result = await dbClient.db.collection("users").insertOne({
      email: "testuser@example.com",
      password: hashedPassword,
    });

    testUserId = result.insertedId.toString();
    testToken = `auth_${testUserId}`;

    // Store token in Redis
    await redisClient.set(testToken, testUserId, "EX", 86400);
  });

  after(async () => {
    // Cleanup
    await dbClient.db.collection("users").deleteMany({});
    await dbClient.db.collection("files").deleteMany({});
    await redisClient.del(testToken);
  });

  describe("GET /status", function () {
    it("should return the status of Redis and DB", async function () {
      const res = await request(app).get("/status");
      expect(res.statusCode).to.equal(200); // Use Chai syntax
      expect(res.body).to.have.property("redis");
      expect(res.body).to.have.property("db");
    });
  });

  // More tests can be added here
});

