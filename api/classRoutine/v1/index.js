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
    const query = { class_id, section_id, day, madrasa_id: req.user.madrasa_id };
    
    const updateDocs = {
        class_id,
        section_id,
        day,
        periods,
        madrasa_id: req.user.madrasa_id,
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
    // await // client.close();
  }
};

// Get all class routines
const getAllRoutines = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const query = { madrasa_id: req.user.madrasa_id };
    if (req.query.class_id) query.class_id = req.query.class_id;
    if (req.query.section_id) query.section_id = req.query.section_id;
    if (req.query.day) query.day = req.query.day;
    
    let routines = await db.collection("class_routines").find(query).toArray();
    
    // Populate subjects and teachers
    for (let routine of routines) {
        for (let period of routine.periods) {
            if (period.subject_id) {
                const sub = await mongo.fetchOne(db, "subjects", { _id: period.subject_id });
                if (sub) period.subject = sub;
            }
            if (period.teacher_id) {
                const teach = await mongo.fetchOne(db, "staff", { _id: period.teacher_id });
                if (teach) period.teacher = teach;
            }
        }
    }
    
    res.status(200).json({ success: true, data: routines });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    // await // client.close();
  }
};

// Delete routine
const deleteRoutine = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const result = await mongo.deleteData(db, "class_routines", {
      _id: req.params.id,
      madrasa_id: req.user.madrasa_id
    });
    
    if (!result) {
      return res.status(404).json({ success: false, message: "Routine not found" });
    }
    
    res.status(200).json({ success: true, message: "Routine deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    // await // client.close();
  }
};

// Routes
router.get("/class-routines", getAllRoutines);
router.post("/class-routines", validate(routineSchema), createOrUpdateRoutine);
router.delete("/class-routines/:id", deleteRoutine);

module.exports = router;
