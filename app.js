const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");

const app = express();
global.app = app;

app.set("superSecret", "djkzandjkawsuodxsmsakjuhkj");

app.use(express.json());

const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : ["http://localhost:3000", "http://localhost:3001"];

app.use(
  cors({
    origin: function (origin, callback) {
      console.log(origin);
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      const msg = `The CORS policy for ${origin} does not allow access from the specified Origin.`;
      return callback(new Error(msg), false);
    },
  })
);

// require("./middleware")(app);

app.use("/api", require("./api/status"));
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
app.use("/api", require("./api/fee"));
app.use("/api", require("./api/feeSetup"));
app.use("/api", require("./api/account/v1"));
app.use("/api", require("./api/transaction/v1"));
app.use("/api", require("./api/book/v1"));
app.use("/api", require("./api/bookIssue/v1"));
app.use("/api", require("./api/certificate/v1"));


const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log("Server started at port : ", port);
});
