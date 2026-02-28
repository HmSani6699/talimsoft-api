const { MongoClient } = require("mongodb");
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const root = require("app-root-path");
const { generateMongoDbUri } = require(`${root}/services/mongo-uri`);

const mongoDbUri = generateMongoDbUri();
const mongoOptions = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
};

let cachedClient = null;
let cachedDb = null;

const getMongoConnection = async () => {
    try {
        if (cachedClient) {
            try {
                // Quick check to see if the connection is still alive
                await cachedClient.db().admin().ping();
                return { client: cachedClient, db: cachedDb };
            } catch (pingError) {
                console.log("[INFO] Cached MongoDB connection lost, reconnecting...");
                cachedClient = null;
                cachedDb = null;
            }
        }

        console.log("[INFO] Establishing new MongoDB connection...");
        const client = new MongoClient(mongoDbUri, mongoOptions);
        await client.connect();
        
        const dbName = process.env.MONGO_DB || 'talimsoft';
        const db = client.db(dbName);
        
        // Protect the client from being closed by downstream handlers
        const originalClose = client.close.bind(client);
        client.close = async (force) => {
            if (force === "FORCE_SHUTDOWN") {
                console.log("[INFO] Forcefully closing MongoDB connection pool...");
                return await originalClose();
            }
            // console.warn("[WARN] Attempt to close shared MongoDB connection ignored.");
            return Promise.resolve();
        };

        cachedClient = client;
        cachedDb = db;

        console.log(`[SUCCESS] Connected to MongoDB database: ${dbName}`);
        return ({ client, db });
    } catch (error) {
        console.error("[ERROR] Failed to connect to MongoDB:", error.message);
        throw error;
    }
}

module.exports = getMongoConnection;