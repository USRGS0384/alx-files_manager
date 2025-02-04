const chai = require("chai")
const chaiAsPromised = require("chai-as-promised")
const sinon = require("sinon")
const redisClient = require("../utils/redis")

chai.use(chaiAsPromised)
const expect = chai.expect

describe("redisClient", () => {
  describe("isAlive", () => {
    it("should return true when connected", () => {
      expect(redisClient.isAlive()).to.be.true
    })

    it("should return false when not connected", () => {
      sinon.stub(redisClient.client, "connected").value(false)
      expect(redisClient.isAlive()).to.be.false
      sinon.restore()
    })
  })

  describe("get", () => {
    it("should retrieve a value from Redis", async () => {
      await redisClient.set("testKey", "testValue", 10)
      const value = await redisClient.get("testKey")
      expect(value).to.equal("testValue")
    })

    it("should return null for non-existent key", async () => {
      const value = await redisClient.get("nonExistentKey")
      expect(value).to.be.null
    })
  })
})


