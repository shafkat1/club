# LOCAL DEVELOPMENT SETUP - Testing Phase 2

**Last Updated:** October 30, 2025  
**Status:** Ready to Test  
**Platforms:** Frontend (Next.js), Backend (NestJS)

---

## 🚀 QUICK START (5 minutes)

### Prerequisites
```bash
# Required
Node.js 18+ (check: node --version)
npm 9+ (check: npm --version)
PostgreSQL running (for backend)
```

### Step 1: Start Backend (Terminal 1)
```bash
cd C:\ai4\desh\club\backend

# Install dependencies
npm install

# Start development server
npm run start:dev

# Expected output:
# ✅ Server running on http://localhost:3000
```

### Step 2: Start Frontend (Terminal 2)
```bash
cd C:\ai4\desh\club\web

# Install dependencies
npm install --legacy-peer-deps

# Create .env.local
echo NEXT_PUBLIC_API_URL=http://localhost:3000/api > .env.local

# Start development server
npm run dev

# Expected output:
# ✅ Next.js ready at http://localhost:3000
```

### Step 3: Access Application
```
Frontend: http://localhost:3000
Backend API: http://localhost:3000/api
```

---

## 📋 DETAILED SETUP GUIDE

### PART 1: BACKEND SETUP (NestJS)

#### 1.1 Check Backend Status
```bash
cd C:\ai4\desh\club\backend

# Verify Node.js version
node --version  # Should be 18+

# Verify npm
npm --version
```

#### 1.2 Install Dependencies
```bash
# Clean install
rm -r node_modules package-lock.json  # (or delete manually)

# Install with exact versions
npm install

# Verify key packages installed
npm list axios zustand dotenv
```

#### 1.3 Configure Environment
```bash
# Check if .env exists
cat .env  # or type .env (Windows)

# Required .env variables:
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/clubapp
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-here
API_URL=http://localhost:3000
```

#### 1.4 Setup Database
```bash
# Ensure PostgreSQL is running
# Windows: Services > PostgreSQL should be "Running"

# Run migrations
npm run migrate

# Seed data (if available)
npm run seed
```

#### 1.5 Start Backend Development Server
```bash
npm run start:dev

# Expected output:
```
[Nest] 12345 - 10/30/2025, 3:00:00 PM     LOG [NestFactory] Starting Nest application...
[Nest] 12345 - 10/30/2025, 3:00:05 PM     LOG [InstanceLoader] AppModule dependencies initialized
[Nest] 12345 - 10/30/2025, 3:00:10 PM     LOG Server listening on port 3000
✅ Backend ready at http://localhost:3000
```

**Backend Health Check:**
```bash
curl http://localhost:3000/api/health
# Response: { "status": "ok" }
```

---

### PART 2: FRONTEND SETUP (Next.js)

#### 2.1 Install Dependencies
```bash
cd C:\ai4\desh\club\web

# Clean install
rm -r node_modules package-lock.json  # or delete manually

# Install with legacy peer deps (required for @zxing)
npm install --legacy-peer-deps

# Verify key packages
npm list next react zustand axios
```

#### 2.2 Configure Environment Variables
```bash
# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NODE_ENV=development
EOF

# Verify file created
type .env.local
```

#### 2.3 Build Check
```bash
# Type check
npm run type-check

# Should output:
# ✅ No type errors

# Lint check
npm run lint

# Should output:
# ✅ No linting errors
```

#### 2.4 Start Frontend Development Server
```bash
npm run dev

# Expected output:
```
  ▲ Next.js 14.0.0
  - Local:        http://localhost:3000
  - Environments: .env.local

✅ Ready in 5.2s
```

---

## 🌐 TESTING THE IMPLEMENTATION

### Test 1: Login Flow

**URL:** http://localhost:3000/login

**Test Case:**
```
1. Navigate to http://localhost:3000/login
2. Enter test credentials:
   - Email: bartender@example.com
   - Password: password123
3. Click "Login"
4. Expected: Redirect to http://localhost:3000/dashboard
```

**Console Output Should Show:**
```
🔐 Attempting login...
✅ Login successful, redirecting...
```

**API Call Made:**
```
POST http://localhost:3000/api/auth/login
Body: {
  email: "bartender@example.com",
  password: "password123"
}
```

---

### Test 2: Dashboard Page

**URL:** http://localhost:3000/dashboard

