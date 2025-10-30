# 🧪 TESTING QUICK REFERENCE - ONE PAGE

**Last Updated:** October 30, 2025

---

## ⚡ 5-MINUTE QUICK START

### 1. Kill Port 3000 (PowerShell)
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

### 2. Start Backend (Terminal 1)
```bash
cd C:\ai4\desh\club\backend
npm run start:dev
```
✅ Wait for: `🚀 Server running on http://localhost:3000`

### 3. Start Frontend (Terminal 2)
```bash
cd C:\ai4\desh\club\web
npm run dev
```
✅ Wait for: `▲ Next.js 14.0.0 - Local: http://localhost:3000`

### 4. Open Browser
```
http://localhost:3000/login
```

---

## 📱 TEST CREDENTIALS

| Item | Value |
|------|-------|
| Phone #1 | `+1 (555) 123-4567` |
| Phone #2 | `+1 (555) 987-6543` |
| OTP Code | Check backend console logs |

---

## 🔐 OTP LOGIN FLOW (3 STEPS)

### Step 1️⃣ Enter Phone
```
URL: http://localhost:3000/login
Input: +1 (555) 123-4567
Click: "📱 Send OTP"
Wait: Loading spinner
```

### Step 2️⃣ Copy OTP from Backend Console
```
Backend logs show:
[AUTH] Generated OTP: 123456  ← Copy this number
```

### Step 3️⃣ Enter OTP & Login
```
OTP Input: 123456 (from backend)
Click: "✅ Verify & Login"
Result: Dashboard loads ✅
```

---

## ✅ CHECKLIST

- [ ] Port 3000 killed
- [ ] Backend running (check for 🚀 message)
- [ ] Frontend running (check for ▲ Next.js)
- [ ] Browser loads http://localhost:3000/login
- [ ] Phone input accepts: +1 (555) 123-4567
- [ ] "Send OTP" button works
- [ ] Backend console shows OTP code
- [ ] OTP input accepts digits
- [ ] Login successful → Dashboard
- [ ] Dashboard shows welcome message

---

## 🐛 QUICK FIXES

### Port 3000 Already In Use?
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

### Frontend Shows Error?
- Reload: `Ctrl+F5`
- Clear cache: `Ctrl+Shift+Delete`

### No OTP in Backend Console?
- Check backend started successfully
- Look for `🚀 Server running` message
- If missing, restart backend

### 404 Error on OTP?
- Kill and restart backend
- Clear `backend/dist` folder
- Check port 3000 is free

---

## 🔍 DEBUGGING

**Open DevTools:** `F12`

| Tab | What to Check |
|-----|---|
| Console | Look for `📱 Sending OTP...` |
| Network | POST `/auth/phone/send-otp` should be 200 |
| Application | After login, check `refreshToken` in Local Storage |

---

## 📊 WHAT WORKS NOW ✅

- ✅ Beautiful 2-step OTP login UI
- ✅ Phone number validation
- ✅ Real-time OTP input (digits only)
- ✅ Resend OTP timer (60 seconds)
- ✅ Change phone number option
- ✅ Error alerts
- ✅ Loading spinners
- ✅ localStorage SSR fix

---

## ⏳ WHAT'S NEXT

After successful login:
1. Test QR Scanner (camera access?)
2. Test Orders list (with real data?)
3. Test Profile page (edit name?)
4. Test Logout (redirect to login?)
5. OAuth testing (Google/Facebook?)

---

## 📞 NEED HELP?

| Problem | Solution |
|---------|----------|
| Port in use | Kill process on 3000 |
| localStorage error | ✅ Fixed in latest commit |
| Frontend 500 error | Reload page (Ctrl+F5) |
| No OTP in console | Restart backend |
| Phone not accepting | Use format: +1 (555) 123-4567 |

---

**STATUS:** Ready for Testing! 🚀
