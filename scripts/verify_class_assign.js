const axios = require('axios');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

async function verifyClassAssign() {
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

    // 2. Preparation: Create a Class, a Section, and some Subjects
    console.log("\n2. Preparing test data...");
    
    // Create Class
    const classRes = await axios.post(`${baseURL}/v1/classes`, {
      name: "Verification Class",
      tuitionFee: 1000
    }, { headers });
    const classId = classRes.data.data._id;
    console.log("Class created ID:", classId);

    // Create Subject
    const subRes = await axios.post(`${baseURL}/v1/subjects`, {
      name: "Verification Subject",
      code: "VER-101"
    }, { headers });
    const subjectId = subRes.data.data._id;
    console.log("Subject created ID:", subjectId);

    // Create Section
    const secRes = await axios.post(`${baseURL}/v1/sections`, {
      name: "Sec A",
      class_id: classId
    }, { headers });
    const sectionId = secRes.data.data._id;
    console.log("Section created ID:", sectionId);

    // 3. Test Assignment to Section
    console.log("\n3. Testing assignment to Section...");
    const assignSecRes = await axios.post(`${baseURL}/v1/class-assign`, {
      sectionIds: [sectionId],
      subjectIds: [subjectId]
    }, { headers });
    console.log("Section Assignment result:", assignSecRes.data.message);

    // Verify Section has subjects
    const checkSecRes = await axios.get(`${baseURL}/v1/sections/${sectionId}`, { headers });
    console.log("Section subjects length:", checkSecRes.data.data.subjects?.length || 0);

    // 4. Test Assignment to Class (no sections)
    console.log("\n4. Testing assignment to Class directly...");
    const assignClsRes = await axios.post(`${baseURL}/v1/class-assign`, {
      classId: classId,
      subjectIds: [subjectId]
    }, { headers });
    console.log("Class Assignment result:", assignClsRes.data.message);

    // Verify Class has subjects
    const checkClsRes = await axios.get(`${baseURL}/v1/classes/${classId}`, { headers });
    console.log("Class subjects length:", checkClsRes.data.data.subjects?.length || 0);

    console.log("\nAll Backend CRUD verification completed successfully!");

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

verifyClassAssign();
