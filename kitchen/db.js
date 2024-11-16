const { MongoClient } = require("mongodb");

const mongoUrl = process.env.MONGO_URL;
const dbName = "sdsa";
const collectionName = "orders";

async function connectToMongo() {
  try {
    const client = await MongoClient.connect(mongoUrl, {
      useUnifiedTopology: true,
    });
    console.log(" [*] Successfully connected to MongoDB");
    const db = client.db(dbName);
    const ordersCollection = db.collection(collectionName);
    return { client, ordersCollection };
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    throw err;
  }
}

module.exports = { connectToMongo };
