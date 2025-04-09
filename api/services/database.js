const { MongoClient } = require("mongodb");

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017";
// Get database name from environment variables or use default
const dbName = process.env.DB_NAME || "devops_development";

// Log connection info for debugging
const client = new MongoClient(mongoUrl);
const db = client.db(dbName);

module.exports = {
    db: db,
    client: client
};