const router = require("express").Router();
const root = require("app-root-path");
const Joi = require("joi");
const validate = require(`${root}/middleware/validate`);

const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);

// Joi Schema for Class
const classSchema = Joi.object({
  name: Joi.string().required(),
  tuitionFee: Joi.number().allow(null, 0),
  classTeacher_id: Joi.string().allow(null, ""), // ObjectId as string
  status: Joi.string().default("Active"),
  description: Joi.string().allow("")
});

// Get all classes
const getAllClasses = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const classes = await mongo.fetchMany(db, "classes", {}, {}, { name: 1 });
    const total = await mongo.documentCount(db, "classes");
    res.status(200).json({ success: true, data: classes, total });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Get single class by ID
const getClassById = async (req, res) => {
  console.log(`[GET] /classes/${req.params.id} hit`);
  const { db, client } = await mongoConnect();
  try {
    const classData = await mongo.fetchOne(db, "classes", { _id: req.params.id });
    if (!classData) {
      return res.status(404).json({ success: false, message: "Class not found" });
    }
    
    // Get sections for this class
    const sections = await mongo.fetchMany(db, "sections", { class_id: req.params.id });
    classData.sections = sections;
    
    res.status(200).json({ success: true, data: classData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Create new class
const createClass = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const classData = {
      ...req.body,
      created_at: Date.now(),
      updated_at: Date.now()
    };
    
    const newClass = await mongo.insertOne(db, "classes", classData);
    res.status(201).json({ success: true, data: newClass });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Update class
const updateClass = async (req, res) => {
  console.log(`[PUT] /classes/${req.params.id} hit`);
  const { db, client } = await mongoConnect();
  try {
    const result = await mongo.updateData(
      db,
      "classes",
      { _id: req.params.id },
      {
        $set: {
          ...req.body,
          updated_at: Date.now()
        }
      }
    );
    
    if (!result) {
      return res.status(404).json({ success: false, message: "Class not found" });
    }
    
    res.status(200).json({ success: true, message: "Class updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Delete class
const deleteClass = async (req, res) => {
  console.log(`[DELETE] /classes/${req.params.id} hit`);
  const { db, client } = await mongoConnect();
  try {
    const result = await mongo.deleteData(db, "classes", { _id: req.params.id });
    
    if (!result) {
      return res.status(404).json({ success: false, message: "Class not found" });
    }
    
    res.status(200).json({ success: true, message: "Class deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Routes
router.get("/classes", getAllClasses);
router.get("/classes/:id", getClassById);
router.post("/classes", validate(classSchema), createClass);
router.put("/classes/:id", validate(classSchema), updateClass);
router.delete("/classes/:id", deleteClass);

module.exports = router;
