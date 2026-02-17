# Testing School Management System APIs in Postman

## 🚀 Initial Setup

### 1. Start the Server
```bash
cd d:/MMS/backend
npm run dev
```

The server should start on `http://localhost:3001`

### 2. Create a New Collection in Postman
1. Open Postman
2. Click "New" → "Collection"
3. Name it "School Management System"
4. Set Base URL as a collection variable:
   - Click on the collection → Variables tab
   - Add variable: `baseUrl` = `http://localhost:3001/api/v1`

---

## 📝 Testing Guide (Step-by-Step)

### Step 1: Create Basic Structure

#### 1.1 Create a Class
**Request:**
- Method: `POST`
- URL: `{{baseUrl}}/classes`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "name": "Grade 10",
  "description": "Tenth grade class",
  "capacity": 40
}
```
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123...",
    "name": "Grade 10",
    "description": "Tenth grade class",
    "capacity": 40,
    "created_at": 1708099200000,
    "updated_at": 1708099200000
  }
}
```
**Save the `_id` as `class_id` for next steps**

---

#### 1.2 Create a Section
**Request:**
- Method: `POST`
- URL: `{{baseUrl}}/sections`
- Body:
```json
{
  "name": "Section A",
  "class_id": "YOUR_CLASS_ID_HERE",
  "capacity": 35,
  "room_number": "101"
}
```
**Save the `_id` as `section_id`**

---

#### 1.3 Create a Subject
**Request:**
- Method: `POST`
- URL: `{{baseUrl}}/subjects`
- Body:
```json
{
  "name": "Mathematics",
  "code": "MATH101",
  "class_id": "YOUR_CLASS_ID_HERE",
  "type": "theory",
  "credits": 4
}
```
**Save the `_id` as `subject_id`**

---

#### 1.4 Create a Designation
**Request:**
- Method: `POST`
- URL: `{{baseUrl}}/designations`
- Body:
```json
{
  "title": "Mathematics Teacher",
  "department": "Academic",
  "salary_range": "30000-50000",
  "responsibilities": "Teaching mathematics to students"
}
```
**Save the `_id` as `designation_id`**

---

### Step 2: Create People (Staff & Parents)

#### 2.1 Create a Staff Member
**Request:**
- Method: `POST`
- URL: `{{baseUrl}}/staff`
- Body:
```json
{
  "name": "Jane Smith",
  "email": "jane.smith@school.com",
  "phone": "+1234567890",
  "designation_id": "YOUR_DESIGNATION_ID_HERE",
  "joining_date": 1708099200000,
  "salary": 35000,
  "address": "456 Oak Avenue",
  "status": "active"
}
```
**Save the `_id` as `staff_id`**

---

#### 2.2 Create a Parent
**Request:**
- Method: `POST`
- URL: `{{baseUrl}}/parents`
- Body:
```json
{
  "father_name": "Michael Doe",
  "mother_name": "Sarah Doe",
  "phone": "+1234567891",
  "email": "parent@example.com",
  "address": "123 Main Street",
  "occupation": "Engineer"
}
```
**Save the `_id` as `parent_id`**

---

### Step 3: Student Management

#### 3.1 Create a Student
**Request:**
- Method: `POST`
- URL: `{{baseUrl}}/students`
- Body:
```json
{
  "name": "Alice Johnson",
  "roll_number": "2024001",
  "class_id": "YOUR_CLASS_ID_HERE",
  "section_id": "YOUR_SECTION_ID_HERE",
  "parent_id": "YOUR_PARENT_ID_HERE",
  "dob": 1420070400000,
  "gender": "female",
  "address": "789 Pine Street",
  "admission_date": 1708099200000,
  "status": "active"
}
```
**Save the `_id` as `student_id`**

---

#### 3.2 Get All Students
**Request:**
- Method: `GET`
- URL: `{{baseUrl}}/students`

**With Filters:**
- URL: `{{baseUrl}}/students?class_id=YOUR_CLASS_ID&section_id=YOUR_SECTION_ID`

---

#### 3.3 Get Single Student (with relations)
**Request:**
- Method: `GET`
- URL: `{{baseUrl}}/students/YOUR_STUDENT_ID`

**Expected Response:** Student data with parent, class, and section details populated

---

### Step 4: Attendance Management

#### 4.1 Mark Student Attendance
**Request:**
- Method: `POST`
- URL: `{{baseUrl}}/attendance/student`
- Body:
```json
{
  "student_id": "YOUR_STUDENT_ID_HERE",
  "class_id": "YOUR_CLASS_ID_HERE",
  "section_id": "YOUR_SECTION_ID_HERE",
  "date": 1708099200000,
  "status": "present",
  "remarks": ""
}
```

---

#### 4.2 Mark Staff Attendance
**Request:**
- Method: `POST`
- URL: `{{baseUrl}}/attendance/staff`
- Body:
```json
{
  "staff_id": "YOUR_STAFF_ID_HERE",
  "date": 1708099200000,
  "status": "present",
  "check_in": "09:00",
  "check_out": "17:00",
  "remarks": ""
}
```

---

