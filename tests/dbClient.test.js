const chai = require("chai")
const chaiAsPromised = require("chai-as-promised")
const sinon = require("sinon")
const { MongoClient } = require("mongodb")
const dbClient = require("../utils/db")

chai.use(chaiAsPromised)
const expect = chai.expect

describe("dbClient", () => {
  describe("isAlive", () => {
    it("should return true when connected", () => {
      expect(dbClient.isAlive()).to.be.true
    })

    it("should return false when not connected", () => {
      sinon.stub(dbClient.client, "topology").value({ isConnected: () => false })
      expect(dbClient.isAlive()).to.be.false
      sinon.restore()
    })
  })

  describe("nbUsers", () => {
    it("should return the number of users", async () => {
      const count = await dbClient.nbUsers()
      expect(count).to.be.a("number")
    })
  })

  describe("nbFiles", () => {
    it("should return the number of files", async () => {
      const count = await dbClient.nbFiles()
      expect(count).to.be.a("number")
    })
  })
})


