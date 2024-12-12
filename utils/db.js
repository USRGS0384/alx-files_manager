// utils/db.js

import pkg from 'mongodb';
const { MongoClient } = pkg;
import dotenv from 'dotenv';

dotenv.config();

class DBClient {
    constructor() {
        const host = process.env.DB_HOST || 'localhost';
        const port = process.env.DB_PORT || 27017;
        const database = process.env.DB_DATABASE || 'files_manager';
        const url = `mongodb://${host}:${port}/${database}`;

        this.client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

        this.client.connect((err) => {
            if (err) {
                console.error('MongoDB client not connected to the server:', err);
            } else {
                console.log('MongoDB client connected to the server');
                this.db = this.client.db(database);
            }
        });
    }

    isAlive() {
        return this.client && this.client.topology && this.client.topology.isConnected();
    }

    async nbUsers() {
        const usersCollection = this.db.collection('users');
        const count = await usersCollection.countDocuments();
        return count;
    }

    async nbFiles() {
        const filesCollection = this.db.collection('files');
        const count = await filesCollection.countDocuments();
        return count;
    }
}

const dbClient = new DBClient();
export default dbClient;

