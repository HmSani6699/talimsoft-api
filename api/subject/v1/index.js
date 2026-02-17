const router = require("express").Router();
const root = require("app-root-path");
const Joi = require("joi");
const validate = require(`${root}/middleware/validate`);

const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);

// Joi Schema for Subject
const subjectSchema = Joi.object({
  name: Joi.string().required(),
  code: Joi.string().required(),
  type: Joi.string().valid("Theory", "Practical", "Both").default("Theory"),
  class_id: Joi.string().required(), // Subjects usually belong to a class or department
  teacher_id: Joi.string().allow(null, ""),
  fullMarks: Joi.number().default(100),
  passMarks: Joi.number().default(33)
});

// Get all subjects
const getAllSubjects = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const query = {};
    if (req.query.class_id) query.class_id = req.query.class_id;
    if (req.query.type) query.type = req.query.type; 
    
    const subjects = await mongo.fetchMany(db, "subjects", query, {}, { name: 1 });
    const total = await mongo.documentCount(db, "subjects", query);
    res.status(200).json({ success: true, data: subjects, total });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Get single subject by ID
const getSubjectById = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const subject = await mongo.fetchOne(db, "subjects", { _id: req.params.id });
    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }
    
    // Optional: Populate Class info
    if (subject.class_id) {
       const classInfo = await mongo.fetchOne(db, "classes", { _id: subject.class_id });
       subject.class = classInfo; 
    }

    res.status(200).json({ success: true, data: subject });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Create new subject
const createSubject = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const subjectData = {
      ...req.body,
      created_at: Date.now(),
      updated_at: Date.now()
    };
    
    const subject = await mongo.insertOne(db, "subjects", subjectData);
    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Update subject
const updateSubject = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const result = await mongo.updateData(
      db,
      "subjects",
      { _id: req.params.id },
      {
        $set: {
          ...req.body,
          updated_at: Date.now()
        }
      }
    );
    
    if (!result) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }
    
    res.status(200).json({ success: true, message: "Subject updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Delete subject
const deleteSubject = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const result = await mongo.deleteData(db, "subjects", { _id: req.params.id });
    
    if (!result) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }
    
    res.status(200).json({ success: true, message: "Subject deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Routes
router.get("/subjects", getAllSubjects);
router.get("/subjects/:id", getSubjectById);
router.post("/subjects", validate(subjectSchema), createSubject);
router.put("/subjects/:id", validate(subjectSchema), updateSubject);
router.delete("/subjects/:id", deleteSubject);

module.exports = router;
