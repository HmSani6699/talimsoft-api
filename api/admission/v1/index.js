const router = require("express").Router();
const root = require("app-root-path");
const { ObjectId } = require("mongodb");
const Joi = require("joi");
const validate = require(`${root}/middleware/validate`);
const authMiddleware = require(`${root}/middleware/authenticate`);
const rbacMiddleware = require(`${root}/middleware/rbacMiddleware`);
const tenantMiddleware = require(`${root}/middleware/tenantMiddleware`);
const authService = require(`${root}/services/auth.service`);

const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);

// Joi Schema for Admission Payload
const admissionSchema = Joi.object({
  academicYear: Joi.string().required(),
  admissionDate: Joi.date().required(),
  position: Joi.string().allow(""),
  guardian: Joi.object({
    fatherName: Joi.string().required(),
    motherName: Joi.string().required(),
    fatherOccupation: Joi.string().allow(""),
    motherOccupation: Joi.string().allow(""),
    contact: Joi.string().required(),
    motherContact: Joi.string().allow(""),
    email: Joi.string().email().allow(""),
    address: Joi.string().required(),
    fatherPhoto: Joi.string().allow(""),
    motherPhoto: Joi.string().allow(""),
    guardianNID: Joi.string().allow("")
  }).required(),
  guardian_id: Joi.string().allow(null, ""),
  students: Joi.array().items(
    Joi.object({
      id: Joi.any(),
      firstName: Joi.string().required(),
      gender: Joi.string().valid("Male", "Female", "Other").required(),
      dateOfBirth: Joi.date().required(),
      bloodGroup: Joi.string().allow(""),
      class_id: Joi.string().required(),
      section_id: Joi.string().allow(""),
      photo: Joi.string().allow(""),
      transport: Joi.object({
        required: Joi.boolean(),
        route: Joi.string().allow("")
      }).optional(),
      hostel: Joi.object({
        required: Joi.boolean(),
        roomType: Joi.string().allow("")
      }).optional(),
      fees: Joi.object().optional(),
      note: Joi.string().allow(""),
      password: Joi.string().allow(""),
      student_id: Joi.string().allow("")
    })
  ).min(1).required()
});

