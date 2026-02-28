const { MongoClient } = require('mongodb');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function checkUser() {
  const uri = process.env.MONGO_DB_URI;
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  
  try {
    await client.connect();
    const db = client.db("talimsoft");
    const user = await db.collection("users").findOne({ role: "super_admin" });
    
    if (user) {
      console.log("Super Admin User found:");
      console.log("Email:", user.email);
      console.log("Username:", user.username);
      console.log("Password Hash:", user.password);
      console.log("Role:", user.role);
    } else {
      console.log("Super Admin User NOT found!");
      const allUsers = await db.collection("users").find().toArray();
      console.log("Total users in DB:", allUsers.length);
      allUsers.forEach(u => console.log(`- ${u.email} (${u.role})`));
    }
  } catch (err) {
    console.error("Check failed:", err);
  } finally {
    await client.close();
  }
}

checkUser();
