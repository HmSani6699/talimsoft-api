const router = require("express").Router();
const root = require("app-root-path");
const Joi = require("joi");
const validate = require(`${root}/middleware/validate`);

const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);

// Joi Schema
const feeSetupSchema = Joi.object({
  name: Joi.string().required(), // e.g. "Monthly Tuition - Class 1"
  class_id: Joi.string().required(),
  type: Joi.string().valid("Monthly", "One-time", "Yearly").required(),
  amount: Joi.number().min(0).required(),
  frequency: Joi.number().min(1).default(1), // How many times a year? 12 for monthly
  description: Joi.string().allow("")
});

// Get all fee setups
const getAllFeeSetups = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const query = {};
    if (req.query.class_id) query.class_id = req.query.class_id;
    if (req.query.type) query.type = req.query.type;
    
    const feeSetups = await mongo.fetchMany(db, "fee_setups", query, {}, { name: 1 });
    const total = await mongo.documentCount(db, "fee_setups", query);
    res.status(200).json({ success: true, data: feeSetups, total });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Get single fee setup by ID
const getFeeSetupById = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const feeSetup = await mongo.fetchOne(db, "fee_setups", { _id: req.params.id });
    if (!feeSetup) {
      return res.status(404).json({ success: false, message: "Fee setup not found" });
    }
    res.status(200).json({ success: true, data: feeSetup });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Create new fee setup
const createFeeSetup = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const feeSetupData = {
      ...req.body,
      created_at: Date.now(),
      updated_at: Date.now()
    };
    
    const feeSetup = await mongo.insertOne(db, "fee_setups", feeSetupData);
    res.status(201).json({ success: true, data: feeSetup });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Update fee setup
const updateFeeSetup = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const result = await mongo.updateData(
      db,
      "fee_setups",
      { _id: req.params.id },
      {
        $set: {
          ...req.body,
          updated_at: Date.now()
        }
      }
    );
    
    if (!result) {
      return res.status(404).json({ success: false, message: "Fee setup not found" });
    }
    
    res.status(200).json({ success: true, message: "Fee setup updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Delete fee setup
const deleteFeeSetup = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const result = await mongo.deleteData(db, "fee_setups", { _id: req.params.id });
    
    if (!result) {
      return res.status(404).json({ success: false, message: "Fee setup not found" });
    }
    
    res.status(200).json({ success: true, message: "Fee setup deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Routes
router.get("/fee-setups", getAllFeeSetups);
router.get("/fee-setups/:id", getFeeSetupById);
router.post("/fee-setups", validate(feeSetupSchema), createFeeSetup);
router.put("/fee-setups/:id", validate(feeSetupSchema), updateFeeSetup);
router.delete("/fee-setups/:id", deleteFeeSetup);

module.exports = router;
