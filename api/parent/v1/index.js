const router = require("express").Router();
const root = require("app-root-path");
const { ObjectId } = require("mongodb");
const Joi = require("joi");
const validate = require(`${root}/middleware/validate`);

const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);

// Joi Schema for Parent (Guardian)
const parentSchema = Joi.object({
  fatherName: Joi.string().required(),
  motherName: Joi.string().required(),
  fatherOccupation: Joi.string().allow(""),
  motherOccupation: Joi.string().allow(""),
  contact: Joi.string().required(),
  motherContact: Joi.string().allow(""),
  email: Joi.string().email().allow(""),
  address: Joi.string().required(),
  
  // Documents / Photos
  fatherPhoto: Joi.string().allow(""),
  motherPhoto: Joi.string().allow(""),
  guardianNID: Joi.string().allow("")
});

// Update Schema (all optional)
const parentUpdateSchema = parentSchema.fork(
    Object.keys(parentSchema.describe().keys),
    (schema) => schema.optional()
);


// Get all parents with search
const getAllParents = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const query = {};
    if (req.query.search) {
      query.$or = [
        { fatherName: { $regex: req.query.search, $options: 'i' } },
        { motherName: { $regex: req.query.search, $options: 'i' } },
        { contact: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 0;
    
    const parents = await mongo.fetchMany(db, "parents", query, {}, { created_at: -1 }, limit, page);
    const total = await mongo.documentCount(db, "parents", query);
    
    res.status(200).json({ success: true, data: parents, total });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Get single parent by ID
const getParentById = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const parent = await mongo.fetchOne(db, "parents", { _id: req.params.id });
    if (!parent) {
      return res.status(404).json({ success: false, message: "Parent not found" });
    }
    res.status(200).json({ success: true, data: parent });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Get parent's children
const getParentStudents = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    // using guardian_id as per student schema
    const students = await mongo.fetchMany(db, "students", { guardian_id: new ObjectId(req.params.id) });
    res.status(200).json({ success: true, data: students });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Create new parent
const createParent = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    // Check for duplicate contact
    const existing = await mongo.fetchOne(db, "parents", { contact: req.body.contact });
    if (existing) {
        return res.status(409).json({ success: false, message: "Guardian with this contact already exists" });
    }

    const parentData = {
      ...req.body,
      created_at: Date.now(),
      updated_at: Date.now()
    };
    
    const parent = await mongo.insertOne(db, "parents", parentData);
    res.status(201).json({ success: true, data: parent });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Update parent
const updateParent = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const payload = { ...req.body };
    payload.updated_at = Date.now();

    const result = await mongo.updateData(
      db,
      "parents",
      { _id: req.params.id },
      { $set: payload }
    );
    
    if (!result) {
      return res.status(404).json({ success: false, message: "Parent not found" });
    }
    
    res.status(200).json({ success: true, message: "Parent updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Delete parent
const deleteParent = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    // Optional: Check if parent has students before deleting?
    // For now, allow delete.
    
    const result = await mongo.deleteData(db, "parents", { _id: req.params.id });
    
    if (!result) {
      return res.status(404).json({ success: false, message: "Parent not found" });
    }
    
    res.status(200).json({ success: true, message: "Parent deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Routes
router.get("/parents", getAllParents);
router.get("/parents/:id", getParentById);
router.get("/parents/:id/students", getParentStudents);
router.post("/parents", validate(parentSchema), createParent);
router.put("/parents/:id", validate(parentUpdateSchema), updateParent);
router.delete("/parents/:id", deleteParent);

module.exports = router;
