# School Management System API Documentation

## Base URL
```
http://localhost:3001/api/v1
```

## API Endpoints Overview

All endpoints follow the pattern: `/api/v1/{resource}`

---

## 1. Admission API

### Endpoints
- `GET /api/v1/admissions` - Get all admissions
- `GET /api/v1/admissions/:id` - Get single admission
- `POST /api/v1/admissions` - Create new admission
- `PUT /api/v1/admissions/:id` - Update admission
- `DELETE /api/v1/admissions/:id` - Delete admission

### Query Parameters (GET all)
- `class_id` - Filter by class
- `section_id` - Filter by section
- `academic_year` - Filter by academic year
- `status` - Filter by status
- `page` - Page number for pagination
- `limit` - Items per page

### Sample Request Body (POST/PUT)
```json
{
  "student_name": "John Doe",
  "class_id": "class123",
  "section_id": "section456",
  "parent_id": "parent789",
  "admission_date": 1708099200000,
  "academic_year": "2024-2025",
  "status": "active",
  "documents": ["birth_certificate", "photo"]
}
```

---

## 2. Parents API

### Endpoints
- `GET /api/v1/parents` - Get all parents
- `GET /api/v1/parents/:id` - Get single parent
- `GET /api/v1/parents/:id/students` - Get parent's children
- `POST /api/v1/parents` - Create new parent
- `PUT /api/v1/parents/:id` - Update parent
- `DELETE /api/v1/parents/:id` - Delete parent

### Query Parameters (GET all)
- `search` - Search by name or phone
- `page` - Page number
- `limit` - Items per page

### Sample Request Body
```json
{
  "father_name": "Michael Doe",
  "mother_name": "Sarah Doe",
  "phone": "+1234567890",
  "email": "parent@example.com",
  "address": "123 Main St",
  "occupation": "Engineer"
}
```

---

## 3. Designation API

### Endpoints
- `GET /api/v1/designations` - Get all designations
- `GET /api/v1/designations/:id` - Get single designation
- `POST /api/v1/designations` - Create new designation
- `PUT /api/v1/designations/:id` - Update designation
- `DELETE /api/v1/designations/:id` - Delete designation

### Sample Request Body
```json
{
  "title": "Principal",
  "department": "Administration",
  "salary_range": "50000-70000",
  "responsibilities": "Overall school management"
}
```

---

## 4. Staff API

### Endpoints
- `GET /api/v1/staff` - Get all staff
- `GET /api/v1/staff/:id` - Get single staff (with designation)
- `GET /api/v1/staff/designation/:designationId` - Get staff by designation
- `POST /api/v1/staff` - Create new staff
- `PUT /api/v1/staff/:id` - Update staff
- `DELETE /api/v1/staff/:id` - Delete staff

### Query Parameters (GET all)
- `designation_id` - Filter by designation
- `department` - Filter by department
- `status` - Filter by status

### Sample Request Body
```json
{
  "name": "Jane Smith",
  "email": "jane@school.com",
  "phone": "+1234567890",
  "designation_id": "designation123",
  "joining_date": 1708099200000,
  "salary": 55000,
  "address": "456 Oak Ave",
  "status": "active"
}
```

---

## 5. Student API

### Endpoints
- `GET /api/v1/students` - Get all students
- `GET /api/v1/students/:id` - Get single student (with parent, class, section)
- `POST /api/v1/students` - Create new student
- `PUT /api/v1/students/:id` - Update student
- `DELETE /api/v1/students/:id` - Delete student

### Query Parameters (GET all)
- `class_id` - Filter by class
- `section_id` - Filter by section
- `parent_id` - Filter by parent
- `status` - Filter by status
- `search` - Search by name or roll number

### Sample Request Body
```json
{
  "name": "Alice Johnson",
  "roll_number": "2024001",
  "class_id": "class123",
  "section_id": "section456",
  "parent_id": "parent789",
  "dob": 1420070400000,
  "gender": "female",
  "address": "789 Pine St",
  "admission_date": 1708099200000,
  "status": "active"
}
```

---

## 6. Attendance API

### Endpoints
- `POST /api/v1/attendance/student` - Mark student attendance
- `POST /api/v1/attendance/staff` - Mark staff attendance
- `POST /api/v1/attendance/exam` - Mark exam attendance
- `GET /api/v1/attendance/student/:studentId` - Get student attendance
- `GET /api/v1/attendance/staff/:staffId` - Get staff attendance
- `GET /api/v1/attendance/report` - Get attendance report
- `PUT /api/v1/attendance/:id` - Update attendance
- `DELETE /api/v1/attendance/:id` - Delete attendance

### Sample Request Body (Student Attendance)
```json
{
  "student_id": "student123",
  "class_id": "class123",
  "section_id": "section456",
  "date": 1708099200000,
  "status": "present",
  "remarks": ""
}
```

### Sample Request Body (Staff Attendance)
```json
{
  "staff_id": "staff123",
  "date": 1708099200000,
  "status": "present",
  "check_in": "09:00",
  "check_out": "17:00",
  "remarks": ""
}
```

