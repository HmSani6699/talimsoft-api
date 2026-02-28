const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';
let SUPER_ADMIN_TOKEN = '';
let ADMIN_TOKEN = '';
let MADRASA_ID = '';

// Helper to log steps
const log = (msg) => console.log(`[TEST] ${msg}`);
const logError = (msg, err) => console.error(`[FAIL] ${msg}`, err.response ? err.response.data : err.message);

async function runTests() {
    try {
        log("Starting Verification Tests...");

        // 1. Setup Super Admin
        const superAdminEmail = `superadmin_${Date.now()}@test.com`;
        const superAdminPassword = 'password123';
        
        log(`1. Creating Super Admin (${superAdminEmail})...`);
        try {
            await axios.post(`${BASE_URL}/auth/v1/setup/create-super-admin`, {
                email: superAdminEmail,
                password: superAdminPassword
            });
            log("   - Super Admin Created");
        } catch (e) {
            if (e.response && e.response.status === 403) {
                log("   - Super Admin already exists (Expected if re-running)");
            } else {
                throw e;
            }
        }

        // 2. Login Super Admin
        log("2. Logging in as Super Admin...");
        const loginRes = await axios.post(`${BASE_URL}/auth/v1/login`, {
            email: superAdminEmail, // Note: If user already existed, this might fail if we don't know the creds. 
                                    // For this test script to be robust on re-runs, we'd need known static creds or cleanup.
                                    // For now, we assume fresh run or we just created it.
            password: superAdminPassword
        });
        SUPER_ADMIN_TOKEN = loginRes.data.data.accessToken;
        log("   - Logged in. Token received.");

        // 3. Create Madrasa & Admin
        const adminEmail = `admin_${Date.now()}@madrasa.com`;
        log(`3. Creating Madrasa & Admin (${adminEmail})...`);
        const madrasaRes = await axios.post(`${BASE_URL}/super-admin/v1/madrasas`, {
            madrasaName: "Test Madrasa " + Date.now(),
            address: "123 Test St",
            adminName: "Test Admin",
            adminEmail: adminEmail,
            adminPassword: "adminPassword123"
        }, {
            headers: { Authorization: `Bearer ${SUPER_ADMIN_TOKEN}` }
        });
        MADRASA_ID = madrasaRes.data.data.madrasaId;
        log(`   - Madrasa Created: ${MADRASA_ID}`);

        // 4. Login as Madrasa Admin
        log("4. Logging in as Madrasa Admin...");
        const adminLoginRes = await axios.post(`${BASE_URL}/auth/v1/login`, {
            email: adminEmail,
            password: "adminPassword123"
        });
        ADMIN_TOKEN = adminLoginRes.data.data.accessToken;
        log("   - Admin Logged in.");

        // 5. Create Staff
        log("5. Creating Staff...");
        const staffRes = await axios.post(`${BASE_URL}/v1/staff`, {
            role: "teacher",
            name: "Test Teacher",
            gender: "Male",
            phone: "01700000000",
            email: `teacher_${Date.now()}@test.com`,
            password: "password123",
            designation: "Assistant Teacher",
            department: "General",
            joinDate: "2023-01-01",
            address: "Test Address",
            paymentMethod: "None"
        }, {
            headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
        });
        log("   - Staff Created.");

        // 6. Admit Student
        log("6. Admitting Student...");
        const admissionRes = await axios.post(`${BASE_URL}/v1/admission`, {
            academicYear: "2025",
            admissionDate: "2025-01-01",
            guardian: {
                fatherName: "Test Father",
                motherName: "Test Mother",
                contact: "01900000000", // Will be username
                address: "Test Address"
            },
            students: [
                {
                    firstName: "Test Student",
                    gender: "Male",
                    dateOfBirth: "2010-01-01",
                    class: "Class 5",
                    password: "studentPass123"
                }
            ]
        }, {
            headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
        });
        log("   - Student Admitted.");
        log(`   - Student Credentials: ${JSON.stringify(admissionRes.data.data.credentials)}`);

        // 7. Login as Student
        log("7. Verifying Student Login...");
        const studentCreds = admissionRes.data.data.credentials[0];
        await axios.post(`${BASE_URL}/auth/v1/login`, {
            username: studentCreds.username,
            password: studentCreds.password
        });
        log("   - Student Login Successful.");

        log("✅ ALL TESTS PASSED SUCCESSFULLY");

    } catch (error) {
        logError("Test Failed", error);
        process.exit(1);
    }
}

runTests();
