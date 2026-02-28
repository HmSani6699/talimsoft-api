const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function verifyCredentials() {
  const uri = process.env.MONGO_DB_URI;
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  
  try {
    await client.connect();
    const db = client.db("talimsoft");
    const user = await db.collection("users").findOne({ role: "super_admin" });
    
    if (user) {
      console.log("Super Admin found!");
      console.log("Email:", user.email);
    } else {
      console.log("Super Admin NOT found!");
    }
  } catch (err) {
    console.error("Verification failed:", err);
  } finally {
    await client.close();
  }
}

verifyCredentials();