---

## 7. Class API

### Endpoints
- `GET /api/v1/classes` - Get all classes
- `GET /api/v1/classes/:id` - Get single class (with sections)
- `POST /api/v1/classes` - Create new class
- `PUT /api/v1/classes/:id` - Update class
- `DELETE /api/v1/classes/:id` - Delete class

### Sample Request Body
```json
{
  "name": "Grade 10",
  "description": "Tenth grade class",
  "capacity": 40
}
```

---

## 8. Section API

### Endpoints
- `GET /api/v1/sections` - Get all sections
- `GET /api/v1/sections/:id` - Get single section (with class)
- `POST /api/v1/sections` - Create new section
- `PUT /api/v1/sections/:id` - Update section
- `DELETE /api/v1/sections/:id` - Delete section

### Query Parameters (GET all)
- `class_id` - Filter by class

### Sample Request Body
```json
{
  "name": "Section A",
  "class_id": "class123",
  "capacity": 35,
  "room_number": "101"
}
```

---

## 9. Subject API

### Endpoints
- `GET /api/v1/subjects` - Get all subjects
- `GET /api/v1/subjects/:id` - Get single subject
- `POST /api/v1/subjects` - Create new subject
- `PUT /api/v1/subjects/:id` - Update subject
- `DELETE /api/v1/subjects/:id` - Delete subject

### Query Parameters (GET all)
- `class_id` - Filter by class
- `type` - Filter by type (theory, practical)

### Sample Request Body
```json
{
  "name": "Mathematics",
  "code": "MATH101",
  "class_id": "class123",
  "type": "theory",
  "credits": 4
}
```

---

## 10. Class Routine API

### Endpoints
- `GET /api/v1/class-routines` - Get all routines
- `GET /api/v1/class-routines/:id` - Get single routine
- `POST /api/v1/class-routines` - Create new routine
- `PUT /api/v1/class-routines/:id` - Update routine
- `DELETE /api/v1/class-routines/:id` - Delete routine

### Query Parameters (GET all)
- `class_id` - Filter by class
- `section_id` - Filter by section
- `teacher_id` - Filter by teacher
- `day` - Filter by day (Monday, Tuesday, etc.)

### Sample Request Body
```json
{
  "class_id": "class123",
  "section_id": "section456",
  "subject_id": "subject789",
  "teacher_id": "staff123",
  "day": "Monday",
  "start_time": "09:00",
  "end_time": "10:00",
  "room_number": "101"
}
```

---

## 11. Homework API

### Endpoints
- `GET /api/v1/homework` - Get all homework
- `GET /api/v1/homework/:id` - Get single homework
- `POST /api/v1/homework` - Create new homework
- `PUT /api/v1/homework/:id` - Update homework
- `DELETE /api/v1/homework/:id` - Delete homework

### Query Parameters (GET all)
- `class_id` - Filter by class
- `section_id` - Filter by section
- `subject_id` - Filter by subject
- `teacher_id` - Filter by teacher

### Sample Request Body
```json
{
  "class_id": "class123",
  "section_id": "section456",
  "subject_id": "subject789",
  "teacher_id": "staff123",
  "title": "Chapter 5 Exercises",
  "description": "Complete exercises 1-10 from chapter 5",
  "assigned_date": 1708099200000,
  "due_date": 1708185600000
}
```

---

## 12. Academic Report API

### Endpoints
- `GET /api/v1/academic-reports` - Get all reports
- `GET /api/v1/academic-reports/:id` - Get single report
- `GET /api/v1/academic-reports/student/:studentId` - Get student report card
- `POST /api/v1/academic-reports` - Create new report
- `PUT /api/v1/academic-reports/:id` - Update report
- `DELETE /api/v1/academic-reports/:id` - Delete report

### Query Parameters (GET all)
- `student_id` - Filter by student
- `exam_id` - Filter by exam
- `subject_id` - Filter by subject
- `class_id` - Filter by class

### Sample Request Body
```json
{
  "student_id": "student123",
  "exam_id": "exam456",
  "subject_id": "subject789",
  "class_id": "class123",
  "marks": 85,
  "grade": "A",
  "remarks": "Excellent performance",
  "date": 1708099200000
}
```

---

## 13. Exam Name API

### Endpoints
- `GET /api/v1/exam-names` - Get all exam names
- `GET /api/v1/exam-names/:id` - Get single exam name
- `POST /api/v1/exam-names` - Create new exam name
- `PUT /api/v1/exam-names/:id` - Update exam name
- `DELETE /api/v1/exam-names/:id` - Delete exam name

### Sample Request Body
```json
{
  "name": "Midterm Examination",
  "description": "Mid-semester examination"
}
```

---

## 14. Exam API

### Endpoints
- `GET /api/v1/exams` - Get all exams
- `GET /api/v1/exams/:id` - Get single exam (with exam name)
- `POST /api/v1/exams` - Create new exam
- `PUT /api/v1/exams/:id` - Update exam
- `DELETE /api/v1/exams/:id` - Delete exam

