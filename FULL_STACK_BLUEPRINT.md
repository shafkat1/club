# Full Stack Implementation Blueprint

## 🎯 Overview
Complete architecture for Club App with Backend (NestJS), Web Portal (Next.js), and Mobile (React Native + Expo)

---

## ✅ BACKEND STATUS: 85% Complete

### Completed Modules
- [x] **Auth Module** - Phone OTP + 7 Social Logins + JWT
- [x] **Users Module** - Profile, search, friends, devices, stats
- [x] **Venues Module** - Location search, presence tracking, real-time counts
- [x] **Orders Module** - Drink orders, Stripe payments, QR codes, redemption
- [x] **Groups Module** - Friend groups, membership, shared venues
- [x] **Realtime Gateway** - Socket.IO for live updates (venue/order/redemption)

### Remaining Backend Tasks (Quick Win)
1. **Firebase Cloud Messaging Setup**
   - Add FCM service to send push notifications
   - Trigger on order creation, status changes, redemptions
   
2. **Swagger Documentation**
   - Auto-generated from NestJS decorators
   - Available at `/api/docs`

3. **Database Seeding**
   - Create script to seed test venues, users
   - Run before deploying

### Backend Stack
```
Framework: NestJS + TypeScript
Database: PostgreSQL (Prisma ORM)
Cache: Redis (for venue counts, sessions)
Realtime: Socket.IO (self-hosted)
Storage: AWS S3
Authentication: JWT + Twilio OTP
Payments: Stripe
Notifications: Firebase Cloud Messaging
```

---

## 📱 WEB PORTAL (Next.js) - Ready to Build

### Tech Stack
- **Framework**: Next.js 14 + React + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **QR Scanning**: @zxing/browser
- **API Client**: Axios
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Headless UI

### Project Structure
```
web/
├── app/
│   ├── layout.tsx              # Root layout + theme
│   ├── (auth)/
│   │   ├── login/page.tsx      # Bartender login
│   │   └── otp-verify/page.tsx # OTP verification
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Dashboard shell
│   │   ├── page.tsx            # Dashboard home
│   │   ├── scan/page.tsx       # QR scanner
│   │   ├── redemptions/page.tsx# Redemption history
│   │   ├── orders/page.tsx     # Order management
│   │   └── admin/page.tsx      # Admin stats
│   └── api/
│       ├── auth/route.ts
│       ├── orders/route.ts
│       └── redemptions/route.ts
├── components/
│   ├── QRScanner.tsx
│   ├── OrderCard.tsx
│   ├── RedemptionFlow.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       └── Badge.tsx
├── hooks/
│   ├── useAuth.ts              # Auth state
│   ├── useApi.ts               # API calls
│   └── useCamera.ts            # Camera access
├── lib/
│   ├── api.ts                  # Axios setup
│   ├── auth.ts                 # JWT storage
│   └── validation.ts           # Zod schemas
├── store/
│   ├── auth.store.ts           # Zustand auth
│   ├── order.store.ts          # Order state
│   └── ui.store.ts             # UI state
├── tailwind.config.js
├── next.config.js
└── package.json
```

### Quick Start
```bash
cd web
npm install
npm run dev
# Open http://localhost:3000
```

### Key Features to Build
1. **Auth Flow** (1 hour)
   - Phone/Email login form
   - OTP verification
   - JWT token storage
   
2. **QR Scanner** (1.5 hours)
   - Camera permission
   - @zxing/browser integration
   - Redemption confirmation UI
   
3. **Dashboard** (2 hours)
   - Order list with filters
   - Redemption workflow
   - Admin stats dashboard

### Installation Steps
```bash
# Create Next.js app
npx create-next-app@latest web --typescript --tailwind

# Install dependencies
cd web
npm install axios zustand react-hook-form zod @zxing/browser

# Create folder structure
mkdir -p app/{auth,dashboard} components/{ui,scanner} hooks lib store
```

---

## 📲 MOBILE APP (React Native + Expo) - Ready to Build

### Tech Stack
- **Framework**: Expo (managed React Native)
- **Navigation**: React Navigation v6
- **Styling**: React Native StyleSheet + Tailwind (via Nativewind)
- **State Management**: Zustand
- **Maps**: Mapbox GL Native
- **QR Scanning**: expo-camera + react-native-qrcode-svg
- **API Client**: Axios
- **Location**: expo-location
- **Push Notifications**: Expo Notifications (FCM)
- **Forms**: React Hook Form + Zod

