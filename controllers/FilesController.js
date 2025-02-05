const { ObjectId } = require("mongodb")
const fs = require("fs").promises
const mime = require("mime-types")
const path = require("path")
const { v4: uuidv4 } = require("uuid")
const Bull = require("bull")
const dbClient = require("../utils/db")
const redisClient = require("../utils/redis")

const fileQueue = new Bull("fileQueue")

class FilesController {
  static async postUpload(req, res) {
    const token = req.header("X-Token")
    if (!token) return res.status(401).json({ error: "Unauthorized" })

    const userId = await redisClient.get(`auth_${token}`)
    if (!userId) return res.status(401).json({ error: "Unauthorized" })

    const { name, type, parentId = 0, isPublic = false, data } = req.body

    if (!name) return res.status(400).json({ error: "Missing name" })
    if (!type || !["folder", "file", "image"].includes(type)) return res.status(400).json({ error: "Missing type" })
    if (!data && type !== "folder") return res.status(400).json({ error: "Missing data" })

    if (parentId !== 0) {
      const parentFile = await dbClient.client
        .db()
        .collection("files")
        .findOne({ _id: ObjectId(parentId) })
      if (!parentFile) return res.status(400).json({ error: "Parent not found" })
      if (parentFile.type !== "folder") return res.status(400).json({ error: "Parent is not a folder" })
    }

    const fileDocument = {
      userId: ObjectId(userId),
      name,
      type,
      isPublic,
      parentId: parentId === 0 ? parentId : ObjectId(parentId),
    }

    if (type === "folder") {
      const result = await dbClient.client.db().collection("files").insertOne(fileDocument)
      return res.status(201).json({ id: result.insertedId, ...fileDocument })
    }

    const folderPath = process.env.FOLDER_PATH || "/tmp/files_manager"
    const fileName = uuidv4()
    const localPath = path.join(folderPath, fileName)

    await fs.mkdir(folderPath, { recursive: true })
    await fs.writeFile(localPath, Buffer.from(data, "base64"))

    fileDocument.localPath = localPath
    const result = await dbClient.client.db().collection("files").insertOne(fileDocument)

    await cleanupOldFiles(folderPath)

    if (type === "image") {
      fileQueue.add({
        userId: userId.toString(),
        fileId: result.insertedId.toString(),
      })
    }

    return res.status(201).json({
      id: result.insertedId.toString(),
      userId: userId,
      name,
      type,
      isPublic,
      parentId,
    })
  }

  static async getShow(req, res) {
    const token = req.header("X-Token")
    if (!token) return res.status(401).json({ error: "Unauthorized" })

    const userId = await redisClient.get(`auth_${token}`)
    if (!userId) return res.status(401).json({ error: "Unauthorized" })

    const fileId = req.params.id
    const file = await dbClient.client
      .db()
      .collection("files")
      .findOne({ _id: ObjectId(fileId), userId: ObjectId(userId) })

    if (!file) return res.status(404).json({ error: "Not found" })

    return res.status(200).json(file)
  }

  static async getIndex(req, res) {
    const token = req.header("X-Token")
    if (!token) return res.status(401).json({ error: "Unauthorized" })

    const userId = await redisClient.get(`auth_${token}`)
    if (!userId) return res.status(401).json({ error: "Unauthorized" })

    const parentId = req.query.parentId || "0"
    const page = Number.parseInt(req.query.page) || 0
    const pageSize = 20

    const query = { userId: ObjectId(userId) }
    if (parentId !== "0") query.parentId = ObjectId(parentId)

    const files = await dbClient.client
      .db()
      .collection("files")
      .find(query)
      .skip(page * pageSize)
      .limit(pageSize)
      .toArray()

    return res.status(200).json(files)
  }

  static async putPublish(req, res) {
    const token = req.header("X-Token")
    if (!token) return res.status(401).json({ error: "Unauthorized" })

    const userId = await redisClient.get(`auth_${token}`)
    if (!userId) return res.status(401).json({ error: "Unauthorized" })

    const fileId = req.params.id
    const file = await dbClient.client
      .db()
      .collection("files")
      .findOne({ _id: ObjectId(fileId), userId: ObjectId(userId) })

    if (!file) return res.status(404).json({ error: "Not found" })

    await dbClient.client
      .db()
      .collection("files")
      .updateOne({ _id: ObjectId(fileId) }, { $set: { isPublic: true } })

    return res.status(200).json({ ...file, isPublic: true })
  }

  static async putUnpublish(req, res) {
    const token = req.header("X-Token")
    if (!token) return res.status(401).json({ error: "Unauthorized" })

    const userId = await redisClient.get(`auth_${token}`)
    if (!userId) return res.status(401).json({ error: "Unauthorized" })

    const fileId = req.params.id
    const file = await dbClient.client
      .db()
      .collection("files")
      .findOne({ _id: ObjectId(fileId), userId: ObjectId(userId) })

    if (!file) return res.status(404).json({ error: "Not found" })

    await dbClient.client
      .db()
      .collection("files")
      .updateOne({ _id: ObjectId(fileId) }, { $set: { isPublic: false } })

    return res.status(200).json({ ...file, isPublic: false })
  }

  static async getFile(req, res) {
    const fileId = req.params.id
    const size = req.query.size

    const file = await dbClient.client
      .db()
      .collection("files")
      .findOne({ _id: ObjectId(fileId) })

    if (!file) return res.status(404).json({ error: "Not found" })

    const token = req.header("X-Token")
    const userId = await redisClient.get(`auth_${token}`)

    if (!file.isPublic && (!userId || userId !== file.userId.toString())) {
      return res.status(404).json({ error: "Not found" })
    }

    if (file.type === "folder") {
      return res.status(400).json({ error: "A folder doesn't have content" })
    }

    let filePath = file.localPath
    if (size) {
      filePath = `${filePath}_${size}`
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Not found" })
    }

    const mimeType = mime.lookup(file.name)
    res.setHeader("Content-Type", mimeType)

    const fileStream = fs.createReadStream(filePath)
    fileStream.pipe(res)
  }
}

async function cleanupOldFiles(folderPath) {
  try {
    const files = await fs.readdir(folderPath)
    const currentTime = Date.now()
    const oneHourAgo = currentTime - 3600000 // 1 hour in milliseconds

    for (const file of files) {
      const filePath = path.join(folderPath, file)
      const stats = await fs.stat(filePath)
      if (stats.mtimeMs < oneHourAgo) {
        await fs.unlink(filePath)
      }
    }
  } catch (error) {
    console.error("Error cleaning up old files:", error)
  }
}

module.exports = FilesController


