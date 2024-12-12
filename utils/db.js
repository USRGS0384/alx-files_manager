// utils/db.js

import { MongoClient } from 'mongodb';

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${DB_HOST}:${DB_PORT}`;

class DBClient {
  constructor() {
    MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
      if (!err) {
        // Connection was successful
        this.db = client.db(DB_DATABASE);
        this.usersCollection = this.db.collection('users');
        this.filesCollection = this.db.collection('files');
      } else {
        console.log(err.message);
        this.db = false;
      }
    });
  }

  // Checks if the connection to MongoDB is alive
  isAlive() {
    return Boolean(this.db);
  }

  // Returns the number of documents in the collection users
  async nbUsers() {
    if (this.isAlive()) {
      return this.usersCollection.countDocuments();
    }
    return 0;
  }

  // Returns the number of documents in the collection files
  async nbFiles() {
    if (this.isAlive()) {
      return this.filesCollection.countDocuments();
    }
    return 0;
  }
}

const dbClient = new DBClient();
export default dbClient;

