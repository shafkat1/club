# 🧪 TEST CREDENTIALS & OTP BYPASS GUIDE

**Status:** Development Feature Available  
**⚠️ CRITICAL:** This endpoint MUST be removed before production deployment!

---

## 🚀 QUICK TEST LOGIN (DEVELOPMENT ONLY)

### Endpoint
```
POST /api/auth/test-login
```

### Usage in Browser Console

Simply paste this in your browser console and execute:

```javascript
// Option 1: Login with phone
fetch('/api/auth/test-login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phone: '5551234567' })
})
.then(r => r.json())
.then(data => {
  if (data.accessToken) {
    sessionStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    console.log('✅ Logged in! Redirecting to dashboard...');
    window.location.href = '/dashboard';
  }
});

// Option 2: Login with email
fetch('/api/auth/test-login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@example.com' })
})
.then(r => r.json())
.then(data => {
  if (data.accessToken) {
    sessionStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    console.log('✅ Logged in! Redirecting to dashboard...');
    window.location.href = '/dashboard';
  }
});
```

### Response
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400,
  "user": {
    "id": "test_1730307000000",
    "phone": "5551234567",
    "email": "test+1730307000000@desh.co",
    "displayName": "Test Bartender",
    "phoneVerified": true,
    "emailVerified": true,
    "createdAt": "2025-10-30T14:30:00Z"
  }
}
```

---

## 📱 REGULAR OTP FLOW (Production-Ready)

When backend services are properly configured:

### Test Phone Numbers (OTP will be in backend console logs)
```
5551234567
5559876543
2125550100
```

### Steps
1. **Send OTP:**
   ```javascript
   fetch('/api/auth/phone/send-otp', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ phone: '5551234567' })
   })
   ```
   Response: `{ "message": "OTP sent successfully" }`

2. **Check Backend Console for OTP Code**
   - Backend logs will show: `[AUTH] Generated OTP: 123456`
   - Or check Redis: `REDIS_CLIENT.get('otp:phone:5551234567')`

3. **Verify OTP:**
   ```javascript
   fetch('/api/auth/phone/verify-otp', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ 
       phone: '5551234567',
       code: '123456'  // Use code from backend logs
     })
   })
   ```

---

## 🔧 WHY TEST-LOGIN EXISTS

**Current Issue:** Full OTP flow requires:
- ✅ Redis (for storing OTP codes)
- ❌ PostgreSQL (not running locally)
- ❌ Twilio API (SMS service, optional)

**Solution:** `test-login` endpoint allows immediate testing without these dependencies.

---

## ✅ TEST CREDENTIALS (Bypass Method)

### Email-based
```
test@example.com
test+dev@example.com
bartender@test.com
```

### Phone-based
```
5551234567
5559876543
2125550100
+1 (555) 123-4567
```

### Any identifier works!
The test-login endpoint accepts:
- Any phone number
- Any email address
- You'll get a valid JWT token immediately

---

## 🚨 PRODUCTION WARNING

```
⚠️  DO NOT DEPLOY WITH TEST-LOGIN ENDPOINT ⚠️

Before pushing to production:
1. Delete the test-login endpoint from auth.controller.ts
2. Delete the testLogin method from auth.service.ts
3. Remove this file
4. Verify test environment is isolated
```

### Checking for Test-Login:
```bash
grep -r "test-login" backend/src/
grep -r "testLogin" backend/src/
```

If found, remove immediately!

---

## 🎯 NEXT STEPS TO FIX PROPER OTP

To make the full OTP flow work:

1. **Start PostgreSQL:**
   ```bash
   # Docker
   docker run -d -p 5432:5432 postgres:16
   ```

2. **Start Redis:**
   ```bash
   # Docker
   docker run -d -p 6379:6379 redis:latest
   ```

3. **Update .env:**
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/clubapp
   REDIS_URL=redis://localhost:6379
   ```

4. **Run Prisma migrations:**
   ```bash
   cd backend
   npx prisma migrate dev
   ```

5. **Restart backend:**
   ```bash
   npm run start:dev
   ```

Then the full OTP flow will work without test-login!

---

## 📊 Comparison

| Feature | Test-Login | Full OTP |
|---------|-----------|----------|
| Speed | Instant ✅ | 1-2 seconds |
| Security | Dev Only ⚠️ | Production Ready ✅ |
| Requirements | Nothing | Redis + PG |
| User Creation | Mock in Memory | Persisted |
| Token Refresh | Works ✅ | Works ✅ |
| Test Data | Generated | Persistent |

---

## 🔑 JWT TOKEN STRUCTURE

Both test-login and real OTP return the same JWT:

```json
{
  "sub": "user_id_here",
  "phone": "5551234567",
  "email": "user@example.com",
  "iat": 1730307000,
  "exp": 1730393400
}
```

---

**Created:** October 30, 2025  
**Purpose:** Development Testing Only  
**Status:** ⚠️ TEMPORARY - REMOVE BEFORE PRODUCTION
