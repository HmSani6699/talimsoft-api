const router = require("express").Router();
const root = require("app-root-path");
const Joi = require("joi");
const validate = require(`${root}/middleware/validate`);

const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);

// Joi Schema
const routineSchema = Joi.object({
  class_id: Joi.string().required(),
  section_id: Joi.string().required(),
  day: Joi.string().valid("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday").required(),
  periods: Joi.array().items(
      Joi.object({
          startTime: Joi.string().required(), // HH:mm
          endTime: Joi.string().required(),
          subject_id: Joi.string().required(),
          teacher_id: Joi.string().required(),
          roomNumber: Joi.string().allow("")
      })
  ).min(1).required()
});

// Update method: Usually we replace the routine for a specific day/class/section
const createOrUpdateRoutine = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const { class_id, section_id, day, periods } = req.body;
    
    // Check if exists
    const query = { class_id, section_id, day };
    
    const updateDocs = {
        class_id,
        section_id,
        day,
        periods,
        updated_at: Date.now()
    };

    // Upsert
    await db.collection("class_routines").updateOne(
        query, 
        { 
            $set: updateDocs,
            $setOnInsert: { created_at: Date.now() }
        }, 
        { upsert: true }
    );
    
    res.status(200).json({ success: true, message: "Routine updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Get all class routines
const getAllRoutines = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const query = {};
    if (req.query.class_id) query.class_id = req.query.class_id;
    if (req.query.section_id) query.section_id = req.query.section_id;
    if (req.query.teacher_id) query["periods.teacher_id"] = req.query.teacher_id; // Query nested array
    if (req.query.day) query.day = req.query.day;
    
    const routines = await mongo.fetchMany(db, "class_routines", query, {}, { day: 1 });
    
    // Custom sort for days could be handled in code or if we stored day index
    
    res.status(200).json({ success: true, data: routines });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

// Routes
router.get("/class-routines", getAllRoutines);
router.post("/class-routines", validate(routineSchema), createOrUpdateRoutine);

module.exports = router;
