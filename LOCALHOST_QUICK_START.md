# 🚀 LOCALHOST TESTING - QUICK START

## Copy & Paste Commands

### Terminal 1: Backend (NestJS)
```bash
cd C:\ai4\desh\club\backend
npm install
npm run start:dev
```

✅ **Expected:** `Server listening on port 3000`

---

### Terminal 2: Frontend (Next.js)
```bash
cd C:\ai4\desh\club\web
npm install --legacy-peer-deps
echo NEXT_PUBLIC_API_URL=http://localhost:3000/api > .env.local
npm run dev
```

✅ **Expected:** `▲ Next.js ready at http://localhost:3000`

---

## 🌐 Access Points

| URL | Purpose |
|-----|---------|
| `http://localhost:3000` | Frontend Application |
| `http://localhost:3000/login` | Login Page |
| `http://localhost:3000/dashboard` | Dashboard |
| `http://localhost:3000/api` | API Base |
| `http://localhost:3000/api/health` | Health Check |

---

## 🔐 Test Credentials

```
Email:    bartender@example.com
Password: password123
```

---

## ✅ What to Test

### 1. Login
- Go to: `http://localhost:3000/login`
- Enter credentials above
- Should redirect to `/dashboard`

### 2. Dashboard
- Should show 3 stat cards
- Stats come from `GET /api/orders`

### 3. Orders
- Click "Orders" in sidebar
- Test "Pending" / "Accepted" filters
- API calls: `GET /api/orders?status=PENDING`

### 4. QR Scanner
- Click "QR Scanner"
- Click "▶ Start Scanning"
- Point at QR code
- API call: `POST /api/redemptions/scan`

### 5. Profile
- Click "Profile"
- Edit display name
- Save changes
- API call: `PUT /api/profile`

### 6. Logout
- Click "🚪 Logout"
- Should redirect to `/login`

---

## 🔍 Browser DevTools (F12)

### Network Tab
- See all API calls
- Status codes (200, 401, etc)
- Response times
- Request/response bodies

### Console Tab
- Look for emoji-prefixed logs
- 🔐 = Auth operations
- 📊 = Dashboard loading
- 📋 = Orders loading
- 📱 = Scanner
- 💾 = Profile updates

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't connect to localhost | Check backend is running (`npm run start:dev`) |
| CORS error | Check CORS enabled in backend |
| API URL not set | Create `.env.local` in `/web` directory |
| Port 3000 in use | Kill process: `netstat -ano \| findstr :3000` |
| Login fails 401 | Check test user exists in DB |
| Page not updating | Clear cache: Delete `.next` folder |

---

## 📝 Verify Setup

```bash
# Backend health check
curl http://localhost:3000/api/health

# Frontend check
# Open http://localhost:3000 in browser
```

✅ Both should work for full testing

---

## 🎯 Common API Endpoints

```
POST   /api/auth/login
GET    /api/orders
GET    /api/orders?status=PENDING
POST   /api/redemptions/scan
PUT    /api/profile
POST   /auth/logout
```

---

**Status:** 🟢 Ready to Test  
**Estimated Time:** 10-15 minutes setup  
**All Components:** Ready for testing

See `LOCAL_DEVELOPMENT_SETUP.md` for detailed guide.
