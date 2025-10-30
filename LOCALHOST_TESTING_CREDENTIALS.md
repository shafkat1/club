# 🧪 LOCALHOST TESTING - DUMMY CREDENTIALS & SETUP

**Updated:** October 30, 2025  
**Status:** Ready for Testing ✅

---

## ⚡ QUICK START (5 MINUTES)

### Prerequisites:
```bash
# 1. Kill any process using port 3000
# Windows (PowerShell):
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Or use Task Manager to end the process

# 2. Make sure you have node_modules installed
cd backend && npm install
cd ../web && npm install --legacy-peer-deps
```

### Start Servers:

**Terminal 1 - Backend:**
```bash
cd C:\ai4\desh\club\backend
npm run start:dev
```

Expected output:
```
🚀 Server running on http://localhost:3000
📚 API docs: http://localhost:3000/api/docs
```

**Terminal 2 - Frontend:**
```bash
cd C:\ai4\desh\club\web
npm run dev
```

Expected output:
```
▲ Next.js 14.0.0
  - Local:        http://localhost:3000
  - Environments: .env.local
```

### Access Frontend:
```
http://localhost:3000/login
```

---

## 📱 DUMMY TEST CREDENTIALS

### Option 1: Use Test Phone Numbers (For OTP Testing)

Since the backend uses **OTP-based authentication**, you need valid phone numbers. The backend will generate OTP codes that appear in the console logs.

#### Test Phone Numbers:
```
+1 (555) 123-4567    ← Use this
+1 (555) 987-6543    ← Or this
+1 (212) 555-0100    ← Or this
```

#### OTP Testing Flow:

**Step 1: In Browser (Frontend)**
```
Login Page → Phone Entry
Enter: +1 (555) 123-4567
Click: "📱 Send OTP"
```

**Step 2: Check Backend Console**
```
Look for OTP code in backend logs:
[AUTH] Generated OTP: 123456  (example)
```

**Step 3: Back in Browser**
```
OTP Entry Screen
Enter: 123456 (from backend logs)
Click: "✅ Verify & Login"
```

**Step 4: Success!**
```
✅ Redirected to dashboard
✅ See welcome message & stats
✅ Can access all features
```

---

## 🗄️ DATABASE USERS (Once Backend Connected)

If you want to create real test users in the database:

### Using Prisma Studio:
```bash
cd backend
npx prisma studio
```

Then create users manually with:
- **phone:** +1 (555) 123-4567
- **displayName:** Test Bartender
- **phoneVerified:** true

### Or Use SQL Script:

Save this as `create_test_users.sql`:

```sql
-- Create test user
INSERT INTO "User" (id, phone, email, "displayName", "phoneVerified", "emailVerified", "createdAt", "updatedAt")
VALUES (
  'test_user_001',
  '+1 (555) 123-4567',
  'bartender@test.com',
  'Test Bartender',
  true,
  true,
  NOW(),
  NOW()
);

-- Create another test user
INSERT INTO "User" (id, phone, email, "displayName", "phoneVerified", "emailVerified", "createdAt", "updatedAt")
VALUES (
  'test_user_002',
  '+1 (555) 987-6543',
  'manager@test.com',
  'Test Manager',
  true,
  true,
  NOW(),
  NOW()
);
```

---

## 🔧 TROUBLESHOOTING

### Issue 1: Port 3000 Already In Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# PowerShell (Windows)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Or find and kill process manually in Task Manager
```

### Issue 2: localStorage is not defined

**Error:**
```
ReferenceError: localStorage is not defined
```

**Solution:** ✅ FIXED!
- Already patched in `api-client.ts`
- Now checks for `typeof window !== 'undefined'` before accessing storage

### Issue 3: Backend Returns 404 on OTP Endpoint

**Error:**
```
POST /auth/phone/send-otp 404
```

**Possible Causes:**
1. Backend not running (check for errors in backend console)
2. Port conflict (another process on 3000)
3. NestJS modules not loaded

**Solutions:**
```bash
# 1. Kill port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# 2. Clear NestJS cache
rm -r backend/dist
rm -r backend/.next

