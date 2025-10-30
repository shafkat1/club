# ✅ READY TO TEST - Complete Guide

**Last Updated:** October 30, 2025  
**Status:** ✅ Frontend & Backend Running - Ready for Testing

---

## 🚀 ACCESS INFORMATION

### URLs
| Component | URL | Port |
|-----------|-----|------|
| **Frontend (Web)** | http://localhost:3000 | 3000 |
| **Backend API** | http://localhost:3001 | 3001 |
| **API Docs** | http://localhost:3001/api/docs | 3001 |

### Frontend Features  Ready
✅ **Login Page** - OTP-based authentication  
✅ **Dashboard** - View statistics and quick actions  
✅ **Orders Page** - Browse and filter orders  
✅ **QR Scanner** - Scan codes for redemption  
✅ **Profile Page** - View and edit user info  
✅ **Logout** - Securely end session  

---

## 🔑 TEST CREDENTIALS

### Option 1: OTP-Based Login (Full Flow)
**Phone Numbers:**
```
5551234567
5559876543
2125550100
+1 (555) 123-4567
```

**Steps:**
1. Go to http://localhost:3000/login
2. Enter any phone number from above
3. Click "📱 Send OTP"
4. Check backend console for OTP code (6 digits)
5. Enter OTP and click "✅ Verify & Login"

### Option 2: Direct Token Access (Test-Login - DEV ONLY)
**Use the browser console to bypass OTP completely:**

```javascript
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
    window.location.href = '/dashboard';
  }
});
```

**Result:** Instant login, redirected to dashboard

---

## 📋 WHAT TO TEST

### 1. **Login Flow**
- [ ] Phone number input validation
- [ ] OTP sending
- [ ] OTP entry
- [ ] Token generation
- [ ] Successful redirect to dashboard

### 2. **Dashboard Page**
- [ ] Displays "Welcome back" message with user name
- [ ] Shows 3 stat cards (Total Orders, Redeemed Today, Pending Orders)
- [ ] Quick action buttons work
- [ ] Navigation sidebar functional

### 3. **Orders Page**
- [ ] Lists orders from backend
- [ ] Filter buttons work (All, Pending, Accepted, Redeemed)
- [ ] Order cards display correctly
- [ ] Status badges show correct colors

### 4. **QR Scanner**
- [ ] Camera permission request shows
- [ ] Camera feed displays
- [ ] Start/Stop scanning works
- [ ] Scanner processes codes
- [ ] Success messages appear

### 5. **Profile Page**
- [ ] Displays current user info
- [ ] Shows verified email checkmark
- [ ] Edit profile button works
- [ ] Display name can be updated
- [ ] Logout button functional

### 6. **Navigation**
- [ ] Sidebar links work
- [ ] Mobile hamburger menu works
- [ ] Active route highlighting
- [ ] Protected routes redirect to login

---

## 🔧 BACKEND ENDPOINTS AVAILABLE

### Authentication
```
POST   /api/auth/phone/send-otp       - Send OTP to phone
POST   /api/auth/phone/verify-otp     - Verify OTP and get tokens
POST   /api/auth/test-login            - DEV: Instant login (no OTP)
POST   /api/auth/refresh-token         - Refresh JWT token
GET    /api/auth/me                    - Get current user (protected)
```

### Users
```
GET    /api/users/me                   - Get current user profile (protected)
PATCH  /api/users/me                   - Update user profile (protected)
```

### Orders
```
GET    /api/orders                     - List orders (protected)
POST   /api/orders                     - Create order (protected)
GET    /api/orders/:id                 - Get order details (protected)
```

### Redemptions
```
POST   /api/redemptions/scan           - Redeem by scanning QR code (protected)
```

### Health
```
GET    /api/health                     - Backend health check
```

---

## 📝 EXAMPLE REQUESTS

### Test Login (OTP Bypass)
```bash
curl -X POST http://localhost:3001/api/auth/test-login \
  -H "Content-Type: application/json" \
  -d '{"phone": "5551234567"}'
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400,
  "user": {
    "id": "test_1730391000000",
    "phone": "5551234567",
    "email": "test+1730391000000@desh.co",
    "displayName": "Test Bartender",
    "phoneVerified": true,
    "emailVerified": true
  }
}
```

### Get User Profile (Authenticated)
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Orders (Authenticated)
```bash
curl -X GET http://localhost:3001/api/orders \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🚨 KNOWN ISSUES & SOLUTIONS

### Issue: "Cannot POST /api/auth/test-login"
**Solution:** Backend compilation cache. Kill Node, rebuild, restart.
```bash
taskkill /F /IM node.exe
cd backend && npm run build
npm run start:prod
```

### Issue: localStorage errors in console
**Solution:** This is normal for Next.js SSR. The app still works client-side.

### Issue: 404 on API endpoints
**Solution:** Ensure backend is running on port 3001.
```bash
netstat -ano | findstr :3001
```

### Issue: OTP not appearing
**Solution:** Check backend console logs when "Send OTP" is clicked.

---

## 📚 DOCUMENTATION FILES

- `TEST_CREDENTIALS_AND_BYPASS.md` - Detailed OTP testing guide
- `LOCALHOST_TESTING_ISSUES_AND_FIXES.md` - Common issues & solutions
- `API_ENDPOINT_MAPPING_CHECKLIST.md` - All available endpoints
- `AUTHENTICATION_INTEGRATION_GUIDE.md` - Auth architecture details
- `LOCAL_DEVELOPMENT_SETUP.md` - Full setup instructions
- `PHASE_2_COMPONENT_MIGRATION.md` - Component details

---

## ✅ DEPLOYMENT STATUS

| Component | Status | Location |
|-----------|--------|----------|
| Frontend Code | ✅ Ready | `/web` |
| Backend Code | ✅ Ready | `/backend` |
| API Integration | ✅ Complete | `web/utils/api-client.ts` |
| Auth System | ✅ Integrated | `web/store/authStore.ts` |
| CI/CD Pipelines | ✅ Configured | `.github/workflows/` |
| Environment Config | ✅ Created | `backend/.env` |
| Proxying Setup | ✅ Working | `web/next.config.js` |

---

## 🎯 NEXT STEPS

1. **Test the UI** - Navigate all pages, check styling
2. **Test Authentication** - Try OTP login flow
3. **Test API Integration** - Check if orders/data load
4. **Test Browser Console** - Use test-login for quick testing
5. **Report Issues** - Document any errors

---

## 🔗 QUICK LINKS

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001
- **API Docs:** http://localhost:3001/api/docs
- **GitHub:** Check `.github/workflows/` for CI/CD

---

## 📞 TROUBLESHOOTING

**Backend not responding?**
```powershell
# Check if running on 3001
netstat -ano | findstr :3001

# Check logs
Get-Process node* | Format-Table Id, ProcessName, Handles

# Restart
taskkill /F /IM node.exe
cd backend
npm run start:prod
```

**Frontend stuck?**
```powershell
# Clear .next cache
cd web
rm -r .next

# Restart
npm run dev
```

**Want clean slate?**
```powershell
# Kill all
taskkill /F /IM node.exe

# Clean and restart
cd backend && npm run build
cd web && rm -r .next

# Start both
# Terminal 1: cd backend && npm run start:prod
# Terminal 2: cd web && npm run dev
```

---

**Ready? Start at:** http://localhost:3000/login  
**Test Phone:** 5551234567  
**Browser Console Bypass:** See OTP section above
