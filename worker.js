const Bull = require("bull")
const imageThumbnail = require("image-thumbnail")
const { ObjectId } = require("mongodb")
const fs = require("fs").promises
const dbClient = require("./utils/db")

const fileQueue = new Bull("fileQueue")
const userQueue = new Bull("userQueue")

fileQueue.process(async (job) => {
  const { fileId, userId } = job.data
  if (!fileId) throw new Error("Missing fileId")
  if (!userId) throw new Error("Missing userId")

  const file = await dbClient.client
    .db()
    .collection("files")
    .findOne({ _id: ObjectId(fileId), userId: ObjectId(userId) })
  if (!file) throw new Error("File not found")

  const sizes = [500, 250, 100]
  for (const size of sizes) {
    const thumbnail = await imageThumbnail(file.localPath, { width: size })
    const thumbnailName = `${file.localPath}_${size}`
    await fs.writeFile(thumbnailName, thumbnail)
  }
})

userQueue.process(async (job) => {
  const { userId } = job.data
  if (!userId) throw new Error("Missing userId")

  const user = await dbClient.client
    .db()
    .collection("users")
    .findOne({ _id: ObjectId(userId) })
  if (!user) throw new Error("User not found")

  console.log(`Welcome ${user.email}!`)
})

module.exports = {
  fileQueue,
  userQueue,
}


