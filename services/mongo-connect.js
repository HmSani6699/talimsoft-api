const { MongoClient, ServerApiVersion } = require("mongodb");
const axios = require("axios");

const mongoDbUri = process.env.MONGO_DB_URI;
const mongoOptions = {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
};

const getMongoConnection = async () => {
    try {
        const dbName = process.env.MONGO_DB ;
        const client = new MongoClient(mongoDbUri, mongoOptions);
        await client.connect();
        const db = client.db(dbName);
        return ({ client, db })
    } catch (error) {
        console.log(error)
    }
}
module.exports = getMongoConnection;