const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || 27017;
    this.database = process.env.DB_DATABASE || 'files_manager';
    this.url = `mongodb://${this.host}:${this.port}`;
    this.client = new MongoClient(this.url, { useUnifiedTopology: true });
    this.db = null;
  }

  async connect() {
    if (!this.client.topology || !this.client.topology.isConnected()) {
      try {
        await this.client.connect();
        this.db = this.client.db(this.database);
        console.log('MongoDB connected successfully');
      } catch (error) {
        console.error('MongoDB connection error:', error);
      }
    }
  }

  isAlive() {
    return this.client && this.client.topology && this.client.topology.isConnected();
  }

  async usersCollection() {
    if (!this.db) await this.connect();
    return this.db.collection('users');
  }

  async filesCollection() {
    if (!this.db) await this.connect();
    return this.db.collection('files');
  }

  async nbUsers() {
    if (!this.db) await this.connect();
    return this.db.collection('users').countDocuments();
  }

  async nbFiles() {
    if (!this.db) await this.connect();
    return this.db.collection('files').countDocuments();
  }
}

const dbClient = new DBClient();
dbClient.connect(); // Ensure connection starts on initialization
module.exports = dbClient;

