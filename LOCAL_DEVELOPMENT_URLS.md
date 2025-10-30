# 🌐 Local Development URLs - Club App

**Base URL**: `http://localhost:3000`

---

## 📋 Authentication & Authorization

### Login Page
```
http://localhost:3000/login
```
**Status**: ✅ Working  
**Description**: Tab-based authentication (Sign In, Sign Up, OTP)  
**Features**:
- Sign In with email/password
- Sign Up with age verification
- OTP authentication via phone

---

## 🗺️ Social Networking Features (Main App)

### Map Page
```
http://localhost:3000/map
```
**Status**: ✅ Working  
**Description**: Interactive map with venue markers and venue types legend  
**Features**:
- Leaflet map with OpenStreetMap tiles
- Venue markers (Bars, Clubs, Restaurants, Lounges)
- "People checked in nearby" indicator
- Responsive design

### Discover Page
```
http://localhost:3000/discover
```
**Status**: ✅ Working  
**Description**: Tinder-style user discovery cards  
**Features**:
- Swipeable user cards
- User info (name, age, distance)
- Accept/Reject buttons
- Mock data for testing

### Friends Page
```
http://localhost:3000/friends
```
**Status**: ✅ Working  
**Description**: Friend requests and friends list  
**Features**:
- Pending friend requests with Accept/Reject
- Friends list with status indicators
- Search functionality (stub)

### Groups Page
```
http://localhost:3000/groups
```
**Status**: ✅ Working  
**Description**: User groups/communities  
**Features**:
- Browse available groups
- Join/Leave functionality
- Group info cards with member count
- Mock data

### Offers Page
```
http://localhost:3000/offers
```
**Status**: ✅ Working  
**Description**: Drink offers and deals  
**Features**:
- Browse active drink offers
- Accept/Claim offers
- Status tracking (Available, Claimed, Used)
- Mock offer data

### Messages Page
```
http://localhost:3000/messages
```
**Status**: ✅ Working  
**Description**: Messaging/Conversations  
**Features**:
- Conversation list with last message preview
- Click to view conversation (UI ready)
- Unread message indicators (stub)
- Mock conversation data

---

## 🏢 Dashboard/Admin Features (Legacy)

### Dashboard Home
```
http://localhost:3000/dashboard
```
**Status**: ⚠️ Partial  
**Description**: Admin dashboard with summary stats  
**Features**:
- Total orders metric
- Redeemed today metric
- Pending orders metric
- Quick action links

### Orders Management
```
http://localhost:3000/dashboard/orders
```
**Status**: ✅ Working  
**Description**: View and manage orders  
**Features**:
- Orders list with details
- Status filtering
- Expiration dates
- Error handling with retry

### QR Code Scanner
```
http://localhost:3000/dashboard/scan
```
**Status**: ✅ Working  
**Description**: QR code scanning for redemptions  
**Features**:
- Live camera access with @zxing/browser
- Real-time QR code detection
- Success/Error messages
- Loading states

### Profile Settings
```
http://localhost:3000/dashboard/profile
```
**Status**: ✅ Working  
**Description**: User profile management  
**Features**:
- Display name edit
- Save to backend
- Success/Error alerts
- User info display

### Account Settings
```
http://localhost:3000/dashboard/settings
```
**Status**: ✅ Working  
**Description**: General account settings  
**Features**:
- Theme preferences
- Notification toggles
- Privacy settings
- Help section link

### Help
```
http://localhost:3000/dashboard/help
```
**Status**: ✅ Working  
**Description**: Help and support information

---

## 🔧 Testing Credentials

**Email**: `test1761680983200@example.com`  
**Password**: `TestPassword123!`

---

## 📊 Status Summary

### ✅ Fully Working Pages (6)
- `/map` - Map visualization
- `/discover` - User discovery
- `/friends` - Friend management
- `/groups` - Group browsing
- `/offers` - Drink offers
- `/messages` - Messaging

### ✅ Working Dashboard Pages (5)
- `/dashboard` - Home
- `/dashboard/orders` - Orders list
- `/dashboard/scan` - QR scanner
- `/dashboard/profile` - Profile edit
- `/dashboard/settings` - Settings

### ✅ Auth Pages (1)
- `/login` - Authentication

---

## 🚀 How to Start Development

### 1. Start the Backend
```bash
cd backend
npm run dev
```
Runs on: `http://localhost:3001`

### 2. Start the Frontend (New Terminal)
```bash
cd web
npm run dev
```
Runs on: `http://localhost:3000`

### 3. Access the App
```bash
# Open in browser
http://localhost:3000/login

# Login with test credentials
Email: test1761680983200@example.com
Password: TestPassword123!
```

---

## 🔄 Navigation Flow

```
Login (http://localhost:3000/login)
  ↓
Map (http://localhost:3000/map) - Default landing after login
  ├─ Discover (http://localhost:3000/discover)
  ├─ Friends (http://localhost:3000/friends)
  ├─ Groups (http://localhost:3000/groups)
  ├─ Offers (http://localhost:3000/offers)
  ├─ Messages (http://localhost:3000/messages)
  └─ Sidebar Navigation (All pages accessible)
  
Dashboard (http://localhost:3000/dashboard) - Admin section
  ├─ Orders (http://localhost:3000/dashboard/orders)
  ├─ Scanner (http://localhost:3000/dashboard/scan)
  ├─ Profile (http://localhost:3000/dashboard/profile)
  ├─ Settings (http://localhost:3000/dashboard/settings)
  └─ Help (http://localhost:3000/dashboard/help)
```

---

## 🛠️ Common Issues & Fixes

### Issue: Port 3000 already in use
```bash
# Kill process on port 3000
# Windows: Find port 3000 and kill it
lsof -ti:3000 | xargs kill -9

# Then restart
npm run dev
```

### Issue: Pages return 404
- Ensure backend is running on port 3001
- Check `next.config.js` for API rewrites
- Clear `.next` folder: `rm -rf .next && npm run dev`

### Issue: "Backend connection refused"
- Ensure NestJS backend is running
- Check backend is on `localhost:3001`
- See backend logs for errors

---

## 📝 Environment Variables

**Location**: `web/.env.local`

Required:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_WEB_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001
```

---

## 📦 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI Components**: Shadcn/ui (48 components)
- **Styling**: Tailwind CSS
- **Maps**: Leaflet
- **State**: Zustand
- **Icons**: Lucide React
- **QR Code**: @zxing/browser
- **Backend**: NestJS (port 3001)
- **Database**: PostgreSQL

---

**Last Updated**: October 30, 2025  
**Status**: All pages implemented and accessible