### Query Parameters (GET all)
- `exam_name_id` - Filter by exam name
- `class_id` - Filter by class
- `academic_year` - Filter by academic year

### Sample Request Body
```json
{
  "exam_name_id": "examname123",
  "class_id": "class123",
  "academic_year": "2024-2025",
  "start_date": 1708099200000,
  "end_date": 1708185600000,
  "description": "First semester midterm"
}
```

---

## 15. Exam Schedule API

### Endpoints
- `GET /api/v1/exam-schedules` - Get all schedules
- `GET /api/v1/exam-schedules/:id` - Get single schedule
- `POST /api/v1/exam-schedules` - Create new schedule
- `PUT /api/v1/exam-schedules/:id` - Update schedule
- `DELETE /api/v1/exam-schedules/:id` - Delete schedule

### Query Parameters (GET all)
- `exam_id` - Filter by exam
- `class_id` - Filter by class
- `subject_id` - Filter by subject

### Sample Request Body
```json
{
  "exam_id": "exam123",
  "class_id": "class123",
  "subject_id": "subject789",
  "exam_date": 1708099200000,
  "start_time": "09:00",
  "end_time": "12:00",
  "room_number": "Hall A",
  "total_marks": 100
}
```

---

## 16. Grade API

### Endpoints
- `GET /api/v1/grades` - Get all grades
- `GET /api/v1/grades/:id` - Get single grade
- `GET /api/v1/grades/marks/:marks` - Get grade by marks
- `POST /api/v1/grades` - Create new grade
- `PUT /api/v1/grades/:id` - Update grade
- `DELETE /api/v1/grades/:id` - Delete grade

### Sample Request Body
```json
{
  "grade": "A+",
  "min_marks": 90,
  "max_marks": 100,
  "gpa": 4.0,
  "description": "Outstanding"
}
```

---

## 17. Result API

### Endpoints
- `GET /api/v1/results` - Get all results
- `GET /api/v1/results/:id` - Get single result
- `GET /api/v1/results/student/:studentId` - Get student results
- `POST /api/v1/results` - Create new result
- `PUT /api/v1/results/:id` - Update result
- `DELETE /api/v1/results/:id` - Delete result

### Query Parameters (GET all)
- `student_id` - Filter by student
- `exam_id` - Filter by exam
- `subject_id` - Filter by subject
- `class_id` - Filter by class

### Sample Request Body
```json
{
  "student_id": "student123",
  "exam_id": "exam456",
  "subject_id": "subject789",
  "class_id": "class123",
  "marks_obtained": 85,
  "total_marks": 100,
  "grade": "A",
  "gpa": 3.8,
  "remarks": "Good performance"
}
```

---

## 18. Fee Setup API

### Endpoints
- `GET /api/v1/fee-setups` - Get all fee setups
- `GET /api/v1/fee-setups/:id` - Get single fee setup
- `POST /api/v1/fee-setups` - Create new fee setup
- `PUT /api/v1/fee-setups/:id` - Update fee setup
- `DELETE /api/v1/fee-setups/:id` - Delete fee setup

### Query Parameters (GET all)
- `class_id` - Filter by class
- `fee_head` - Filter by fee head

### Sample Request Body
```json
{
  "fee_head": "Tuition Fee",
  "amount": 5000,
  "class_id": "class123",
  "frequency": "monthly",
  "description": "Monthly tuition fee"
}
```

---

## 19. Fee API

### Endpoints
- `GET /api/v1/fees` - Get all fees
- `GET /api/v1/fees/:id` - Get single fee (with fee setup)
- `GET /api/v1/fees/student/:studentId` - Get student fees
- `POST /api/v1/fees` - Create new fee
- `PUT /api/v1/fees/:id` - Update fee (record payment)
- `DELETE /api/v1/fees/:id` - Delete fee

### Query Parameters (GET all)
- `student_id` - Filter by student
- `fee_setup_id` - Filter by fee setup
- `status` - Filter by status (paid, pending, overdue)

### Sample Request Body
```json
{
  "student_id": "student123",
  "fee_setup_id": "feesetup456",
  "amount": 5000,
  "paid_amount": 3000,
  "due_amount": 2000,
  "payment_date": 1708099200000,
  "status": "partial",
  "remarks": "Partial payment received"
}
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* resource data */ },
  "total": 100  // for list endpoints
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `404` - Not Found
- `500` - Internal Server Error

---

## MongoDB Collections

All data is stored in MongoDB with the following collections:
- `admissions`
- `parents`
- `designations`
- `staff`
- `students`
- `attendance`
- `classes`
- `sections`
- `subjects`
- `class_routines`
- `homework`
- `academic_reports`
- `exam_names`
- `exams`
- `exam_schedules`
- `grades`
- `results`
- `fee_setups`
- `fees`

---

## Notes

1. All timestamps are in Unix milliseconds format
2. All IDs are MongoDB ObjectIds stored as strings
3. Pagination is optional (page and limit parameters)
4. All endpoints support filtering via query parameters
5. Related data is automatically populated where appropriate
