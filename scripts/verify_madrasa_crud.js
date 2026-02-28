const axios = require('axios');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

async function verifyCRUD() {
  const baseURL = 'http://localhost:3001/api';
  let token;

  try {
    // 1. Login
    console.log("1. Logging in...");
    const loginRes = await axios.post(`${baseURL}/auth/v1/login`, {
      email: "superadmin@mms.com",
      password: "SuperAdmin123!"
    });
    token = loginRes.data.data.accessToken;
    console.log("Login successful.");

    const headers = { Authorization: `Bearer ${token}` };

    // 2. Create Madrasa
    console.log("\n2. Creating Madrasa...");
    const createRes = await axios.post(`${baseURL}/super-admin/v1/madrasas`, {
      madrasaName: "Test Madrasa",
      address: "123 Test St",
      adminEmail: "testadmin@test.com",
      adminPassword: "Password123!"
    }, { headers });
    const madrasaId = createRes.data.data.madrasaId;
    console.log("Madrasa created:", createRes.data.message, "ID:", madrasaId);

    // 3. List Madrasas
    console.log("\n3. Listing Madrasas...");
    const listRes = await axios.get(`${baseURL}/super-admin/v1/madrasas`, { headers });
    console.log("Madrasas count:", listRes.data.data.length);
    const createdMadrasa = listRes.data.data.find(m => m._id === madrasaId);
    console.log("Created Madrasa found in list:", !!createdMadrasa);

    // 4. Update Madrasa
    console.log("\n4. Updating Madrasa...");
    const updateRes = await axios.put(`${baseURL}/super-admin/v1/madrasas/${madrasaId}`, {
      name: "Updated Test Madrasa",
      status: "Active"
    }, { headers });
    console.log("Update result:", updateRes.data.message);

    // 5. Delete Madrasa
    console.log("\n5. Deleting Madrasa...");
    const deleteRes = await axios.delete(`${baseURL}/super-admin/v1/madrasas/${madrasaId}`, { headers });
    console.log("Delete result:", deleteRes.data.message);

    console.log("\nAll CRUD operations verified successfully!");

  } catch (err) {
    console.error("\nVerification Failed:");
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", JSON.stringify(err.response.data));
    } else {
      console.error("Message:", err.message);
    }
  }
}

verifyCRUD();
