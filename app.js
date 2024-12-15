const connectToDatabase = require('./utils/db'); // Adjust path if `db.js` is not in `utils`

async function startApp() {
  try {
    const db = await connectToDatabase();
    console.log("Connected to MongoDB successfully!");

    // Example: Access a collection
    const collection = db.collection("exampleCollection"); // Replace with your collection name
    const documents = await collection.find({}).toArray();
    console.log("Documents in collection:", documents);
  } catch (err) {
    console.error("Error in application:", err);
  }
}

startApp();

