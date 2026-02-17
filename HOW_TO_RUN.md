# 🚀 How to Run the Backend Server on Windows

## Quick Start (3 Steps)

### Step 1: Ensure MongoDB is Running
The backend requires MongoDB. Make sure MongoDB is installed and running on your system.

**Check if MongoDB is running:**
```powershell
# In PowerShell
Get-Process mongod
```

**If not running, start MongoDB:**
```powershell
# Start MongoDB service
net start MongoDB
```

**Or install MongoDB:**
- Download from: https://www.mongodb.com/try/download/community
- Install and start the MongoDB service

---

### Step 2: Configure Environment Variables
The `.env` file has been created with default settings:
```
MONGO_DB_URI=mongodb://localhost:27017/school_management
PORT=3001
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

**If your MongoDB is on a different host/port, edit `.env` file accordingly.**

---

### Step 3: Start the Server

**Option A: Using npm (Recommended)**
```powershell
cd d:/MMS/backend
npm run dev
```

**Option B: Direct node command**
```powershell
cd d:/MMS/backend
$env:NODE_ENV="development"
nodemon app.js
```

**Option C: Using node directly (without nodemon)**
```powershell
cd d:/MMS/backend
node app.js
```

---

## ✅ Success Indicators

When the server starts successfully, you should see:
```
Server started at port : 3001
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module"
**Solution:**
```powershell
npm install
```

### Error: MongoDB Connection Failed
**Solutions:**
1. **Check if MongoDB is running:**
   ```powershell
   Get-Process mongod
   ```

2. **Start MongoDB:**
   ```powershell
   net start MongoDB
   ```

3. **Check MongoDB connection string in `.env`:**
   ```
   MONGO_DB_URI=mongodb://localhost:27017/school_management
   ```

### Error: "Port 3001 already in use"
**Solution:**
```powershell
# Find process using port 3001
netstat -ano | findstr :3001

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Error: "NODE_ENV is not recognized"
**Solution:** The package.json has been updated to use Windows-compatible commands. Just run:
```powershell
npm run dev
```

---

## 🧪 Test the Server

Once running, test with:
```powershell
# In a new terminal
curl http://localhost:3001/api/v1/status
```

Or open in browser: http://localhost:3001/api/v1/status

**Expected response:** `ok`

---

## 📝 Available Scripts

- `npm run dev` - Start development server with auto-reload (Windows)
- `npm start` - Start production server (Windows)
- `npm run dev:unix` - Development server (Linux/Mac)
- `npm run start:unix` - Production server (Linux/Mac)

---

## 🎯 Next Steps

After the server is running:
1. Open Postman
2. Import `School-Management-API.postman_collection.json`
3. Start testing APIs!

See `QUICK_START.md` for Postman testing guide.

---

## 💡 Pro Tips

1. **Keep terminal open**: The server runs in the terminal, keep it open
2. **Auto-reload**: Using `nodemon`, the server auto-restarts on file changes
3. **Check logs**: Watch the terminal for error messages
4. **MongoDB**: Ensure MongoDB is always running before starting the server
