const router = require("express").Router();
const root = require("app-root-path");
const Joi = require("joi");
const validate = require(`${root}/middleware/validate`);

const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);

// Joi Schema
const reportSchema = Joi.object({
  student_id: Joi.string().required(),
  exam_id: Joi.string().required(),
  class_id: Joi.string().required(),
  section_id: Joi.string().allow(""),
  subject_id: Joi.string().required(),
  marks_obtained: Joi.number().required(),
  total_marks: Joi.number().required(),
  grade: Joi.string().allow(""),
  remarks: Joi.string().allow(""),
  date: Joi.date().default(Date.now)
});

// Get all academic reports
const getAllReports = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const query = { madrasa_id: req.user.madrasa_id };
    if (req.query.student_id) query.student_id = req.query.student_id;
    if (req.query.exam_id) query.exam_id = req.query.exam_id;
    if (req.query.subject_id) query.subject_id = req.query.subject_id;
    if (req.query.class_id) query.class_id = req.query.class_id;
    
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 0;
    
    const reports = await mongo.fetchMany(db, "academic_reports", query, {}, { date: -1 }, limit, page);
    const total = await mongo.documentCount(db, "academic_reports", query);
    res.status(200).json({ success: true, data: reports, total });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    // await // client.close();
  }
};

// Get single report by ID
const getReportById = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const report = await mongo.fetchOne(db, "academic_reports", { _id: req.params.id, madrasa_id: req.user.madrasa_id });
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    // await // client.close();
  }
};

// Get student report card
const getStudentReportCard = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const query = {
      student_id: req.params.studentId,
      madrasa_id: req.user.madrasa_id
    };
    
    if (req.query.exam_id) query.exam_id = req.query.exam_id;
    
    const reports = await mongo.fetchMany(db, "academic_reports", query, {}, { date: -1 });
    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    // await // client.close();
  }
};

// Create new report
const createReport = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const reportData = {
      ...req.body,
      madrasa_id: req.user.madrasa_id,
      created_at: Date.now(),
      updated_at: Date.now()
    };
    
    const report = await mongo.insertOne(db, "academic_reports", reportData);
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    // await // client.close();
  }
};

// Update report
const updateReport = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const result = await mongo.updateData(
      db,
      "academic_reports",
      { _id: req.params.id, madrasa_id: req.user.madrasa_id },
      {
        $set: {
          ...req.body,
          updated_at: Date.now()
        }
      }
    );
    
    if (!result) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }
    
    res.status(200).json({ success: true, message: "Report updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    // await // client.close();
  }
};

// Delete report
const deleteReport = async (req, res) => {
  const { db, client } = await mongoConnect();
  try {
    const result = await mongo.deleteData(db, "academic_reports", { _id: req.params.id, madrasa_id: req.user.madrasa_id });
    
    if (!result) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }
    
    res.status(200).json({ success: true, message: "Report deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    // await // client.close();
  }
};

// Routes
router.get("/academic-reports", getAllReports);
router.get("/academic-reports/:id", getReportById);
router.get("/academic-reports/student/:studentId", getStudentReportCard);
router.post("/academic-reports", validate(reportSchema), createReport);
router.put("/academic-reports/:id", validate(reportSchema), updateReport);
router.delete("/academic-reports/:id", deleteReport);

module.exports = router;
