const dotenv = require("dotenv");
dotenv.config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");

const app = express();
global.app = app;

app.set("superSecret", "djkzandjkawsuodxsmsakjuhkj");

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").map(o => o.trim()).filter(Boolean);
if (allowedOrigins.length === 0) {
    allowedOrigins.push("http://localhost:3000", "http://localhost:3001", "http://localhost:5173");
}

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.error(`CORS Blocked for origin: ${origin}`);
        console.error(`Allowed origins: ${JSON.stringify(allowedOrigins)}`);
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// require("./middleware")(app);

app.use("/api", require("./api/status"));
app.use("/api/auth", require("./api/auth")); // New Auth Configuration
app.use("/api/super-admin", require("./api/super-admin")); // New Super Admin Configuration
app.use("/api", require("./api/person"));

// School Management System API Routes
app.use("/api", require("./api/admission"));
app.use("/api", require("./api/parent"));
app.use("/api", require("./api/designation"));
app.use("/api", require("./api/staff"));
app.use("/api", require("./api/student"));
app.use("/api", require("./api/attendance"));
app.use("/api", require("./api/class"));
app.use("/api", require("./api/section"));
app.use("/api", require("./api/subject"));
app.use("/api", require("./api/classRoutine"));
app.use("/api", require("./api/homework"));
app.use("/api", require("./api/academicReport"));
app.use("/api", require("./api/examName"));
app.use("/api", require("./api/exam"));
app.use("/api", require("./api/examSchedule"));
app.use("/api", require("./api/grade"));
app.use("/api", require("./api/result"));
// app.use("/api", require("./api/fee"));
app.use("/api/fee-setup", require("./api/feeSetup"));
app.use("/api", require("./api/account/v1"));
app.use("/api", require("./api/transaction/v1"));
app.use("/api", require("./api/book/v1"));
app.use("/api", require("./api/bookIssue/v1"));
app.use("/api", require("./api/certificate/v1"));
app.use("/api", require("./api/salarySetup"));
app.use("/api", require("./api/salaryPayment"));
app.use("/api", require("./api/class-assign"));
app.use("/api", require("./api/ClassSyllabus"));
app.use("/api/fee-type", require("./api/FeeType"));





// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`[SUCCESS] Backend server is listening on port ${port}`);
  console.log(`[INFO] API Base URL: http://localhost:${port}/api`);
  console.log(`[INFO] Allowed Origins: ${JSON.stringify(allowedOrigins)}`);
});
