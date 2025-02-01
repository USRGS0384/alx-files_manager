const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}`;

    this.client = new MongoClient(url, { useUnifiedTopology: true });

    this.client.connect((err) => {
      if (err) {
        console.error('MongoDB connection error:', err);
      } else {
        this.db = this.client.db(database);
        console.log('MongoDB connected successfully');
      }
    });
  }

  isAlive() {
    return !!this.client && !!this.client.topology && this.client.topology.isConnected();
  }

  async nbUsers() {
    if (!this.db) return 0;
    return this.db.collection('users').countDocuments(); // Ensure correct collection name
  }

  async nbFiles() {
    if (!this.db) return 0;
    return this.db.collection('files').countDocuments(); // Ensure correct collection name
  }
}

const dbClient = new DBClient();
module.exports = dbClient;