// Create new admission (Transaction: Guardian -> Students)
const createAdmission = async (req, res) => {
  const { db, client } = await mongoConnect();
  const session = client.startSession();
  
  try {
    session.startTransaction();
    
    const payload = req.body;
    const madrasaId = req.user.madrasa_id ? new ObjectId(req.user.madrasa_id) : null;
    let guardianId = null;
    let guardianUserId = null;

    // 1. Check if Guardian exists by guardian_id OR contact number and madrasa_id
    let existingGuardian = null;
    if (payload.guardian_id && ObjectId.isValid(payload.guardian_id)) {
      existingGuardian = await db.collection("parents").findOne({ 
        _id: new ObjectId(payload.guardian_id), 
        madrasa_id: madrasaId 
      }, { session });
    }

    if (!existingGuardian) {
      existingGuardian = await db.collection("parents").findOne({ 
        contact: payload.guardian.contact, 
        madrasa_id: madrasaId 
      }, { session });
    }

    if (existingGuardian) {
      guardianId = existingGuardian._id;
      guardianUserId = existingGuardian.userId;
      
      // Only update existing guardian details if an explicit guardian_id wasn't provided
      // (meaning they were entering new details that happened to match an existing contact)
      if (!payload.guardian_id) {
        await db.collection("parents").updateOne(
          { _id: guardianId },
          { $set: { ...payload.guardian, updated_at: Date.now() } },
          { session }
        );
      }
    } else {
      // Create User for Guardian
      const guardianPassword = await authService.hashPassword(payload.guardian.contact); // Default password = contact
      const guardianUser = await db.collection("users").insertOne({
        username: payload.guardian.contact, // Mobile as username
        email: payload.guardian.email || "", // Optional
        password: guardianPassword,
        role: "parent",
        madrasa_id: madrasaId,
        created_at: Date.now(),
        updated_at: Date.now()
      }, { session });
      
      guardianUserId = guardianUser.insertedId;

      // Create new Guardian Profile
      const guardianData = {
        ...payload.guardian,
        userId: guardianUserId,
        madrasa_id: madrasaId,
        created_at: Date.now(),
        updated_at: Date.now()
      };
      
      const newGuardian = await db.collection("parents").insertOne(guardianData, { session });
      guardianId = newGuardian.insertedId;
      
      // Link user back to profile
      await db.collection("users").updateOne({ _id: guardianUserId }, { $set: { reference_id: guardianId } }, { session });
    }

    // 2. Create Students
    const studentUserUpdates = [];
    const studentDocs = [];

    for (const student of payload.students) {
        // Exclude UI specific fields
        const { id, password, class: className, ...studentData } = student;
        
        // Generate Student User Credentials
        const username = `ST-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const studentPasswordRaw = password || "123456";
        const studentPasswordHash = await authService.hashPassword(studentPasswordRaw);

        const studentUser = await db.collection("users").insertOne({
            username: username,
            password: studentPasswordHash,
            role: "student",
            madrasa_id: madrasaId,
            created_at: Date.now(),
            updated_at: Date.now()
        }, { session });

        const studentDoc = {
            ...studentData,
            userId: studentUser.insertedId,
            guardian_id: guardianId,
            madrasa_id: madrasaId,
            academicYear: payload.academicYear,
            admissionDate: payload.admissionDate,
            admissionStatus: "Active",
            roll_number: student.roll_number || "",
            // Use class_id and section_id from payload if available, else null
            class_id: student.class_id || null,
            section_id: student.section_id || null,
            created_at: Date.now(),
            updated_at: Date.now()
        };
        
        studentDocs.push(studentDoc);
        studentUserUpdates.push({ userId: studentUser.insertedId, username, password: studentPasswordRaw });
    }

    const studentsResult = await db.collection("students").insertMany(studentDocs, { session });
    const studentIds = Object.values(studentsResult.insertedIds);

    // Update Users with reference_ids
    for (let i = 0; i < studentIds.length; i++) {
        await db.collection("users").updateOne(
            { _id: studentUserUpdates[i].userId },
            { $set: { reference_id: studentIds[i] } },
            { session }
        );
    }

    await session.commitTransaction();
    
    res.status(201).json({ 
        success: true, 
        message: "Admission processed successfully",
        data: {
            guardianId: guardianId,
            studentIds: studentIds,
            credentials: studentUserUpdates.map(s => ({ username: s.username, password: s.password }))
        }
    });

  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    console.error("Admission Transaction Error:", error);
    
    // Better handling for RangeError/BSON size issues
    if (error.name === 'RangeError' || error.message.includes('OUT_OF_RANGE') || error.message.includes('BSON')) {
        return res.status(413).json({ 
            success: false, 
            message: "Payload too large. Please reduce the size of photos or the number of students in a single request.",
            details: error.message
        });
    }

    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

// Update existing admission (Update Guardian & specific Student)
const updateAdmission = async (req, res) => {
    const { db, client } = await mongoConnect();
    const session = client.startSession();
    
    try {
        session.startTransaction();
        const payload = req.body;
        const madrasaId = req.user.madrasa_id ? new ObjectId(req.user.madrasa_id) : null;
        const guardianId = payload.guardianId ? new ObjectId(payload.guardianId) : null;

        if (!guardianId) throw new Error("Guardian ID is required for update");

        // 1. Update Guardian
        if (payload.guardian) {
            await db.collection("parents").updateOne(
                { _id: guardianId, madrasa_id: madrasaId },
                { $set: { ...payload.guardian, updated_at: Date.now() } },
                { session }
            );
        }

        // 2. Update Students (Batch update)
        if (payload.students && Array.isArray(payload.students)) {
            for (const student of payload.students) {
                if (student._id) {
                    const { _id, userId, ...updateData } = student;
                    await db.collection("students").updateOne(
                        { _id: new ObjectId(_id), madrasa_id: madrasaId },
                        { $set: { ...updateData, updated_at: Date.now() } },
                        { session }
                    );
                }
            }
        }

        await session.commitTransaction();
        res.status(200).json({ success: true, message: "Admission updated successfully" });
    } catch (error) {
        if (session.inTransaction()) await session.abortTransaction();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        session.endSession();
    }
};

// Get all admissions (Students with Guardian info)
const getAdmissions = async (req, res) => {
    const { db, client } = await mongoConnect();
    try {
        const madrasaId = req.user.madrasa_id ? new ObjectId(req.user.madrasa_id) : null;
        const query = { madrasa_id: madrasaId };

        if (req.query.class_id) query.class_id = req.query.class_id;
        if (req.query.section_id) query.section_id = req.query.section_id;
        if (req.query.academicYear) query.academicYear = req.query.academicYear;

        if (req.query.search) {
            query.$or = [
                { firstName: { $regex: req.query.search, $options: 'i' } },
                { student_id: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const pipeline = [
            { $match: query },
            { $sort: { created_at: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
                $lookup: {
                    from: "parents",
                    localField: "guardian_id",
                    foreignField: "_id",
                    as: "guardian"
                }
            },
            { $unwind: { path: "$guardian", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    classObjectId: { $cond: [{ $and: [{ $ne: ["$class_id", null] }, { $ne: ["$class_id", ""] }] }, { $toObjectId: "$class_id" }, null] }
                }
            },
            {
                $lookup: {
                    from: "classes",
                    localField: "classObjectId",
                    foreignField: "_id",
                    as: "classInfo"
                }
            },
            { $unwind: { path: "$classInfo", preserveNullAndEmptyArrays: true } }
        ];

        const [data, total] = await Promise.all([
            db.collection("students").aggregate(pipeline).toArray(),
            db.collection("students").countDocuments(query)
        ]);

        res.status(200).json({ success: true, data, total });
    } catch (error) {
        console.error("Fetch Admissions Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete Admission (Delete Student, check if guardian should remain)
const deleteAdmission = async (req, res) => {
    const { db, client } = await mongoConnect();
    try {
        const studentId = new ObjectId(req.params.id);
        const madrasaId = req.user.madrasa_id ? new ObjectId(req.user.madrasa_id) : null;

        // Find student to get guardian_id and userId
        const student = await db.collection("students").findOne({ _id: studentId, madrasa_id: madrasaId });
        if (!student) return res.status(404).json({ success: false, message: "Student not found" });

        // Delete student record
        await db.collection("students").deleteOne({ _id: studentId });
        
        // Delete student user
        if (student.userId) {
            await db.collection("users").deleteOne({ _id: student.userId });
        }

        res.status(200).json({ success: true, message: "Admission deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Routes
router.use(authMiddleware);
router.use(tenantMiddleware);

router.get("/admission", rbacMiddleware(['admin']), getAdmissions);
router.post("/admission", rbacMiddleware(['admin']), validate(admissionSchema), createAdmission);
router.put("/admission", rbacMiddleware(['admin']), updateAdmission);
router.delete("/admission/:id", rbacMiddleware(['admin']), deleteAdmission);

module.exports = router;
