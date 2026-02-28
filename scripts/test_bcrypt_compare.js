const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testBcrypt() {
  const uri = process.env.MONGO_DB_URI;
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  
  try {
    await client.connect();
    const db = client.db("talimsoft");
    const user = await db.collection("users").findOne({ role: "super_admin" });
    
    if (!user) {
      console.log("User not found");
      return;
    }

    const testPasswords = ["SuperAdmin123!", "SuperAdmin123", "Admin123!", "admin123"];
    
    for (const pw of testPasswords) {
      const match = await bcrypt.compare(pw, user.password);
      console.log(`Password: "${pw}" -> Match: ${match}`);
    }

  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    await client.close();
  }
}

testBcrypt();
