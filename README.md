# School Management System API - Quick Reference

## 🚀 Quick Start

```bash
cd d:/MMS/backend
npm install
npm run dev
```

Base URL: `http://localhost:3001/api/v1`

---

## 📋 All API Endpoints

| Module | Endpoint | Methods |
|--------|----------|---------|
| **Admission** | `/admissions` | GET, POST, PUT, DELETE |
| **Parents** | `/parents` | GET, POST, PUT, DELETE |
| | `/parents/:id/students` | GET |
| **Designation** | `/designations` | GET, POST, PUT, DELETE |
| **Staff** | `/staff` | GET, POST, PUT, DELETE |
| | `/staff/designation/:id` | GET |
| **Student** | `/students` | GET, POST, PUT, DELETE |
| **Attendance** | `/attendance/student` | POST |
| | `/attendance/staff` | POST |
| | `/attendance/exam` | POST |
| | `/attendance/student/:id` | GET |
| | `/attendance/staff/:id` | GET |
| | `/attendance/report` | GET |
| **Class** | `/classes` | GET, POST, PUT, DELETE |
| **Section** | `/sections` | GET, POST, PUT, DELETE |
| **Subject** | `/subjects` | GET, POST, PUT, DELETE |
| **Class Routine** | `/class-routines` | GET, POST, PUT, DELETE |
| **Homework** | `/homework` | GET, POST, PUT, DELETE |
| **Academic Report** | `/academic-reports` | GET, POST, PUT, DELETE |
| | `/academic-reports/student/:id` | GET |
| **Exam Name** | `/exam-names` | GET, POST, PUT, DELETE |
| **Exam** | `/exams` | GET, POST, PUT, DELETE |
| **Exam Schedule** | `/exam-schedules` | GET, POST, PUT, DELETE |
| **Grade** | `/grades` | GET, POST, PUT, DELETE |
| | `/grades/marks/:marks` | GET |
| **Result** | `/results` | GET, POST, PUT, DELETE |
| | `/results/student/:id` | GET |
| **Fee Setup** | `/fee-setups` | GET, POST, PUT, DELETE |
| **Fee** | `/fees` | GET, POST, PUT, DELETE |
| | `/fees/student/:id` | GET |

---

## 🔍 Common Query Parameters

- `page` - Page number (pagination)
- `limit` - Items per page
- `search` - Search term
- `status` - Filter by status
- `class_id` - Filter by class
- `section_id` - Filter by section
- `student_id` - Filter by student
- `start_date` - Date range start
- `end_date` - Date range end

---

## 📦 MongoDB Collections

- admissions
- parents
- designations
- staff
- students
- attendance
- classes
- sections
- subjects
- class_routines
- homework
- academic_reports
- exam_names
- exams
- exam_schedules
- grades
- results
- fee_setups
- fees

---

## 🧪 Testing Examples

### Create a Class
```bash
curl -X POST http://localhost:3001/api/v1/classes \
  -H "Content-Type: application/json" \
  -d '{"name":"Grade 10","capacity":40}'
```

### Get All Students in a Class
```bash
curl "http://localhost:3001/api/v1/students?class_id=CLASS_ID"
```

### Mark Student Attendance
```bash
curl -X POST http://localhost:3001/api/v1/attendance/student \
  -H "Content-Type: application/json" \
  -d '{
    "student_id":"STUDENT_ID",
    "class_id":"CLASS_ID",
    "section_id":"SECTION_ID",
    "date":1708099200000,
    "status":"present"
  }'
```

### Get Student Report Card
```bash
curl "http://localhost:3001/api/v1/academic-reports/student/STUDENT_ID"
```

### Record Fee Payment
```bash
curl -X PUT http://localhost:3001/api/v1/fees/FEE_ID \
  -H "Content-Type: application/json" \
  -d '{
    "paid_amount":5000,
    "status":"paid",
    "payment_date":1708099200000
  }'
```

---

## 📖 Full Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete details on all endpoints, request/response formats, and examples.
