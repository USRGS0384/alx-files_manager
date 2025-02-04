const chai = require("chai")
const chaiHttp = require("chai-http")
const app = require("../server")

chai.use(chaiHttp)
const expect = chai.expect

describe("AppController", () => {
  describe("GET /status", () => {
    it("should return the status of Redis and DB", (done) => {
      chai
        .request(app)
        .get("/status")
        .end((err, res) => {
          expect(res).to.have.status(200)
          expect(res.body).to.be.an("object")
          expect(res.body).to.have.property("redis")
          expect(res.body).to.have.property("db")
          done()
        })
    })
  })

  describe("GET /stats", () => {
    it("should return the number of users and files", (done) => {
      chai
        .request(app)
        .get("/stats")
        .end((err, res) => {
          expect(res).to.have.status(200)
          expect(res.body).to.be.an("object")
          expect(res.body).to.have.property("users")
          expect(res.body).to.have.property("files")
          done()
        })
    })
  })
})


