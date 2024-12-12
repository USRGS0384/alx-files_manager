// controllers/FilesController.js

import pkg from 'mongodb';
const { ObjectId } = pkg;
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';

class FilesController {
    static async postUpload(req, res) {
        const token = req.headers['x-token'];
        if (!token) return res.status(401).json({ error: 'Unauthorized' });

        const userId = await redisClient.get(`auth_${token}`);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { name, type, parentId = 0, isPublic = false, data } = req.body;

        if (!name) return res.status(400).json({ error: 'Missing name' });
        if (!type || !['folder', 'file', 'image'].includes(type)) return res.status(400).json({ error: 'Missing type' });
        if (type !== 'folder' && !data) return res.status(400).json({ error: 'Missing data' });

        const parentFile = parentId ? await dbClient.db.collection('files').findOne({ _id: new ObjectId(parentId) }) : null;
        if (parentId && (!parentFile || parentFile.type !== 'folder')) {
            return res.status(400).json({ error: 'Parent not found or not a folder' });
        }

        const fileData = {
            userId: new ObjectId(userId),
            name,
            type,
            isPublic,
            parentId: parentId === 0 ? 0 : new ObjectId(parentId),
        };

        if (type === 'folder') {
            const result = await dbClient.db.collection('files').insertOne(fileData);
            return res.status(201).json({
                id: result.insertedId,
                userId: fileData.userId,
                name: fileData.name,
                type: fileData.type,
                isPublic: fileData.isPublic,
                parentId: fileData.parentId,
            });
        }

        const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
        if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

        const localPath = path.join(folderPath, uuidv4());
        fs.writeFileSync(localPath, Buffer.from(data, 'base64'));

        fileData.localPath = localPath;

        const result = await dbClient.db.collection('files').insertOne(fileData);
        return res.status(201).json({
            id: result.insertedId,
            userId: fileData.userId,
            name: fileData.name,
            type: fileData.type,
            isPublic: fileData.isPublic,
            parentId: fileData.parentId,
            localPath: fileData.localPath,
        });
    }
}

export default FilesController;

