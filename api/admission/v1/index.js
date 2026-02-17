const router = require("express").Router();
const root = require("app-root-path");
const { ObjectId } = require("mongodb");
const Joi = require("joi");
const validate = require(`${root}/middleware/validate`);

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
  students: Joi.array().items(
    Joi.object({
      id: Joi.any(),
      firstName: Joi.string().required(),
      gender: Joi.string().valid("Male", "Female", "Other").required(),
      dateOfBirth: Joi.date().required(),
      bloodGroup: Joi.string().allow(""),
      class: Joi.string().required(),
      section: Joi.string().allow(""),
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
      password: Joi.string().allow("")
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
    let guardianId = null;

    // 1. Check if Guardian exists by contact number
    const existingGuardian = await db.collection("parents").findOne({ contact: payload.guardian.contact }, { session });

    if (existingGuardian) {
      guardianId = existingGuardian._id;
      // Option: Update existing guardian details if needed, for now we skip
    } else {
      // Create new Guardian
      const guardianData = {
        ...payload.guardian,
        created_at: Date.now(),
        updated_at: Date.now()
      };
      
      const newGuardian = await db.collection("parents").insertOne(guardianData, { session });
      guardianId = newGuardian.insertedId;
    }

    // 2. Create Students
    const studentDocs = payload.students.map(student => {
        // Exclude UI specific fields like 'id' (timestamp from frontend)
        const { id, ...studentData } = student;
        
        return {
            ...studentData,
            guardian_id: guardianId,
            academicYear: payload.academicYear,
            admissionDate: payload.admissionDate,
            admissionStatus: "Active",
            roll_number: "", // To be assigned later or auto-generated
            class_id: null, // Placeholder pending class/section ID resolution logic if needed
            section_id: null,
            created_at: Date.now(),
            updated_at: Date.now()
        };
    });

    const studentsResult = await db.collection("students").insertMany(studentDocs, { session });

    await session.commitTransaction();
    
    res.status(201).json({ 
        success: true, 
        message: "Admission processed successfully",
        data: {
            guardianId: guardianId,
            studentIds: studentsResult.insertedIds
        }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("Admission Transaction Error:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
    await client.close();
  }
};

// Route
router.post("/admission", validate(admissionSchema), createAdmission);

module.exports = router;