#### 4.3 Get Student Attendance
**Request:**
- Method: `GET`
- URL: `{{baseUrl}}/attendance/student/YOUR_STUDENT_ID`

**With Date Range:**
- URL: `{{baseUrl}}/attendance/student/YOUR_STUDENT_ID?start_date=1708099200000&end_date=1708185600000`

---

### Step 5: Class Routine

#### 5.1 Create Class Routine
**Request:**
- Method: `POST`
- URL: `{{baseUrl}}/class-routines`
- Body:
```json
{
  "class_id": "YOUR_CLASS_ID_HERE",
  "section_id": "YOUR_SECTION_ID_HERE",
  "subject_id": "YOUR_SUBJECT_ID_HERE",
  "teacher_id": "YOUR_STAFF_ID_HERE",
  "day": "Monday",
  "start_time": "09:00",
  "end_time": "10:00",
  "room_number": "101"
}
```

---

#### 5.2 Get Class Routine
**Request:**
- Method: `GET`
- URL: `{{baseUrl}}/class-routines?class_id=YOUR_CLASS_ID&section_id=YOUR_SECTION_ID`

**Filter by Day:**
- URL: `{{baseUrl}}/class-routines?day=Monday`

---

### Step 6: Homework Management

#### 6.1 Create Homework
**Request:**
- Method: `POST`
- URL: `{{baseUrl}}/homework`
- Body:
```json
{
  "class_id": "YOUR_CLASS_ID_HERE",
  "section_id": "YOUR_SECTION_ID_HERE",
  "subject_id": "YOUR_SUBJECT_ID_HERE",
  "teacher_id": "YOUR_STAFF_ID_HERE",
  "title": "Chapter 5 Exercises",
  "description": "Complete exercises 1-10 from chapter 5",
  "assigned_date": 1708099200000,
  "due_date": 1708185600000
}
```

---

#### 6.2 Get Homework
**Request:**
- Method: `GET`
- URL: `{{baseUrl}}/homework?class_id=YOUR_CLASS_ID&subject_id=YOUR_SUBJECT_ID`

---

### Step 7: Examination System

#### 7.1 Create Exam Name
**Request:**
- Method: `POST`
- URL: `{{baseUrl}}/exam-names`
- Body:
```json
{
  "name": "Midterm Examination",
  "description": "Mid-semester examination"
}
```
**Save the `_id` as `exam_name_id`**

---

#### 7.2 Create Exam
**Request:**
- Method: `POST`
- URL: `{{baseUrl}}/exams`
- Body:
```json
{
  "exam_name_id": "YOUR_EXAM_NAME_ID_HERE",
  "class_id": "YOUR_CLASS_ID_HERE",
  "academic_year": "2024-2025",
  "start_date": 1708099200000,
  "end_date": 1708185600000,
  "description": "First semester midterm"
}
```
**Save the `_id` as `exam_id`**

---

#### 7.3 Create Exam Schedule
**Request:**
- Method: `POST`
- URL: `{{baseUrl}}/exam-schedules`
- Body:
```json
{
  "exam_id": "YOUR_EXAM_ID_HERE",
  "class_id": "YOUR_CLASS_ID_HERE",
  "subject_id": "YOUR_SUBJECT_ID_HERE",
  "exam_date": 1708099200000,
  "start_time": "09:00",
  "end_time": "12:00",
  "room_number": "Hall A",
  "total_marks": 100
}
```

---

#### 7.4 Create Grade System
**Request:**
- Method: `POST`
- URL: `{{baseUrl}}/grades`
- Body:
```json
{
  "grade": "A+",
  "min_marks": 90,
  "max_marks": 100,
  "gpa": 4.0,
  "description": "Outstanding"
}
```

**Create multiple grades:**
```json
// A
{
  "grade": "A",
  "min_marks": 80,
  "max_marks": 89,
  "gpa": 3.5,
  "description": "Excellent"
}

// B
{
  "grade": "B",
  "min_marks": 70,
  "max_marks": 79,
  "gpa": 3.0,
  "description": "Good"
}
```

---

#### 7.5 Get Grade by Marks
**Request:**
- Method: `GET`
- URL: `{{baseUrl}}/grades/marks/85`

**Expected Response:** Returns grade "A" for 85 marks

---

#### 7.6 Create Result
**Request:**
- Method: `POST`
- URL: `{{baseUrl}}/results`
- Body:
```json
{
  "student_id": "YOUR_STUDENT_ID_HERE",
  "exam_id": "YOUR_EXAM_ID_HERE",
  "subject_id": "YOUR_SUBJECT_ID_HERE",
  "class_id": "YOUR_CLASS_ID_HERE",
  "marks_obtained": 85,
  "total_marks": 100,
  "grade": "A",
  "gpa": 3.5,
  "remarks": "Good performance"
}
```

---

#### 7.7 Get Student Results
**Request:**
- Method: `GET`
- URL: `{{baseUrl}}/results/student/YOUR_STUDENT_ID`

**Filter by Exam:**
- URL: `{{baseUrl}}/results/student/YOUR_STUDENT_ID?exam_id=YOUR_EXAM_ID`

