const dotenv = require("dotenv");
dotenv.config();
const getMongoConnection = require("../services/mongo-connect");

async function addIndices() {
    let client;
    try {
        const connection = await getMongoConnection();
        const db = connection.db;
        client = connection.client;

        console.log("Adding indices to 'students'...");
        await db.collection('students').createIndex({ madrasa_id: 1 });
        await db.collection('students').createIndex({ class_id: 1 });
        await db.collection('students').createIndex({ section_id: 1 });
        await db.collection('students').createIndex({ roll_number: 1 });
        await db.collection('students').createIndex({ created_at: -1 });

        console.log("Adding indices to 'parents'...");
        await db.collection('parents').createIndex({ madrasa_id: 1 });
        await db.collection('parents').createIndex({ contact: 1 });

        console.log("Adding indices to 'users'...");
        await db.collection('users').createIndex({ username: 1 }, { unique: true });
        await db.collection('users').createIndex({ reference_id: 1 });

        console.log("Adding indices to 'attendance'...");
        await db.collection('attendance').createIndex({ student_id: 1, type: 1 });

        console.log("Adding indices to 'academic_reports'...");
        await db.collection('academic_reports').createIndex({ student_id: 1 });

        console.log("Adding indices to 'transactions'...");
        await db.collection('transactions').createIndex({ student_id: 1 });
        await db.collection('transactions').createIndex({ reference_id: 1 });
        await db.collection('transactions').createIndex({ category: 1 });

        console.log("[SUCCESS] Indices added successfully.");
        process.exit(0);
    } catch (error) {
        console.error("[ERROR] Failed to add indices:", error);
        process.exit(1);
    }
}

addIndices();