# 3. Restart backend
cd backend
npm run start:dev
```

### Issue 4: Database Connection Failed

**Warning in Logs:**
```
Can't reach database server at `localhost:5432`
```

**Note:** This is OK for testing OTP. The OTP flow doesn't require database.

**To fix:**
- Start PostgreSQL service
- Or skip OTP testing until database is available

### Issue 5: Frontend Shows 500 Error

**Error:**
```
GET /login 500
```

**Solution:**
- Reload page (Ctrl+F5 or Cmd+Shift+R)
- Check browser console for errors
- Check that localStorage fix is applied

---

## ✅ TESTING CHECKLIST

Use this checklist to test the complete OTP flow:

### Phase 1: UI Loading
- [ ] Frontend loads at http://localhost:3000/login
- [ ] Login page displays beautifully
- [ ] Phone input field is visible
- [ ] "📱 Send OTP" button is visible

### Phase 2: Phone Entry
- [ ] Enter phone: +1 (555) 123-4567
- [ ] Button becomes enabled
- [ ] Click "📱 Send OTP"
- [ ] See loading spinner

### Phase 3: OTP Generation
- [ ] Check backend console for OTP code
- [ ] Look for: `[AUTH] OTP sent: 123456` or similar
- [ ] Write down the OTP code

### Phase 4: OTP Entry
- [ ] Frontend switches to OTP entry screen
- [ ] Shows phone number: "+1 (555) 123-4567"
- [ ] OTP input field accepts 6 digits only
- [ ] Enter OTP code from backend

### Phase 5: Login Success
- [ ] Click "✅ Verify & Login"
- [ ] See loading spinner
- [ ] Redirect to dashboard
- [ ] Welcome message displays
- [ ] Stats cards show (if database connected)

### Phase 6: Dashboard Features
- [ ] Navigate to "Orders" tab
- [ ] Navigate to "QR Scanner" tab
- [ ] Navigate to "Profile" tab
- [ ] Click "Logout"
- [ ] Redirect back to login page

---

## 🎯 TESTING SCENARIOS

### Scenario 1: Happy Path (Successful Login)
```
1. Open http://localhost:3000/login
2. Enter: +1 (555) 123-4567
3. Click: Send OTP
4. Copy OTP from backend logs
5. Enter OTP in frontend
6. Click: Verify & Login
✅ Result: Dashboard loads successfully
```

### Scenario 2: Invalid OTP
```
1. Send OTP to: +1 (555) 123-4567
2. Enter WRONG code: 000000
3. Click: Verify & Login
✅ Result: Error message appears
```

### Scenario 3: Resend OTP
```
1. Send OTP to: +1 (555) 123-4567
2. Wait 5 seconds
3. Click: "📤 Resend OTP"
✅ Result: New OTP generated, timer resets
```

### Scenario 4: Change Phone
```
1. Send OTP to: +1 (555) 123-4567
2. Click: "← Change Phone Number"
3. Enter different phone: +1 (555) 987-6543
4. Click: Send OTP
✅ Result: OTP sent to new number
```

### Scenario 5: Logout & Re-login
```
1. Login successfully
2. Go to Profile
3. Click "🚪 Logout"
4. Login again with same number
✅ Result: Can login multiple times
```

---

## 🔍 DEBUGGING WITH BROWSER DEVTOOLS

### Check Network Requests:
1. Open DevTools: **F12**
2. Go to **Network** tab
3. Filter by **XHR/Fetch**
4. Trigger OTP send
5. Click on `POST /auth/phone/send-otp`
6. Check:
   - **Status:** Should be 200 or 201
   - **Request:** Should have phone number
   - **Response:** Should have message

### Check Console Logs:
1. Open DevTools: **F12**
2. Go to **Console** tab
3. Look for:
   - ✅ `📱 Sending OTP to +1 (555) 123-4567...`
   - ✅ `🔐 Verifying OTP...`
   - ❌ `API Error [404]:`

### Check Application Storage:
1. Open DevTools: **F12**
2. Go to **Application** tab
3. Check **Local Storage**:
   - After login: Should have `refreshToken`
4. Check **Session Storage**:
   - After login: Should have `accessToken`

---

## 📊 EXPECTED BACKEND LOGS

When testing OTP flow, you should see:

```
[LOG] 📱 Sending OTP to +1 (555) 123-4567...
[LOG] [AUTH] Generated OTP for +1 (555) 123-4567: 123456
[LOG] 📱 OTP sent successfully

// When verifying:
[LOG] 🔐 Verifying OTP for +1 (555) 123-4567 with code: 123456
[LOG] ✅ OTP verified successfully
[LOG] 🔑 JWT tokens generated
[LOG] 🚀 User authenticated: +1 (555) 123-4567
```

---

## 📝 CREDENTIALS SUMMARY TABLE

| Type | Value | Usage |
|------|-------|-------|
| Phone #1 | +1 (555) 123-4567 | Primary test phone |
| Phone #2 | +1 (555) 987-6543 | Secondary test phone |
| Phone #3 | +1 (212) 555-0100 | Tertiary test phone |
| OTP | From backend logs | Generated per request |
| Dashboard URL | http://localhost:3000/dashboard | After successful login |
| Backend Swagger | http://localhost:3000/api/docs | View all endpoints |

---

## 🎨 UI PREVIEW

### Step 1: Phone Entry
```
┌──────────────────────────────────┐
│         Desh                     │
│     Bartender Portal             │
│                                  │
│ Enter your phone number to       │
│ receive OTP                      │
│                                  │
│ Phone Number                     │
│ [+1 (555) 123-4567............]  │
│                                  │
│ [📱 Send OTP                    ]│
└──────────────────────────────────┘
```

### Step 2: OTP Entry
```
┌──────────────────────────────────┐
│         Desh                     │
│     Bartender Portal             │
│                                  │
│ Enter the OTP code sent to your  │
│ phone                            │
│                                  │
│ Sent to +1 (555) 123-4567       │
│ [1][2][3][4][5][6]              │
│                                  │
│ [✅ Verify & Login             ]│
│ [📤 Resend OTP in 60s         ]  │
│ [← Change Phone Number        ]  │
└──────────────────────────────────┘
```

---

## 🚀 NEXT STEPS AFTER LOGIN

Once you successfully login and see the dashboard:

1. ✅ Test QR Scanner
   - Go to "QR Scanner" tab
   - Check if camera access works

2. ✅ Test Orders List
   - Go to "Orders" tab
   - View sample orders

3. ✅ Test Profile
   - Go to "Profile" tab
   - Edit display name
   - Check save functionality

4. ✅ Test Logout
   - Go back to Profile
   - Click "🚪 Logout"
   - Verify redirect to login

5. ✅ Test OAuth (Coming Next)
   - Login with Google
   - Login with Facebook

---

## 📞 SUPPORT

### If Tests Fail:

1. **Check backend console** for errors
2. **Check frontend console** (F12 → Console tab)
3. **Check network requests** (F12 → Network tab)
4. **Verify port 3000 is free** (kill any process on 3000)
5. **Clear browser cache** (Ctrl+Shift+Delete)
6. **Restart both servers** and try again

---

## ✨ READY TO TEST!

Everything is now set up and ready. Use the credentials and steps above to test the complete OTP authentication flow.

**Good luck! 🎉**

Last Updated: October 30, 2025
