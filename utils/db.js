// utils/db.js
import { MongoClient } from 'mongodb';

class DBClient {
    constructor() {
        this.client = new MongoClient(`mongodb://${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 27017}`);
        this.db = null;
    }

    async connect() {
        if (!this.db) {
            await this.client.connect();
            this.db = this.client.db(process.env.DB_DATABASE || 'files_manager');
        }
        return this.db;
    }

    async isAlive() {
        try {
            const db = await this.connect();
            const ping = await db.command({ ping: 1 });
            return ping.ok === 1;
        } catch (err) {
            return false;
        }
    }

    async nbUsers() {
        const db = await this.connect();
        const usersCollection = db.collection('users');
        return usersCollection.countDocuments();
    }

    async nbFiles() {
        const db = await this.connect();
        const filesCollection = db.collection('files');
        return filesCollection.countDocuments();
    }
}

// Create an instance and export it
const dbClient = new DBClient();
export default dbClient;