**Test Case:**
```
1. After successful login, dashboard should load
2. Should show:
   - Welcome message with user name
   - 3 stat cards (Total Orders, Redeemed Today, Pending)
   - Quick action buttons
   - Navigation sidebar
```

**Console Output Should Show:**
```
📊 Loading dashboard data...
✅ Loaded X orders
```

**API Calls Made:**
```
GET http://localhost:3000/api/orders
```

---

### Test 3: Orders Page

**URL:** http://localhost:3000/dashboard/orders

**Test Case:**
```
1. Click "Orders" in sidebar
2. Should show list of orders with:
   - Order ID
   - Status (color-coded)
   - Amount
   - Creation date
3. Test filters:
   - Click "Pending" button
   - Click "Accepted" button
   - Click "All" button
```

**Console Output Should Show:**
```
📋 Loading orders with filter: pending...
✅ Loaded X orders
```

**API Calls Made:**
```
GET http://localhost:3000/api/orders?status=PENDING
GET http://localhost:3000/api/orders?status=ACCEPTED
GET http://localhost:3000/api/orders
```

---

### Test 4: QR Scanner Page

**URL:** http://localhost:3000/dashboard/scan

**Test Case:**
```
1. Click "QR Scanner" in sidebar
2. Click "▶ Start Scanning"
3. Should request camera access
4. Once camera enabled:
   - Point at QR code
   - Should automatically detect and process
5. Expected: Success alert shows "✅ Redeemed: [item name]"
```

**Console Output Should Show:**
```
📱 Starting QR scanner...
🔄 Processing QR code...
✅ Redemption successful: {result}
```

**API Calls Made:**
```
POST http://localhost:3000/api/redemptions/scan
Body: { qrCode: "code-from-qr" }
```

---

### Test 5: Profile Page

**URL:** http://localhost:3000/dashboard/profile

**Test Case:**
```
1. Click "Profile" in sidebar
2. Should show:
   - Display name
   - Email (read-only)
   - Account creation date
3. Click "✏️ Edit Profile"
4. Change display name
5. Click "Save Changes"
6. Expected: Success alert "Profile updated successfully!"
```

**Console Output Should Show:**
```
💾 Updating profile...
✅ Profile updated successfully
```

**API Calls Made:**
```
PUT http://localhost:3000/api/profile
Body: { displayName: "New Name" }
```

---

### Test 6: Logout

**Test Case:**
```
1. Click "🚪 Logout" button
2. Expected: Redirect to http://localhost:3000/login
3. Browser storage should be cleared
```

**Console Output Should Show:**
```
🚪 Logging out...
✅ Logged out successfully
```

---

## 🔍 DEBUGGING

### View Network Requests
**Browser DevTools:**
```
1. Press F12 to open DevTools
2. Go to "Network" tab
3. Try any action (login, fetch data)
4. All API calls will appear with:
   - Method (GET, POST, PUT)
   - URL
   - Status code (200, 401, 500, etc.)
   - Response time
   - Response body
```

### View Console Logs
**Browser DevTools:**
```
1. Press F12 to open DevTools
2. Go to "Console" tab
3. Look for console.log messages (with emoji prefixes):
   - 🔐 Auth operations
   - 📊 Dashboard loading
   - 📋 Orders loading
   - 📱 Scanner operations
   - 💾 Profile updates
```

### Check API Health
```bash
# Terminal
curl http://localhost:3000/api/health

# Response should be:
{ "status": "ok" }
```

### View Backend Logs
```bash
# Already running in your backend terminal
# Look for:
- ✅ POST /auth/login
- ✅ GET /orders
- ✅ PUT /profile
- ✅ POST /redemptions/scan
```

---

## 🚨 TROUBLESHOOTING

### Issue: "Cannot connect to localhost:3000"

**Solution:**
```bash
# Check if backend is running
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Mac/Linux

# If not running, restart backend
cd backend
npm run start:dev
```

### Issue: "CORS error" in browser console

**Solution:**
```
The backend should have CORS enabled for http://localhost:3000
Check backend/src/main.ts for:
```typescript
app.enableCors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
})
```
```

### Issue: "NEXT_PUBLIC_API_URL not set"

**Solution:**
```bash
# Create .env.local in /web directory
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3000/api
EOF

# Restart Next.js
# Kill current process (Ctrl+C)
# Run npm run dev again
```

