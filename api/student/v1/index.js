const router = require("express").Router();
const root = require("app-root-path");
const { ObjectId } = require("mongodb");
const Joi = require("joi");
const validate = require(`${root}/middleware/validate`);

const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);

// Joi Schema for Student
const studentSchema = Joi.object({
  firstName: Joi.string().required(),
  gender: Joi.string().valid("Male", "Female", "Other").required(),
  dateOfBirth: Joi.date().required(),
  bloodGroup: Joi.string().allow(""),
  
  // Relations
  guardian_id: Joi.string().required(),
  class_id: Joi.string().required(),
  section_id: Joi.string().allow(null, ""), // Optional initially
  roll_number: Joi.string().allow(""), // Can be auto-assigned
  
  // Details
  photo: Joi.string().allow(null, ""),
  academicYear: Joi.string().required(),
  admissionDate: Joi.date().required(),
  admissionStatus: Joi.string().default("Active"),
  
  // Modules
  transport: Joi.object({
    required: Joi.boolean(),
    route: Joi.string().allow("")
  }).optional(),
  hostel: Joi.object({
    required: Joi.boolean(),
    roomType: Joi.string().allow("")
  }).optional(),
  fees: Joi.object().optional(),
  
  note: Joi.string().allow("")
});

// Update Schema (some fields might be optional)
const studentUpdateSchema = studentSchema.fork(
    ['guardian_id', 'academicYear', 'admissionDate'], 
    (schema) => schema.optional()
);


// Get all students with comprehensive filters
const getAllStudents = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const query = {};
    
    // Exact match filters
    if (req.query.class_id) query.class_id = req.query.class_id;
    if (req.query.section_id) query.section_id = req.query.section_id;
    if (req.query.parent_id) query.guardian_id = new ObjectId(req.query.parent_id); // Support both naming conventions if needed, but schema uses guardian_id
    if (req.query.guardian_id) query.guardian_id = new ObjectId(req.query.guardian_id);
    if (req.query.status) query.admissionStatus = req.query.status;
    if (req.query.academicYear) query.academicYear = req.query.academicYear;

    // Search filter
    if (req.query.search) {
      query.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { roll_number: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 0;
    
    const students = await mongo.fetchMany(db, "students", query, {}, { roll_number: 1 }, limit, page);
    const total = await mongo.documentCount(db, "students", query);
    
    // Optional: Populate class/section names if needed for list view, 
    // but usually efficient to do on frontend or separate aggregation if list is huge.
    // For now, returning raw data.
    
    res.status(200).json({ success: true, data: students, total });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Get single student by ID with populated details
const getStudentById = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const student = await mongo.fetchOne(db, "students", { _id: req.params.id });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    
    // Fetch related data
    if (student.guardian_id) {
      const parent = await mongo.fetchOne(db, "parents", { _id: student.guardian_id });
      student.guardian = parent;
    }
    if (student.class_id) {
      const classInfo = await mongo.fetchOne(db, "classes", { _id: student.class_id });
      student.class = classInfo;
    }
    if (student.section_id) {
      const section = await mongo.fetchOne(db, "sections", { _id: student.section_id });
      student.section = section;
    }
    
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Create new student (Standalone, usually done via Admission but handy for testing/admin)
const createStudent = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const studentData = {
      ...req.body,
      guardian_id: new ObjectId(req.body.guardian_id), // Ensure ObjectId
      created_at: Date.now(),
      updated_at: Date.now()
    };
    
    const student = await mongo.insertOne(db, "students", studentData);
    res.status(201).json({ success: true, data: student });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Update student
const updateStudent = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const payload = { ...req.body };
    payload.updated_at = Date.now();
    
    // Convert IDs if present
    if(payload.guardian_id) payload.guardian_id = new ObjectId(payload.guardian_id);
    if(payload.class_id) payload.class_id = payload.class_id; // Keep string or ObjectId depending on class implementation
    if(payload.section_id) payload.section_id = payload.section_id;

    const result = await mongo.updateData(
      db,
      "students",
      { _id: req.params.id },
      { $set: payload }
    );
    
    if (!result) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    
    res.status(200).json({ success: true, message: "Student updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Delete student
const deleteStudent = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const result = await mongo.deleteData(db, "students", { _id: req.params.id });
    
    if (!result) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    
    res.status(200).json({ success: true, message: "Student deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Routes
router.get("/students", getAllStudents);
router.get("/students/:id", getStudentById);
router.post("/students", validate(studentSchema), createStudent);
router.put("/students/:id", validate(studentUpdateSchema), updateStudent);
router.delete("/students/:id", deleteStudent);

module.exports = router;
