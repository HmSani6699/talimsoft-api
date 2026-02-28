const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testFixedConnection() {
  const uri = process.env.MONGO_DB_URI;
  console.log("Connecting to:", uri.replace(/:([^:@]+)@/, ":****@"));
  
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  
  try {
    await client.connect();
    console.log("Connected successfully with DNS override!");
    const db = client.db("talimsoft");
    const userCount = await db.collection("users").countDocuments();
    console.log(`User count: ${userCount}`);
  } catch (err) {
    console.error("Connection failed even with DNS override:", err);
  } finally {
    await client.close();
  }
}

testFixedConnection();