### Issue: "Cannot find module" error

**Solution:**
```bash
# Clean reinstall
rm -r node_modules package-lock.json

# Reinstall
npm install --legacy-peer-deps

# Clear Next.js cache
rm -r .next

# Restart dev server
npm run dev
```

### Issue: "Login fails with 401 Unauthorized"

**Solution:**
```
1. Check backend is running: curl http://localhost:3000/api/health
2. Verify user exists in database
3. Check credentials are correct
4. Look at backend logs for error message
5. Check NEXT_PUBLIC_API_URL is set correctly
```

### Issue: "API calls failing - Connection refused"

**Solution:**
```bash
# Check backend is running
ps aux | grep "node"  # or use Task Manager on Windows

# Check port 3000 is not blocked
netstat -ano | findstr :3000  # Windows

# Restart backend
cd backend
npm run start:dev
```

---

## 📊 EXPECTED TEST RESULTS

### ✅ All Tests Should Pass

| Test | Status | Notes |
|------|--------|-------|
| Login | ✅ | Redirect to /dashboard |
| Dashboard | ✅ | Stats display correctly |
| Orders Filter | ✅ | All filters work |
| Scanner | ✅ | Camera access requested |
| Profile Edit | ✅ | Update saves successfully |
| Logout | ✅ | Redirect to /login |

---

## 🎯 DEVELOPMENT WORKFLOW

### Daily Workflow
```bash
# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: Frontend
cd web
npm run dev

# Terminal 3: Monitoring (optional)
watch -n 1 'curl -s http://localhost:3000/api/health'
```

### Making Changes

**Backend Changes:**
```bash
# Edit backend files
# Server auto-reloads with npm run start:dev
# No restart needed (HMR enabled)
```

**Frontend Changes:**
```bash
# Edit frontend files in /web
# Browser auto-refreshes (HMR enabled)
# No restart needed
```

---

## 📱 TESTING ON MOBILE (Optional)

### Access from Mobile Device

**On the same network:**
```
# Get your computer's IP
ipconfig getifaddr en0  # Mac
hostname -I             # Linux
ipconfig                # Windows (look for IPv4 Address)

# On mobile, open:
http://192.168.1.100:3000  # Replace with your IP
```

**With Android Emulator:**
```bash
# If using Android emulator, use:
http://10.0.2.2:3000
```

---

## 🔐 TEST CREDENTIALS

### Default Test User
```
Email: bartender@example.com
Password: password123
```

### Create Additional Test Users
```bash
# Backend script to create users
npm run seed:user -- --email test@example.com --password test123
```

---

## ✅ VERIFICATION CHECKLIST

Before testing, verify:

- [ ] Node.js 18+ installed (`node --version`)
- [ ] PostgreSQL running
- [ ] Backend dependencies installed (`npm install` in /backend)
- [ ] Frontend dependencies installed (`npm install --legacy-peer-deps` in /web)
- [ ] Backend running (`npm run start:dev` in backend)
- [ ] Frontend running (`npm run dev` in web)
- [ ] .env.local created in /web with NEXT_PUBLIC_API_URL
- [ ] Can access http://localhost:3000
- [ ] Can access http://localhost:3000/api/health
- [ ] Browser DevTools open (F12) for debugging

---

## 📞 SUPPORT

### Common Issues
See **Troubleshooting** section above

### Getting Help
```
1. Check browser console for errors (F12)
2. Check backend terminal for logs
3. Check network requests (DevTools → Network tab)
4. Review error messages with emojis for context
5. Check backend is returning correct responses
```

---

## 🎉 YOU'RE READY TO TEST!

**Steps to start testing right now:**

1. Open Terminal 1
```bash
cd C:\ai4\desh\club\backend
npm install
npm run start:dev
```

2. Open Terminal 2
```bash
cd C:\ai4\desh\club\web
npm install --legacy-peer-deps
echo NEXT_PUBLIC_API_URL=http://localhost:3000/api > .env.local
npm run dev
```

3. Open Browser
```
http://localhost:3000
```

4. Test Login
```
Email: bartender@example.com
Password: password123
```

---

**Status:** 🟢 Ready to Test Locally  
**Estimated Setup Time:** 10-15 minutes  
**All Phase 2 Components:** Ready for testing  
**CI/CD Pipeline:** Can deploy anytime
