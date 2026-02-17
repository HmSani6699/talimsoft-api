# 🚀 Quick Start Guide - Testing APIs in Postman

## Step 1: Start the Server

Open terminal in `d:/MMS/backend` and run:
```bash
npm run dev
```

You should see: `Server started at port : 3001`

---

## Step 2: Import Postman Collection

### Option A: Import the Collection File
1. Open Postman
2. Click **Import** button (top left)
3. Select **File** tab
4. Choose: `d:/MMS/backend/School-Management-API.postman_collection.json`
5. Click **Import**

### Option B: Manual Setup
1. Create new collection: "School Management System"
2. Add collection variable:
   - Variable: `baseUrl`
   - Value: `http://localhost:3001/api/v1`

---

## Step 3: Test Your First API

### Create a Class (Simplest Test)

1. **Create New Request** in Postman
2. **Set Method**: `POST`
3. **Set URL**: `http://localhost:3001/api/v1/classes`
4. **Set Headers**:
   - Key: `Content-Type`
   - Value: `application/json`
5. **Set Body** (select "raw" and "JSON"):
```json
{
  "name": "Grade 10",
  "description": "Tenth grade class",
  "capacity": 40
}
```
6. **Click Send**

### ✅ Expected Response:
```json
{
  "success": true,
  "data": {
    "_id": "65abc123def456...",
    "name": "Grade 10",
    "description": "Tenth grade class",
    "capacity": 40,
    "created_at": 1708099200000,
    "updated_at": 1708099200000
  }
}
```

**IMPORTANT**: Copy the `_id` value! You'll need it for other requests.

---

## Step 4: Test GET Request

1. **Create New Request**
2. **Set Method**: `GET`
3. **Set URL**: `http://localhost:3001/api/v1/classes`
4. **Click Send**

You should see the class you just created!

---

## Step 5: Complete Testing Flow

Follow this order to test all features:

### 1️⃣ Create Basic Structure
```
POST /classes          → Save class_id
POST /sections         → Save section_id (use class_id)
POST /subjects         → Save subject_id
POST /designations     → Save designation_id
```

### 2️⃣ Create People
```
POST /staff            → Save staff_id (use designation_id)
POST /parents          → Save parent_id
```

### 3️⃣ Create Student
```
POST /students         → Save student_id (use class_id, section_id, parent_id)
```

### 4️⃣ Test Features
```
POST /attendance/student
POST /homework
POST /class-routines
POST /fees
POST /results
```

---

## 📋 Using Collection Variables

To avoid copying IDs manually:

1. After creating a class, go to **Tests** tab in Postman
2. Add this script:
```javascript
var jsonData = pm.response.json();
pm.collectionVariables.set("class_id", jsonData.data._id);
```
3. Now you can use `{{class_id}}` in other requests!

---

## 🎯 Quick Test Checklist

- [ ] Server is running on port 3001
- [ ] Created a class successfully
- [ ] Retrieved all classes
- [ ] Created a student
- [ ] Marked attendance
- [ ] Created a fee record

---

## 🐛 Common Issues

### ❌ "Cannot GET /api/v1/classes"
**Fix**: Make sure you're using the correct URL format with `/v1/`

### ❌ "ECONNREFUSED"
**Fix**: Server is not running. Start it with `npm run dev`

### ❌ "500 Internal Server Error"
**Fix**: Check MongoDB connection in `.env` file

### ❌ "404 Not Found"
**Fix**: Double-check the endpoint URL

---

## 📖 Full Documentation

- **Detailed Guide**: See `POSTMAN_TESTING_GUIDE.md`
- **API Reference**: See `API_DOCUMENTATION.md`
- **Quick Reference**: See `README.md`

---

## 💡 Pro Tips

1. **Save IDs**: After each POST request, save the returned `_id`
2. **Use Variables**: Store IDs in Postman collection variables
3. **Test in Order**: Create dependencies first (class before student)
4. **Check Responses**: Always verify the response structure
5. **Use Filters**: Test query parameters like `?class_id=xxx`

---

## ✨ Example: Complete Student Creation Flow

```bash
# 1. Create Class
POST /classes
Body: {"name": "Grade 10", "capacity": 40}
→ Save class_id

# 2. Create Section
POST /sections
Body: {"name": "Section A", "class_id": "{{class_id}}", "capacity": 35}
→ Save section_id

# 3. Create Parent
POST /parents
Body: {"father_name": "John Doe", "phone": "+123456"}
→ Save parent_id

# 4. Create Student
POST /students
Body: {
  "name": "Alice",
  "roll_number": "2024001",
  "class_id": "{{class_id}}",
  "section_id": "{{section_id}}",
  "parent_id": "{{parent_id}}"
}
→ Save student_id

# 5. Get Student (with all relations)
GET /students/{{student_id}}
→ See parent, class, and section details!
```

---

## 🎉 You're Ready!

Start testing with the imported collection or follow the detailed guide in `POSTMAN_TESTING_GUIDE.md`
