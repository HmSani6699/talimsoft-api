const { MongoClient } = require('mongodb');

async function testConnection() {
  const uri = "mongodb://talimsoft:talimsoft@cluster0.lhadmfx.mongodb.net:27017/talimsoft?ssl=true&authSource=admin&retryWrites=true&w=majority";
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  
  try {
    console.log("Connecting with direct URI...");
    await client.connect();
    console.log("Connected successfully!");
    const db = client.db("talimsoft");
    const userCount = await db.collection("users").countDocuments();
    console.log(`User count: ${userCount}`);
  } catch (err) {
    console.error("Connection failed:", err);
  } finally {
    await client.close();
  }
}

testConnection();
