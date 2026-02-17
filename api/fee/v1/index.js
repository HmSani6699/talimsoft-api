const router = require("express").Router();
const root = require("app-root-path");
const Joi = require("joi");
const validate = require(`${root}/middleware/validate`);

const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);

// Joi Schema
const feeSchema = Joi.object({
  student_id: Joi.string().required(),
  fee_setup_id: Joi.string().required(),
  month: Joi.string().allow(""), // e.g. "January"
  year: Joi.string().required(), // "2026"
  amount: Joi.number().min(0).required(), // Total payable for this record
  paid_amount: Joi.number().min(0).default(0),
  due_amount: Joi.number().min(0).allow(null), // Can be calculated
  status: Joi.string().valid("Paid", "Partial", "Pending", "Overdue").default("Pending"),
  payment_date: Joi.date().allow(null),
  transaction_id: Joi.string().allow(""),
  remarks: Joi.string().allow("")
});

// Calculate due amount helper
const calculateStatus = (amount, paid) => {
    if (paid >= amount) return "Paid";
    if (paid > 0) return "Partial";
    return "Pending";
};

// Get all fees
// Supports filtering by student, class (via aggregation/lookup if needed, but keeping simple for now), status, month
const getAllFees = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const query = {};
    if (req.query.student_id) query.student_id = req.query.student_id;
    if (req.query.fee_setup_id) query.fee_setup_id = req.query.fee_setup_id;
    if (req.query.status) query.status = req.query.status;
    if (req.query.month) query.month = req.query.month;
    if (req.query.year) query.year = req.query.year;
    
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 0;
    
    const fees = await mongo.fetchMany(db, "fees", query, {}, { created_at: -1 }, limit, page);
    const total = await mongo.documentCount(db, "fees", query);
    res.status(200).json({ success: true, data: fees, total });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Get single fee by ID
const getFeeById = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const fee = await mongo.fetchOne(db, "fees", { _id: req.params.id });
    if (!fee) {
      return res.status(404).json({ success: false, message: "Fee not found" });
    }
    
    // Populate fee setup
    if (fee.fee_setup_id) {
       const setup = await mongo.fetchOne(db, "fee_setups", { _id: fee.fee_setup_id });
       fee.setup = setup;
    }

    res.status(200).json({ success: true, data: fee });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Get student fees
const getStudentFees = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const query = {
      student_id: req.params.studentId
    };
    
    if (req.query.status) query.status = req.query.status;
    
    const fees = await mongo.fetchMany(db, "fees", query, {}, { created_at: -1 });
    res.status(200).json({ success: true, data: fees });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Create new fee (Invoice generation)
const createFee = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    // Check duplicates for same setup, student, month, year
    const existing = await mongo.fetchOne(db, "fees", {
        student_id: req.body.student_id,
        fee_setup_id: req.body.fee_setup_id,
        month: req.body.month,
        year: req.body.year
    });

    if (existing) {
        return res.status(409).json({ success: false, message: "Fee record already generated for this period" });
    }

    const { amount, paid_amount } = req.body;
    const paid = paid_amount || 0;
    
    const feeData = {
      ...req.body,
      paid_amount: paid,
      due_amount: amount - paid,
      status: calculateStatus(amount, paid),
      created_at: Date.now(),
      updated_at: Date.now()
    };
    
    const fee = await mongo.insertOne(db, "fees", feeData);
    res.status(201).json({ success: true, data: fee });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Update fee (Payment recording)
const updateFee = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    // We might need to fetch existing to calculate totals if we are sending only "payment increment"
    // For now assuming we send total paid amount updated
    // Or simpler: Logic should be in a separate /pay endpoint for transactions. 
    // Here we act as a CRUD update.
    
    const updateData = { ...req.body };
    
    // Auto-recalculate status if amounts are touched
    if (updateData.amount !== undefined || updateData.paid_amount !== undefined) {
        // Need to fetch current if one is missing, but assuming full payload for safety or basic check
        // Simplified: Trust the body or calculate if both present
        if (updateData.amount !== undefined && updateData.paid_amount !== undefined) {
             updateData.due_amount = updateData.amount - updateData.paid_amount;
             updateData.status = calculateStatus(updateData.amount, updateData.paid_amount);
        }
    }

    const result = await mongo.updateData(
      db,
      "fees",
      { _id: req.params.id },
      {
        $set: {
            ...updateData,
          updated_at: Date.now()
        }
      }
    );
    
    if (!result) {
      return res.status(404).json({ success: false, message: "Fee not found" });
    }
    
    res.status(200).json({ success: true, message: "Fee updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Delete fee
const deleteFee = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const result = await mongo.deleteData(db, "fees", { _id: req.params.id });
    
    if (!result) {
      return res.status(404).json({ success: false, message: "Fee not found" });
    }
    
    res.status(200).json({ success: true, message: "Fee deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Routes
router.get("/fees", getAllFees);
router.get("/fees/:id", getFeeById);
router.get("/fees/student/:studentId", getStudentFees);
router.post("/fees", validate(feeSchema), createFee);
router.put("/fees/:id", validate(feeSchema), updateFee);
router.delete("/fees/:id", deleteFee);

module.exports = router;