---

### Step 8: Fee Management

#### 8.1 Create Fee Setup
**Request:**
- Method: `POST`
- URL: `{{baseUrl}}/fee-setups`
- Body:
```json
{
  "fee_head": "Tuition Fee",
  "amount": 5000,
  "class_id": "YOUR_CLASS_ID_HERE",
  "frequency": "monthly",
  "description": "Monthly tuition fee"
}
```
**Save the `_id` as `fee_setup_id`**

---

#### 8.2 Create Fee for Student
**Request:**
- Method: `POST`
- URL: `{{baseUrl}}/fees`
- Body:
```json
{
  "student_id": "YOUR_STUDENT_ID_HERE",
  "fee_setup_id": "YOUR_FEE_SETUP_ID_HERE",
  "amount": 5000,
  "paid_amount": 0,
  "due_amount": 5000,
  "status": "pending",
  "remarks": "Fee for January 2024"
}
```
**Save the `_id` as `fee_id`**

---

#### 8.3 Record Payment
**Request:**
- Method: `PUT`
- URL: `{{baseUrl}}/fees/YOUR_FEE_ID`
- Body:
```json
{
  "paid_amount": 5000,
  "due_amount": 0,
  "payment_date": 1708099200000,
  "status": "paid",
  "remarks": "Full payment received"
}
```

---

#### 8.4 Get Student Fees
**Request:**
- Method: `GET`
- URL: `{{baseUrl}}/fees/student/YOUR_STUDENT_ID`

**Filter by Status:**
- URL: `{{baseUrl}}/fees/student/YOUR_STUDENT_ID?status=pending`

---

### Step 9: Academic Reports

#### 9.1 Create Academic Report
**Request:**
- Method: `POST`
- URL: `{{baseUrl}}/academic-reports`
- Body:
```json
{
  "student_id": "YOUR_STUDENT_ID_HERE",
  "exam_id": "YOUR_EXAM_ID_HERE",
  "subject_id": "YOUR_SUBJECT_ID_HERE",
  "class_id": "YOUR_CLASS_ID_HERE",
  "marks": 85,
  "grade": "A",
  "remarks": "Excellent performance",
  "date": 1708099200000
}
```

---

#### 9.2 Get Student Report Card
**Request:**
- Method: `GET`
- URL: `{{baseUrl}}/academic-reports/student/YOUR_STUDENT_ID`

**Filter by Exam:**
- URL: `{{baseUrl}}/academic-reports/student/YOUR_STUDENT_ID?exam_id=YOUR_EXAM_ID`

---

## 🔄 Common Operations

### Update Operations (PUT)
**Example: Update Student**
- Method: `PUT`
- URL: `{{baseUrl}}/students/YOUR_STUDENT_ID`
- Body:
```json
{
  "phone": "+9876543210",
  "address": "New Address"
}
```

### Delete Operations (DELETE)
**Example: Delete Homework**
- Method: `DELETE`
- URL: `{{baseUrl}}/homework/YOUR_HOMEWORK_ID`

### Pagination
**Example: Get Students with Pagination**
- URL: `{{baseUrl}}/students?page=1&limit=10`

---

## 📊 Testing Workflow

### Recommended Testing Order:
1. ✅ Create Class, Section, Subject
2. ✅ Create Designation, Staff
3. ✅ Create Parent
4. ✅ Create Student
5. ✅ Mark Attendance
6. ✅ Create Class Routine
7. ✅ Create Homework
8. ✅ Create Exam System (Name, Exam, Schedule, Grades)
9. ✅ Create Results
10. ✅ Create Fee Setup and Fees
11. ✅ Create Academic Reports

---

## 🎯 Quick Test Collection

### Import this JSON into Postman:

Save this as `school-api-tests.json` and import into Postman:

```json
{
  "info": {
    "name": "School Management System",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3001/api/v1"
    }
  ]
}
```

---

## 🐛 Troubleshooting

### Server Not Starting?
```bash
# Check if MongoDB is running
# Check .env file for correct MongoDB connection string
```

### Getting 404 Errors?
- Ensure server is running on port 3001
- Check the URL format: `http://localhost:3001/api/v1/...`

### Getting 500 Errors?
- Check MongoDB connection
- Check server logs for detailed error messages
- Ensure all required fields are provided in request body

---

## 📝 Tips

1. **Save IDs**: After creating resources, save their `_id` values to use in subsequent requests
2. **Use Environment Variables**: Store common IDs in Postman environment variables
3. **Test in Order**: Follow the recommended testing order to ensure dependencies are met
4. **Check Response**: Always verify the response structure matches expected format
5. **Use Filters**: Test query parameters to ensure filtering works correctly

---

## ✅ Verification Checklist

- [ ] Server starts successfully
- [ ] Can create a class
- [ ] Can create a student
- [ ] Can mark attendance
- [ ] Can create exam and results
- [ ] Can manage fees
- [ ] All GET endpoints return data
- [ ] All PUT endpoints update data
- [ ] All DELETE endpoints remove data
- [ ] Filtering works correctly
- [ ] Pagination works correctly
