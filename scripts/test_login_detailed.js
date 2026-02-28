const axios = require('axios');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:3001/api/auth/v1/login', {
      email: "superadmin@mms.com",
      password: "SuperAdmin123!"
    });
    console.log("Login Success!");
    console.log("Token:", response.data.data.accessToken);
  } catch (err) {
    console.error("Login Failed:");
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", JSON.stringify(err.response.data));
    } else {
      console.error("Message:", err.message);
    }
  }
}

testLogin();
