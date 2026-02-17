const router = require("express").Router();
const root = require("app-root-path");

const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);

// Get all designations
const getAllDesignations = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const query = {};
    if (req.query.department) query.department = req.query.department;

    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 0;
    
    const designations = await mongo.fetchMany(db, "designations", query, {}, { title: 1 }, limit, page);
    const total = await mongo.documentCount(db, "designations", query);
    
    res.status(200).json({ success: true, data: designations, total });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Get single designation by ID
const getDesignationById = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const designation = await mongo.fetchOne(db, "designations", { _id: req.params.id });
    if (!designation) {
      return res.status(404).json({ success: false, message: "Designation not found" });
    }
    res.status(200).json({ success: true, data: designation });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Create new designation
const createDesignation = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const designationData = {
      ...req.body,
      created_at: Date.now(),
      updated_at: Date.now()
    };
    
    const designation = await mongo.insertOne(db, "designations", designationData);
    res.status(201).json({ success: true, data: designation });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Update designation
const updateDesignation = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const result = await mongo.updateData(
      db,
      "designations",
      { _id: req.params.id },
      {
        $set: {
          ...req.body,
          updated_at: Date.now()
        }
      }
    );
    
    if (!result) {
      return res.status(404).json({ success: false, message: "Designation not found" });
    }
    
    res.status(200).json({ success: true, message: "Designation updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Delete designation
const deleteDesignation = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const result = await mongo.deleteData(db, "designations", { _id: req.params.id });
    
    if (!result) {
      return res.status(404).json({ success: false, message: "Designation not found" });
    }
    
    res.status(200).json({ success: true, message: "Designation deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Routes
router.get("/designations", getAllDesignations);
router.get("/designations/:id", getDesignationById);
router.post("/designations", createDesignation);
router.put("/designations/:id", updateDesignation);
router.delete("/designations/:id", deleteDesignation);

module.exports = router;