### Project Structure
```
mobile/
├── app.json                    # Expo config
├── app.tsx                     # Root entry
├── src/
│   ├── screens/
│   │   ├── (auth)/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── OtpScreen.tsx
│   │   │   └── SocialLoginScreen.tsx
│   │   ├── (app)/
│   │   │   ├── MapScreen.tsx         # Main map
│   │   │   ├── VenueDetailsScreen.tsx
│   │   │   ├── OrderBuyerScreen.tsx  # Send drink flow
│   │   │   ├── OrderReceiverScreen.tsx # Receive flow
│   │   │   ├── GroupsScreen.tsx
│   │   │   ├── ProfileScreen.tsx
│   │   │   └── SettingsScreen.tsx
│   │   └── LoadingScreen.tsx
│   ├── components/
│   │   ├── VenueCard.tsx
│   │   ├── PeopleList.tsx
│   │   ├── OrderCard.tsx
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Badge.tsx
│   │   └── maps/
│   │       ├── MapboxMapView.tsx
│   │       └── VenueMarker.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useLocation.ts
│   │   ├── useVenues.ts
│   │   └── usePushNotifications.ts
│   ├── services/
│   │   ├── api.ts              # Axios + JWT
│   │   ├── auth.ts             # Auth logic
│   │   ├── venues.ts           # Venue API
│   │   ├── orders.ts           # Order API
│   │   └── realtime.ts         # Socket.IO setup
│   ├── store/
│   │   ├── auth.store.ts
│   │   ├── venue.store.ts
│   │   ├── order.store.ts
│   │   └── ui.store.ts
│   ├── types/
│   │   └── index.ts            # TypeScript types
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── validation.ts
│   │   └── geo.ts              # Distance calc
│   ├── navigation/
│   │   ├── AuthNavigator.tsx
│   │   ├── AppNavigator.tsx
│   │   └── RootNavigator.tsx
│   └── config/
│       └── api.ts              # Base URL, headers
├── app.json
├── tsconfig.json
├── package.json
└── eas.json                    # EAS Build config
```

### Quick Start
```bash
cd mobile
npm install
npx expo start
# Press 'i' for iOS, 'a' for Android, 'w' for web
```

### Key Features to Build
1. **Auth Screens** (1.5 hours)
   - Phone login + OTP
   - Social login buttons (Google, Facebook, Instagram, Apple)
   - JWT token management
   
2. **Map Screen** (2.5 hours)
   - Mapbox GL integration
   - Current location tracking
   - Venue markers with live counts
   - Tap to view venue details
   
3. **Venue Details** (1.5 hours)
   - Venue info + presence list
   - Set location + drink interests
   - View people in venue
   
4. **Order Flow** (2 hours)
   - Buyer: Select recipient → Send order → Show QR for bartender
   - Receiver: Accept/Reject → Show QR code
   - Live notifications via Socket.IO
   
5. **Groups Screen** (1 hour)
   - List groups
   - Create/join groups
   - Set shared venue

### Installation Steps
```bash
# Create Expo app
npx create-expo-app mobile --template

# Install dependencies
cd mobile
npm install axios zustand react-hook-form zod react-native-mapbox-gl expo-location expo-camera socket.io-client @react-navigation/native @react-navigation/bottom-tabs

# Create folder structure
mkdir -p src/{screens/{auth,app},components/{ui,maps},hooks,services,store,types,utils,navigation,config}
```

---

## 🔧 QUICK BUILD GUIDE

### Phase 1: Web Portal (3-4 hours)
1. Initialize Next.js project
2. Build auth screens
3. Build QR scanner page
4. Build redemption dashboard
5. Style with Tailwind
6. Connect to backend API

### Phase 2: Mobile App (4-5 hours)
1. Initialize Expo project
2. Setup React Navigation
3. Build auth screens
4. Build map screen with Mapbox
5. Build order screens
6. Implement Socket.IO for live updates
7. Build notifications

### Phase 3: Backend Completion (1 hour)
1. Add Firebase Cloud Messaging
2. Generate Swagger docs
3. Create database seed script

---

## 🚀 DEPLOYMENT CHECKLIST

### Backend
- [ ] Deploy to ECS Fargate (via Terraform)
- [ ] Connect to RDS PostgreSQL
- [ ] Connect to ElastiCache Redis
- [ ] Setup Socket.IO server
- [ ] Configure Firebase Cloud Messaging
- [ ] Configure Stripe keys
- [ ] Configure Twilio API

### Web Portal
- [ ] Deploy to Vercel or AWS S3 + CloudFront
- [ ] Configure environment variables
- [ ] Setup domain (bartender.desh.co)
- [ ] HTTPS via ACM

### Mobile App
- [ ] Build for iOS (TestFlight or App Store)
- [ ] Build for Android (Play Store)
- [ ] Configure app signing
- [ ] Setup push notifications

---

## 📊 ESTIMATED TIME
- **Backend**: 1 hour (FCM + Docs + Seed)
- **Web**: 3-4 hours
- **Mobile**: 4-5 hours
- **Total**: ~8-10 hours for full stack

---

## 🎯 NEXT STEPS
1. Run Terraform apply (infrastructure is deploying)
2. Get RDS/Redis endpoints from Terraform outputs
3. Start building Web Portal (fastest to deploy)
4. Build Mobile App in parallel
5. Deploy all three simultaneously

Ready to code! 🚀
