// utils/db.js
import { MongoClient } from 'mongodb';

class DBClient {
    constructor() {
        // Set default values if environment variables are not defined
        const host = process.env.DB_HOST || 'localhost';
        const port = process.env.DB_PORT || 27017;
        const database = process.env.DB_DATABASE || 'files_manager';
        
        // Create a MongoDB client
        this.client = new MongoClient(`mongodb://${host}:${port}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Set the database
        this.db = this.client.db(database);
    }

    // Check if the connection to MongoDB is alive
    isAlive() {
        return this.client.isConnected();
    }

    // Get the number of users in the 'users' collection
    async nbUsers() {
        const collection = this.db.collection('users');
        const count = await collection.countDocuments();
        return count;
    }

    // Get the number of files in the 'files' collection
    async nbFiles() {
        const collection = this.db.collection('files');
        const count = await collection.countDocuments();
        return count;
    }
}

// Create and export an instance of DBClient
const dbClient = new DBClient();
export default dbClient;

