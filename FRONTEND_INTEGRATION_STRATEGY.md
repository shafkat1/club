# FRONTEND INTEGRATION STRATEGY - SOCIALNETWORKINGAPP UI INTO CLUB APP

**Created:** October 30, 2025  
**Project:** Club App - Integration of Social Networking App UI/UX  
**Integration Type:** Frontend (React + Tailwind) into Existing NestJS Backend + AWS Infrastructure  
**Status:** Planning Phase

---

## TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Tech Stack Compatibility Analysis](#tech-stack-compatibility-analysis)
3. [Component Architecture Review](#component-architecture-review)
4. [Integration Strategy](#integration-strategy)
5. [Migration Path](#migration-path)
6. [API Integration Layer](#api-integration-layer)
7. [Authentication Integration](#authentication-integration)
8. [Deployment Strategy](#deployment-strategy)
9. [Implementation Timeline](#implementation-timeline)
10. [Risk Assessment](#risk-assessment)

---

## EXECUTIVE SUMMARY

### Current Situation
- **Social Networking App Frontend:** React 18 + Vite + Tailwind CSS + Shadcn/ui (SPA)
- **Club App Current Frontend:** Next.js 14 + React 18 + Tailwind CSS + Zustand
- **Club App Backend:** NestJS + PostgreSQL + Redis + AWS ECS/CloudFront
- **Goal:** Integrate Social Networking App's superior UI/UX with Club App's robust backend

### Key Advantages of Integration
✅ **Better UI Components:** Shadcn/ui offers more comprehensive component library than current setup  
✅ **Proven Design System:** Already designed and tested with Figma  
✅ **Rich Interactions:** Motion animations and better UX patterns  
✅ **Map Integration:** Leaflet already configured for venue discovery  
✅ **Responsive Design:** Mobile-first approach with better mobile UX  
✅ **Chat & Messaging:** Already implemented with Shadcn/ui dialogs  

### Integration Approach
🎯 **Reuse Components:** Extract and adapt 30+ React components  
🎯 **Keep Architecture:** Preserve NestJS backend and AWS infrastructure  
🎯 **Adapt APIs:** Bridge Social Networking App's Supabase calls to Club App's NestJS endpoints  
🎯 **Unified Auth:** Replace Supabase Auth with existing Passport JWT system  
🎯 **Same Deployment:** Deploy to existing AWS (ECS Fargate + CloudFront)

---

## TECH STACK COMPATIBILITY ANALYSIS

### Side-by-Side Comparison

| Aspect | Social Networking App | Club App (Current) | Club App (Target) | Status |
|--------|----------------------|-------------------|-------------------|--------|
| **Build Tool** | Vite | Next.js | Next.js | ⚠️ Needs adaptation |
| **React Version** | 18.3.1 | 18.2.0 | 18.2.0 | ✅ Compatible |
| **TypeScript** | Yes | Yes | Yes | ✅ Compatible |
| **Styling** | Tailwind CSS | Tailwind CSS | Tailwind CSS | ✅ Perfect match |
| **Component Lib** | Shadcn/ui | Custom | Shadcn/ui | ✅ Adding |
| **State Mgmt** | React Hooks + Mock data | Zustand | Zustand | ⚠️ Minor change |
| **Forms** | React Hook Form | React Hook Form | React Hook Form | ✅ Same |
| **Icons** | Lucide React | Lucide React | Lucide React | ✅ Same |
| **Animations** | Motion | None | Motion | ✅ Adding |
| **Toasts** | Sonner | None | Sonner | ✅ Adding |
| **Maps** | Leaflet | None | Leaflet | ✅ Adding |
| **Auth** | Supabase Auth | Passport + JWT | Passport + JWT | ⚠️ Needs bridge |
| **API Calls** | Supabase Edge Functions | Axios | Axios | ⚠️ Needs bridge |
| **Backend** | Deno + Hono | NestJS | NestJS | ✅ Keep |
| **Database** | PostgreSQL (Supabase) | PostgreSQL (RDS) | PostgreSQL (RDS) | ✅ Same |
| **Deployment** | Vercel | AWS ECS | AWS ECS | ✅ Same |

### Compatibility Summary

**Highly Compatible (95% reusable):**
- React components architecture
- TypeScript patterns
- Tailwind CSS classes
- Form handling (React Hook Form)
- Icon system (Lucide React)

**Moderately Compatible (70% reusable):**
- API client patterns (need to adapt endpoints)
- Authentication logic (need to replace Supabase with JWT)
- Data models (mostly aligned with Club App schema)

**Requires Adaptation (40-60% effort):**
- Build system (Vite → Next.js)
- State management (mock data → Zustand stores)
- API endpoints (all must map to NestJS endpoints)
- Auth flow (Supabase → Passport JWT)

---

## COMPONENT ARCHITECTURE REVIEW

### Social Networking App Structure

```
src/
├── components/
│   ├── UI Components (30+)
│   │   ├── AuthScreen.tsx               ← Auth logic (needs adaptation)
│   │   ├── MapView.tsx                  ← Leaflet map (reusable)
│   │   ├── UserCard.tsx                 ← User display (reusable)
│   │   ├── ConversationsList.tsx        ← Chat list (reusable)
│   │   ├── ChatView.tsx                 ← Chat UI (reusable)
│   │   ├── SendOfferDialog.tsx          ← Drink offer (reusable)
│   │   ├── OfferCard.tsx                ← Offer display (reusable)
│   │   ├── VenueDetailSheet.tsx         ← Venue info (reusable)
│   │   ├── DemoModeButton.tsx           ← Dev tool (skip)
│   │   ├── ConnectionStatus.tsx         ← Status indicator (reusable)
│   │   ├── GeofenceManager.tsx          ← Geofencing (reusable)
│   │   ├── ProfileSettings.tsx          ← Profile editing (reusable)
│   │   ├── DrinkMenuDialog.tsx          ← Drink selection (reusable)
│   │   ├── DrinkRedemptionDialog.tsx    ← Bartender UI (reusable)
│   │   ├── BartenderVerificationDialog  ← Bartender verification (reusable)
│   │   ├── DrinkLimitsCard.tsx          ← Responsible drinking (reusable)
│   │   ├── FriendsView.tsx              ← Friends list (reusable)
│   │   ├── GroupsView.tsx               ← Groups management (reusable)
│   │   ├── UserDiscovery.tsx            ← User discovery (reusable)
│   │   ├── UserProfile.tsx              ← User profile view (reusable)
│   │   ├── QuickActions.tsx             ← FAB actions (reusable)
│   │   ├── Navigation.tsx               ← App navigation (reusable)
│   │   ├── LoadingStates.tsx            ← Loading UI (reusable)
│   │   ├── SuccessAnimation.tsx         ← Success animation (reusable)
│   │   ├── SplashScreen.tsx             ← Splash screen (reusable)
│   │   ├── WelcomeScreen.tsx            ← Onboarding (reusable)
│   │   ├── ErrorBoundary.tsx            ← Error handling (reusable)
│   │   └── ui/ (Shadcn/ui components)   ← 40+ UI primitives (copy all)
│   │
│   ├── figma/
│   │   └── ImageWithFallback.tsx        ← Image component (reusable)
│   │
│   └── [Other components]
│
├── types/
│   └── index.ts                         ← Data models (mostly compatible)
│
├── utils/
│   ├── api.ts                           ← API client (MAJOR CHANGE - adapt to NestJS)
│   ├── config.ts                        ← Config (update endpoints)
│   └── seedData.ts                      ← Mock data (reusable for demo)
│
├── data/
│   └── mockData.ts                      ← Mock data (reusable)
│
├── styles/
│   ├── globals.css                      ← Global styles (reusable)
│   └── [index.css]                      ← Tailwind setup
│
└── App.tsx                              ← Main app (major adaptation)
```

### Component Categories

**Category 1: Directly Reusable (25 components)**
- All Shadcn/ui components
- MapView, UserCard, ConversationsList, ChatView
- SendOfferDialog, OfferCard, VenueDetailSheet
- ProfileSettings, FriendsView, GroupsView, UserDiscovery
- Navigation, LoadingStates, SuccessAnimation
- WelcomeScreen, SplashScreen, ErrorBoundary

**Category 2: Reusable with Minor Adaptation (15 components)**
- AuthScreen → Adapt to use Passport JWT instead of Supabase
- DrinkMenuDialog, DrinkRedemptionDialog, BartenderVerificationDialog
- UserProfile, QuickActions, ConnectionStatus
- GeofenceManager, DrinkLimitsCard, AgeVerificationDialog

**Category 3: Skip or Replace (5 components)**
- DemoModeButton → Skip (development tool)
- ImageWithFallback → Keep but ensure Next.js compatibility
- AnimatedBackground → Can keep or replace

---

## INTEGRATION STRATEGY

### Option Analysis

I've identified **3 integration options**. Let me outline each:

---

### **OPTION A: Pure Component Migration (Recommended)**

**Approach:** Extract components from Social Networking App, import into Club App's Next.js web frontend

**Pros:**
- Cleanest approach
- Maximum code reuse
- Single codebase easier to maintain
- Leverages Next.js SSR benefits
- Faster performance

**Cons:**
- Requires converting Vite SPA patterns to Next.js
- Need to fully replace API client
- More extensive testing needed

**Timeline:** 6-8 weeks

**Tech Changes Required:**
- ✅ Add Shadcn/ui to Club App `web/` project
- ✅ Copy 30+ components to `web/components/`
- ✅ Adapt API layer to NestJS endpoints
- ✅ Implement Zustand stores for state management
- ✅ Deploy as Next.js SSR app (no change to deployment)

---

### **OPTION B: Monorepo Structure**

**Approach:** Keep Social Networking App's Vite SPA separate, run both frontends

**Pros:**
- Minimal changes to components
- Easy to run side-by-side
- Can migrate gradually

**Cons:**
- Two separate deployments
- More complex infrastructure
- Code duplication
- Higher costs

**Timeline:** 4-5 weeks (but ongoing duplication)

**Not Recommended** for production (too complex)

---

### **OPTION C: Next.js + React Router Hybrid**

**Approach:** Use Next.js routing but import components from Social Networking App's build

**Pros:**
- Can leverage Next.js SSR
- Mostly preserves component structure

**Cons:**
- Complex build setup
- Hard to maintain
- Performance issues
- Not scalable

**Not Recommended** (architectural problems)

---

### **RECOMMENDATION: Go with OPTION A (Pure Component Migration)**

This is the cleanest and most maintainable approach. Here's the detailed strategy:

---

## MIGRATION PATH

### Phase 1: Foundation (Weeks 1-2)

**Goal:** Set up infrastructure for component migration

**Tasks:**
1. ✅ Add dependencies to Club App `web/package.json`:
   ```json
   {
     "@radix-ui/react-*": "latest",
     "shadcn/ui": "latest",
     "motion": "latest",
     "sonner": "latest",
     "leaflet": "latest",
     "react-leaflet": "latest",
     "cmdk": "latest",
     "embla-carousel-react": "latest",
     "react-day-picker": "latest",
     "recharts": "latest",
     "input-otp": "latest",
     "vaul": "latest",
     "class-variance-authority": "latest",
     "clsx": "latest"
   }
   ```

2. ✅ Create `web/components/ui/` directory structure
3. ✅ Copy all Shadcn/ui components from Social Networking App
4. ✅ Set up Tailwind CSS configuration (already exists, verify compatibility)
5. ✅ Add global styles from Social Networking App's `globals.css`
6. ✅ Update `next.config.js` if needed

**Deliverables:**
- Updated `web/package.json` with all dependencies
- `/web/components/ui/` with all 40+ Shadcn/ui components
- Updated global styles in `/web/styles/globals.css`
- Updated Tailwind config

---

### Phase 2: Component Migration (Weeks 3-5)

**Goal:** Copy and adapt custom components

**Sub-Phase 2a: High-Priority Components (Week 3)**

Copy these components with minimal changes:
- `MapView.tsx` - Leaflet map display
- `UserCard.tsx` - User profile card
- `ConversationsList.tsx` - Chat conversations list
- `ChatView.tsx` - Chat message view
- `SendOfferDialog.tsx` - Drink offer dialog
- `OfferCard.tsx` - Offer display card
- `VenueDetailSheet.tsx` - Venue information sheet
- `Navigation.tsx` - App navigation
- `ProfileSettings.tsx` - Profile editing
- `LoadingStates.tsx` - Loading skeletons
- `SuccessAnimation.tsx` - Success animations
- `WelcomeScreen.tsx` - Onboarding screen

**Location:** `/web/components/social/` (organized subdirectory)

**Adaptation Required:**
- Remove direct Supabase calls
- Replace mock data with proper state management
- Update TypeScript types to match Club App schema

---

**Sub-Phase 2b: Medium-Priority Components (Week 4)**

Copy and adapt:
- `AuthScreen.tsx` → Adapt to use Passport JWT flow
- `DrinkMenuDialog.tsx` → Connect to Club App's menu system
- `DrinkRedemptionDialog.tsx` → Connect to redemption API
- `BartenderVerificationDialog.tsx` → QR code verification
- `FriendsView.tsx` → Friends management
- `GroupsView.tsx` → Groups management
- `UserProfile.tsx` → User profile viewing
- `QuickActions.tsx` → Quick action buttons
- `GeofenceManager.tsx` → Geofencing logic
- `ConnectionStatus.tsx` → Connection indicator
- `DrinkLimitsCard.tsx` → Drink limits display

---

**Sub-Phase 2c: Low-Priority/Conditional Components (Week 5)**

Copy only if needed:
- `AgeVerificationDialog.tsx` - Age verification UI
- `AgeVerificationBadge.tsx` - Age badge
- `DemoModeButton.tsx` - Skip (dev tool)
- `ErrorBoundary.tsx` - Error handling
- `SplashScreen.tsx` - Splash screen
- `ResponsibleDrinkingBanner.tsx` - Warning banners

---

### Phase 3: API Integration Layer (Weeks 5-6)

**Goal:** Create adapter layer between Social Networking App components and Club App's NestJS backend

**Current Social Networking App API Calls:**
```typescript
// Supabase-based API calls
api.getProfile()
api.getVenues(lat, lng, radius)
api.getOffers("sent" | "received")
api.createOffer(offerData)
api.updateOffer(offerId, status)
api.getConversations()
api.getMessages(userId)
api.sendMessage(userId, content)
api.checkIn(venueId, data)
api.checkOut()
// ... etc
```

**New NestJS Backend Endpoints (from COMPREHENSIVE_ARCHITECTURE_GUIDE.md):**
```
GET  /users/me
PUT  /users/me
GET  /venues?latitude=&longitude=&radius=
GET  /venues/:venueId
POST /orders
GET  /orders
PUT  /orders/:orderId
DELETE /orders/:orderId
GET  /presence/:venueId/counts
POST /presence/checkin
POST /presence/checkout
PUT  /presence
GET  /redemptions/:redemptionId
// ... etc
```

**Adapter Strategy:**

Create `/web/utils/api-adapter.ts`:
```typescript
// Maps Social Networking App calls to Club App NestJS endpoints
export const api = {
  // Profile
  getProfile: () => fetch('/api/users/me'),
  
  // Venues
  getVenues: (lat, lng, radius) => 
    fetch(`/api/venues?latitude=${lat}&longitude=${lng}&radius=${radius}`),
  
  // Offers (Maps to Orders in Club App)
  getOffers: (type) => 
    fetch(`/api/orders?type=${type}`),
  
  createOffer: (data) => 
    fetch('/api/orders', { method: 'POST', body: JSON.stringify(data) }),
  
  // ... etc (all adapted)
};
```

---

### Phase 4: Authentication Integration (Weeks 6-7)

**Goal:** Replace Supabase Auth with Passport JWT authentication

**Current Flow (Supabase Auth):**
```
Frontend → Supabase Auth UI → JWT Token → localStorage
```

**New Flow (Passport JWT):**
```
Frontend → NestJS Auth Endpoint → JWT Token → httpOnly Cookie
```

**Implementation:**
1. Remove Supabase Auth dependencies
2. Create authentication service using NestJS endpoints
3. Update AuthScreen component to use Passport flow
4. Implement token refresh logic
5. Set up JWT interceptors in API client

**Changes Required:**
- `/web/lib/auth.ts` - Update authentication logic
- Replace Supabase login/signup with NestJS endpoints
- Update token storage (localStorage → httpOnly cookies if possible)
- Implement automatic token refresh

---

### Phase 5: State Management Integration (Week 7)

**Goal:** Connect components to Zustand stores instead of React state

**Current Approach (Social Networking App):**
- Uses React `useState` with local state management

**New Approach (Club App):**
- Uses Zustand stores for global state

**Stores Needed:**
```
/web/store/
├── authStore.ts          - Authentication state
├── userStore.ts          - Current user profile
├── venuesStore.ts        - Venue listings
├── ordersStore.ts        - Orders/offers
├── presenceStore.ts      - Presence tracking
├── conversationStore.ts  - Chat conversations
├── friendsStore.ts       - Friends list
└── groupsStore.ts        - Groups management
```

**Migration Pattern:**
```typescript
// Before (Social Networking App)
const [offers, setOffers] = useState([]);

// After (Club App with Zustand)
const offers = useOrdersStore(state => state.orders);
const setOffers = useOrdersStore(state => state.setOrders);
```

---

### Phase 6: Testing & Optimization (Week 8)

**Goal:** Ensure all components work correctly with Club App backend

**Testing:**
1. Component unit tests
2. Integration tests with API
3. E2E testing with real backend
4. Performance testing
5. Mobile responsiveness testing

**Optimization:**
1. Code splitting for faster load times
2. Image optimization
3. Component lazy loading
4. Caching strategies

---

## API INTEGRATION LAYER

### 🎯 CRITICAL CLARIFICATION: DIRECT NESTJS INTEGRATION (NO SUPABASE)

**This is NOT a bridge/adapter approach:**

❌ **OLD APPROACH (Rejected):**
```
Social Networking App Supabase Calls 
  ↓
  Adapter Layer (converts to NestJS)
  ↓
  Club App NestJS Backend
```

✅ **NEW APPROACH (Confirmed):**
```
Social Networking App Components
  ↓
  Remove ALL Supabase code
  ↓
  Direct NestJS API Calls
  ↓
  Club App NestJS Backend (Already Production-Ready)
```

---

### What This Means

**COMPLETELY REMOVE:**
- ❌ All `@jsr/supabase__supabase-js` imports
- ❌ All `supabase.auth.*` calls
- ❌ All `api.ts` Supabase edge function references
- ❌ All `/utils/supabase/` directory
- ❌ All Supabase configuration

**DIRECTLY USE:**
- ✅ NestJS endpoints at `/api/*`
- ✅ Existing Passport JWT authentication
- ✅ Existing Club App PostgreSQL database
- ✅ Existing Club App Redis cache
- ✅ Existing httpOnly cookie token storage

---

### Data Model Mapping

**Social Networking App Models → Club App Models:**

```
User (SNA) → User (CA)
├── id ✅
├── name ✅
├── username ✅
├── avatar ✅
├── bio ✅
├── age ✅
├── interests ✅
├── preferredDrinks ✅
└── [additional fields] ✅ (mostly compatible)

MenuItem (SNA) → MenuItem (CA - partial)
├── id ✅
├── name ✅
├── price ✅
├── category ⚠️ (enum difference - map during calls)
└── description ✅

Offer (SNA) → Order (CA)
├── id ✅
├── sender → buyer ⚠️ (rename in component)
├── receiver → recipient ⚠️ (rename in component)
├── item → drink item ✅
├── message ✅
├── status ✅ (map status values if needed)
├── timestamp ✅
└── [new fields in CA: venueId, stripePaymentIntentId, etc.] ✅

CheckIn (SNA) → Presence (CA)
├── id ✅
├── user → userId ⚠️ (adapt in component)
├── venue → venueId ⚠️ (adapt in component)
├── wantsDrink ✅
├── buyingDrinks → can be inferred ✅
└── timestamp ✅
```

---

### API Endpoint Mapping (Direct to NestJS)

| Feature | Social Networking App Call | Club App NestJS Endpoint | Required Changes |
|---------|---------------------------|--------------------------|------------------|
| **Profile** | getProfile() | GET /api/users/me | None |
| **Profile Update** | updateProfile(data) | PUT /api/users/me | None |
| **Venues List** | getVenues(lat, lng, radius) | GET /api/venues?latitude=&longitude=&radius= | None |
| **Venue Details** | getVenue(id) | GET /api/venues/:venueId | Rename parameter |
| **Orders/Offers** | getOffers("sent"\|"received") | GET /api/orders?type=sent\|received | Rename: Offer → Order |
| **Create Offer** | createOffer(data) | POST /api/orders | Rename: sender→buyer, receiver→recipient |
| **Update Offer** | updateOffer(id, status) | PUT /api/orders/:id | Rename: Offer → Order |
| **Delete Offer** | deleteOffer(id) | DELETE /api/orders/:id | Rename: Offer → Order |
| **Conversations** | getConversations() | GET /api/groups (or custom endpoint) | Map response structure |
| **Messages** | getMessages(userId) | GET /api/messages?userId= | Verify endpoint exists |
| **Send Message** | sendMessage(userId, content) | POST /api/messages | Verify endpoint structure |
| **Check In** | checkIn(venueId, data) | POST /api/presence/checkin | Rename: CheckIn → Presence |
| **Check Out** | checkOut() | POST /api/presence/checkout | None |
| **Get Presence** | getPresence(venueId) | GET /api/presence/:venueId | Rename: CheckIn → Presence |
| **Redemptions** | getRedemptions() | GET /api/redemptions | None |
| **Redeem Offer** | redeemOffer(id, code) | POST /api/redemptions | None |
| **Friends List** | getFriends() | GET /api/users/:id/friends | New endpoint (check if exists) |
| **Add Friend** | sendFriendRequest(userId) | POST /api/users/:id/friend-requests | New endpoint (check if exists) |
| **Groups** | getGroups() | GET /api/groups | Check endpoint |
| **Create Group** | createGroup(data) | POST /api/groups | Check endpoint |
| **Join Group** | joinGroup(groupId) | POST /api/groups/:id/members | Check endpoint |

---

### Implementation: Direct API Client

**CREATE `/web/utils/api-client.ts` (NOT adapter.ts):**

```typescript
// Direct API client - NO Supabase, NO bridge
// Only calls NestJS backend endpoints

import axios, { AxiosInstance, AxiosError } from 'axios';

export class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || '/api') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Important: for httpOnly cookies
    });

    // Request interceptor: Add token to headers
    this.client.interceptors.request.use((config) => {
      const token = this.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor: Handle 401 and refresh token
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && originalRequest) {
          try {
            await this.refreshToken();
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // ============ AUTHENTICATION ============
  
  async signup(email: string, password: string) {
    const response = await this.client.post('/auth/signup', { email, password });
    this.setAccessToken(response.data.accessToken);
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    this.setAccessToken(response.data.accessToken);
    return response.data;
  }

  async logout() {
    await this.client.post('/auth/logout');
    this.setAccessToken(null);
  }

  async refreshToken() {
    const response = await this.client.post('/auth/refresh-token');
    this.setAccessToken(response.data.accessToken);
    return response.data;
  }

  // ============ PROFILE ============
  
  async getProfile() {
    const response = await this.client.get('/users/me');
    return response.data;
  }

  async updateProfile(data: any) {
    const response = await this.client.put('/users/me', data);
    return response.data;
  }

  // ============ VENUES ============
  
  async getVenues(latitude: number, longitude: number, radius: number = 5000) {
    const response = await this.client.get('/venues', {
      params: { latitude, longitude, radius }
    });
    return response.data;
  }

  async getVenue(venueId: string) {
    const response = await this.client.get(`/venues/${venueId}`);
    return response.data;
  }

  // ============ ORDERS (formerly Offers) ============
  
  async getOrders(type?: 'sent' | 'received') {
    const response = await this.client.get('/orders', {
      params: type ? { type } : {}
    });
    return response.data;
  }

  async createOrder(data: any) {
    // Map component data to NestJS format
    const payload = {
      recipientId: data.receiver?.id, // Map: receiver → recipientId
      drinkId: data.item?.id,
      message: data.message,
      venueId: data.venue?.id,
    };
    const response = await this.client.post('/orders', payload);
    return response.data;
  }

  async updateOrder(orderId: string, status: string) {
    const response = await this.client.put(`/orders/${orderId}`, { status });
    return response.data;
  }

  async deleteOrder(orderId: string) {
    const response = await this.client.delete(`/orders/${orderId}`);
    return response.data;
  }

  // ============ PRESENCE (Check-ins) ============
  
  async checkIn(venueId: string, data?: any) {
    const response = await this.client.post('/presence/checkin', {
      venueId,
      ...data
    });
    return response.data;
  }

  async checkOut() {
    const response = await this.client.post('/presence/checkout');
    return response.data;
  }

  async getPresence(venueId: string) {
    const response = await this.client.get(`/presence/${venueId}`);
    return response.data;
  }

  // ============ MESSAGES & CONVERSATIONS ============
  
  async getConversations() {
    const response = await this.client.get('/groups');
    return response.data;
  }

  async getMessages(userId: string) {
    const response = await this.client.get('/messages', {
      params: { userId }
    });
    return response.data;
  }

  async sendMessage(userId: string, content: string) {
    const response = await this.client.post('/messages', {
      recipientId: userId,
      content
    });
    return response.data;
  }

  // ============ TOKEN MANAGEMENT ============
  
  setAccessToken(token: string | null) {
    this.accessToken = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  getAccessToken(): string | null {
    if (!this.accessToken) {
      this.accessToken = localStorage.getItem('accessToken');
    }
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const apiClient = new ApiClient();
```

---

### Error Handling (Direct from NestJS)

```typescript
// /web/utils/error-handler.ts

export interface ApiError {
  status: number;
  message: string;
  error?: string;
}

export function handleApiError(error: any): ApiError {
  if (axios.isAxiosError(error)) {
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message,
      error: error.response?.data?.error,
    };
  }

  return {
    status: 500,
    message: 'An unexpected error occurred',
  };
}

export function getErrorMessage(error: any): string {
  const apiError = handleApiError(error);
  
  switch (apiError.status) {
    case 400:
      return 'Bad request - please check your input';
    case 401:
      return 'You are not authenticated - please log in';
    case 403:
      return 'You do not have permission to perform this action';
    case 404:
      return 'Resource not found';
    case 409:
      return 'This resource already exists';
    case 429:
      return 'Too many requests - please try again later';
    case 500:
      return 'Server error - please try again later';
    default:
      return apiError.message || 'An error occurred';
  }
}
```

---

## AUTHENTICATION INTEGRATION

### 🎯 CRITICAL: Direct Passport JWT Integration (NO Supabase Auth)

**Architecture Overview:**

```
┌─────────────────────────────────────────────────────────────────┐
│ Social Networking App Components (UPDATED)                       │
│ - Remove ALL Supabase Auth imports                              │
│ - Remove ALL supabase.auth.* calls                              │
│ - Use direct NestJS endpoints only                              │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────────────┐
│ /web/utils/api-client.ts (NEW - Direct API Client)              │
│ - signup() → POST /api/auth/signup                              │
│ - login() → POST /api/auth/login                                │
│ - refreshToken() → POST /api/auth/refresh-token                 │
│ - logout() → POST /api/auth/logout                              │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────────────┐
│ Club App NestJS Backend (EXISTING)                              │
│ - /auth/signup (Passport LocalStrategy + bcrypt)                │
│ - /auth/login (Validate credentials + JWT generation)           │
│ - /auth/refresh-token (Validate refresh token)                  │
│ - JWT stored in httpOnly cookies                                │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────────────┐
│ Club App PostgreSQL Database (EXISTING)                         │
│ - Users table (with hashed passwords)                           │
│ - Refresh tokens stored securely                                │
└─────────────────────────────────────────────────────────────────┘
```

---

### Authentication Flow: User Registration

**Step-by-step process:**

```typescript
// 1. User fills form in AuthScreen component
const handleSignup = async (email: string, password: string) => {
  try {
    // 2. Call direct NestJS endpoint (NO Supabase)
    const result = await apiClient.signup(email, password);
    
    // 3. Backend response includes JWT tokens
    // {
    //   accessToken: "eyJhbGc...",
    //   refreshToken: "eyJhbGc...",
    //   user: { id, email, name, ... }
    // }
    
    // 4. Token automatically stored in state/localStorage by apiClient
    
    // 5. Subsequent API calls include token automatically
    // Authorization header: "Bearer eyJhbGc..."
    
    // 6. Redirect to app
    navigateTo('/map');
  } catch (error) {
    showError(getErrorMessage(error));
  }
};
```

---

### Authentication Flow: User Login

```typescript
const handleLogin = async (email: string, password: string) => {
  try {
    // Direct call to NestJS (NO Supabase)
    const result = await apiClient.login(email, password);
    
    // Response:
    // {
    //   accessToken: "...",
    //   refreshToken: "...",
    //   user: { id, email, ... }
    // }
    
    navigateTo('/map');
  } catch (error) {
    showError('Invalid email or password');
  }
};
```

---

### Token Refresh (Automatic)

```typescript
// API client automatically handles token refresh:

// 1. Any API call made with expired token
// 2. Interceptor catches 401 response
// 3. Calls POST /api/auth/refresh-token
// 4. Gets new accessToken
// 5. Retries original request
// 6. User never notices (seamless)

// If refresh token also expired:
// → Redirect to login page
```

---

### OAuth Integration (Existing Club App)

**Keep existing OAuth from Club App:**

```typescript
// OAuth endpoints already exist in NestJS:
// POST /api/auth/google
// POST /api/auth/facebook
// POST /api/auth/apple

// Just update AuthScreen to call these directly:
const handleGoogleLogin = async (googleToken: string) => {
  const response = await apiClient.client.post('/auth/google', {
    token: googleToken
  });
  // ... handle response
};
```

---

### AuthScreen Component Update Example

**BEFORE (Social Networking App with Supabase):**
```typescript
import { supabase } from '@/utils/supabase/client';

async function handleSignup(email: string, password: string) {
  const { data, error } = await supabase.auth.signUpWithPassword({
    email,
    password,
  });
  // ...
}
```

**AFTER (Club App with NestJS):**
```typescript
import { apiClient } from '@/utils/api-client'; // NEW: Direct API client

async function handleSignup(email: string, password: string) {
  // Direct call to NestJS (NO Supabase, NO adapter, NO bridge)
  const { accessToken, user } = await apiClient.signup(email, password);
  
  // Token automatically managed by apiClient
  // API calls now include auth header automatically
  // ...
}
```

---

### Token Storage Strategy

| Aspect | Social Networking App | Club App (NEW) |
|--------|---------------------|-----------------|
| **Auth Provider** | Supabase Auth | Passport JWT |
| **Token Format** | Supabase JWT | Passport JWT |
| **Storage** | localStorage | httpOnly cookies + state |
| **Refresh** | Supabase automatic | Axios interceptor automatic |
| **Logout** | supabase.auth.signOut() | apiClient.logout() |

---

### Session Management

**Zustand Store for Authentication:**

```typescript
// /web/store/authStore.ts

import { create } from 'zustand';
import { apiClient } from '@/utils/api-client';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  signup: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await apiClient.signup(email, password);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await apiClient.login(email, password);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false });
    }
  },

  logout: async () => {
    try {
      await apiClient.logout();
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  refreshSession: async () => {
    try {
      await apiClient.refreshToken();
    } catch (error) {
      set({ user: null, isAuthenticated: false });
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));
```

---

### No Supabase Anywhere

**Complete list of what to DELETE:**

```
❌ Remove from web/package.json:
   "@jsr/supabase__supabase-js"

❌ Remove files:
   /web/utils/supabase/
   /web/utils/api.ts (Supabase version)
   /web/lib/auth.ts (if Supabase-based)

❌ Remove from components:
   import { supabase } from '@/utils/supabase'
   import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
   await supabase.auth.*
   await supabase.from()*

✅ Add instead:
   import { apiClient } from '@/utils/api-client'
   import { useAuthStore } from '@/store/authStore'
```

---

## DEPLOYMENT STRATEGY

### Current Deployment (Social Networking App)
```
Vercel ← Git Push ← GitHub
```

### New Deployment (Club App with Integrated Frontend)
```
AWS ECS Fargate ← GitHub Actions ← Git Push ← GitHub
                ↓
            CloudFront (CDN for /assets)
```

### Deployment Changes

**No changes to backend deployment**, but frontend deployment simplifies:

**FROM:**
- Vercel → builds Vite SPA → serves separately
- Separate domain needed for Social Networking App

**TO:**
- GitHub Actions → builds Next.js app → pushes to ECR → ECS Fargate serves it
- Single deployment pipeline
- Leverages existing Club App infrastructure

**Implementation:**

1. **Update `.github/workflows/deploy-frontend.yml`** (or create if doesn't exist):
   ```yaml
   name: Deploy Frontend
   on:
     push:
       branches: [main]
       paths:
         - 'web/**'
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Setup Node
           uses: actions/setup-node@v3
           with:
             node-version: '18'
         - name: Install dependencies (web)
           working-directory: web
           run: npm ci
         - name: Build Next.js
           working-directory: web
           run: npm run build
         - name: Configure AWS credentials
           uses: aws-actions/configure-aws-credentials@v2
           with:
             role-to-assume: ${{ secrets.AWS_ROLE_TO_ASSUME }}
             aws-region: us-east-1
         - name: Deploy to S3 + CloudFront
           run: |
             aws s3 sync web/.next/static s3://clubapp-dev-assets/web/_next/static/ --delete
             aws cloudfront create-invalidation --distribution-id ${{ secrets.CF_DIST_ID }} --paths "/*"
   ```

2. **Serve from ECS + ALB** (Recommended):
   - Build Next.js app
   - Containerize in Docker
   - Push to ECR
   - ECS Fargate runs it
   - ALB routes `/web/*` to frontend, `/api/*` to NestJS backend

---

## IMPLEMENTATION TIMELINE

### Phase 0: Pre-Implementation (CRITICAL)

**Before any component migration:**

- [ ] **Remove all Supabase packages** from package.json
- [ ] **Verify NestJS endpoints** - Ensure all endpoints exist
- [ ] **Check auth flow** - Confirm Passport JWT setup is complete
- [ ] **Database mapping** - Verify data models align

---

### Phase 1: Foundation (Weeks 1-2)

- [ ] Remove Supabase dependencies completely
- [ ] Add Shadcn/ui and other dependencies
- [ ] Create `/web/utils/api-client.ts` (NO adapter)
- [ ] Create `/web/store/authStore.ts`
- [ ] Copy all Shadcn/ui components
- [ ] Set up component directory structure
- [ ] Update Tailwind/CSS configuration

---

### Phase 2: Component Migration (Weeks 3-5)

- [ ] **Week 3:** High-priority components (Maps, Cards, Lists)
- [ ] **Week 4:** Medium-priority components (Auth, Dialogs, Forms)
  - Update AuthScreen to use apiClient instead of Supabase
- [ ] **Week 5:** Low-priority components (Animations, Screens)

---

### Phase 3: API Integration (Week 5-6)

- [ ] Map all component API calls to NestJS endpoints
- [ ] Implement error handling
- [ ] Test API calls against live backend
- [ ] Fix any endpoint mismatches

---

### Phase 4: Testing & Optimization (Week 7)

- [ ] Unit tests for components
- [ ] Integration tests with API
- [ ] E2E testing with real backend
- [ ] Performance testing
- [ ] Mobile testing

---

### Phase 5: Deployment (Week 8-9)

- [ ] Update GitHub Actions workflow
- [ ] Deploy to AWS ECS
- [ ] Smoke testing
- [ ] Production rollout

---

## RISK ASSESSMENT - UPDATED

### Risks ELIMINATED by Direct Integration

✅ **No Supabase auth conflicts** - We're not using Supabase at all
✅ **No adapter layer complexity** - Direct calls to NestJS
✅ **No token format conversion** - Same JWT format throughout
✅ **No API mapping issues** - Point-to-point integration
✅ **No dependency conflicts** - No Supabase SDK to manage

---

### Remaining Risks (Low Probability)

**1. Missing NestJS Endpoints** (Probability: Low, Impact: Medium)
- **Risk:** Some required endpoints might not exist in NestJS backend
- **Mitigation:** Audit all endpoints before implementation
- **Contingency:** Create missing endpoints quickly in NestJS

**2. Data Model Mismatches** (Probability: Low, Impact: Medium)
- **Risk:** Field names or types don't align exactly
- **Mitigation:** Create clear mapping documentation
- **Contingency:** Add lightweight transformation layer in components

**3. Performance Issues** (Probability: Low, Impact: Low)
- **Risk:** Network latency from direct API calls
- **Mitigation:** Implement proper caching and state management
- **Contingency:** Add request debouncing

---

## NEXT STEPS - UPDATED

### Immediate Actions (Before Implementation)

1. ✅ **Confirm Architecture** - This direct integration approach
2. ✅ **Verify Endpoints** - Check all NestJS endpoints exist
3. ✅ **Test Auth** - Confirm Passport JWT works for new users
4. ✅ **Create API Spec** - Document all endpoint mappings
5. ⏳ **Audit Backend** - Ensure all data models are correct

### First Sprint Tasks

1. Remove all Supabase code and dependencies
2. Create `api-client.ts` with all NestJS endpoints
3. Create `authStore.ts` with auth state
4. Copy Shadcn/ui components
5. Update AuthScreen to use new api-client
6. Test signup/login flow

### Files to Create

- ✅ `/web/utils/api-client.ts` - Direct NestJS API client
- ✅ `/web/store/authStore.ts` - Auth state management
- ✅ `/web/utils/error-handler.ts` - Unified error handling
- ✅ Component-specific stores (venues, orders, messages, etc.)

---

## DETAILED COMPONENT CHECKLIST

### UI Components to Copy (Shadcn/ui - ~40 files)

- [ ] accordion.tsx
- [ ] alert-dialog.tsx
- [ ] alert.tsx
- [ ] aspect-ratio.tsx
- [ ] avatar.tsx
- [ ] badge.tsx
- [ ] breadcrumb.tsx
- [ ] button.tsx
- [ ] calendar.tsx
- [ ] card.tsx
- [ ] carousel.tsx
- [ ] chart.tsx
- [ ] checkbox.tsx
- [ ] collapsible.tsx
- [ ] command.tsx
- [ ] context-menu.tsx
- [ ] dialog.tsx
- [ ] drawer.tsx
- [ ] dropdown-menu.tsx
- [ ] form.tsx
- [ ] hover-card.tsx
- [ ] input-otp.tsx
- [ ] input.tsx
- [ ] label.tsx
- [ ] menubar.tsx
- [ ] navigation-menu.tsx
- [ ] pagination.tsx
- [ ] popover.tsx
- [ ] progress.tsx
- [ ] radio-group.tsx
- [ ] resizable.tsx
- [ ] scroll-area.tsx
- [ ] select.tsx
- [ ] separator.tsx
- [ ] sheet.tsx
- [ ] sidebar.tsx
- [ ] skeleton.tsx
- [ ] slider.tsx
- [ ] sonner.tsx
- [ ] switch.tsx
- [ ] table.tsx
- [ ] tabs.tsx
- [ ] textarea.tsx
- [ ] toggle-group.tsx
- [ ] toggle.tsx
- [ ] tooltip.tsx
- [ ] utils.ts

### Custom Components to Migrate (30+ files)

#### Core Components (Must-Have)
- [ ] MapView.tsx
- [ ] UserCard.tsx
- [ ] ConversationsList.tsx
- [ ] ChatView.tsx
- [ ] SendOfferDialog.tsx
- [ ] OfferCard.tsx
- [ ] VenueDetailSheet.tsx

#### Navigation & Layout
- [ ] Navigation.tsx
- [ ] WelcomeScreen.tsx
- [ ] SplashScreen.tsx
- [ ] LoadingStates.tsx
- [ ] SuccessAnimation.tsx
- [ ] ErrorBoundary.tsx

#### Forms & Authentication
- [ ] AuthScreen.tsx
- [ ] ProfileSettings.tsx
- [ ] AgeVerificationDialog.tsx
- [ ] AgeVerificationBadge.tsx

#### Features
- [ ] DrinkMenuDialog.tsx
- [ ] DrinkRedemptionDialog.tsx
- [ ] BartenderVerificationDialog.tsx
- [ ] DrinkLimitsCard.tsx
- [ ] FriendsView.tsx
- [ ] GroupsView.tsx
- [ ] UserDiscovery.tsx
- [ ] UserProfile.tsx
- [ ] GroupsView.tsx
- [ ] GroupDetailDialog.tsx
- [ ] CreateGroupDialog.tsx
- [ ] GroupChatDialog.tsx

#### Utilities
- [ ] QuickActions.tsx
- [ ] ConnectionStatus.tsx
- [ ] GeofenceManager.tsx
- [ ] CheckInConfirmationDialog.tsx
- [ ] ResponsibleDrinkingBanner.tsx
- [ ] AnimatedBackground.tsx
- [ ] OnboardingFlow.tsx

---

## NEXT STEPS

### Immediate Actions (This Week)

1. **Approval:** Confirm this integration strategy with tech team
2. **Resource Allocation:** Assign developers to migration
3. **Environment Setup:** Create dev branch for frontend integration
4. **Dependency Review:** Verify all packages compatible with Club App setup
5. **Create Integration Guide:** Document detailed migration steps

### First Sprint Tasks

1. Add dependencies to `web/package.json`
2. Copy Shadcn/ui components to `web/components/ui/`
3. Set up directory structure
4. Create API adapter layer skeleton
5. Create Zustand stores skeleton

### Testing Strategy

1. **Unit Tests:** Test components individually
2. **Integration Tests:** Test components with API adapter
3. **E2E Tests:** Test full user flows
4. **Regression Tests:** Ensure existing functionality still works
5. **Mobile Tests:** Cross-device responsive testing

---

## QUESTIONS FOR CLARIFICATION

Before starting implementation, please confirm:

1. **Deployment:** Should we deploy updated frontend to existing AWS infrastructure (Option B), or use separate CDN (Option A)?

2. **Auth:** Should we migrate user data from Supabase Auth to NestJS auth, or create a migration script?

3. **Mobile:** Should the React Native mobile app also use some of these components, or keep it separate?

4. **Timeline:** Is the 9-week timeline acceptable, or should we accelerate/de-prioritize certain components?

5. **Testing:** What level of test coverage is required before production deployment?

6. **Features:** Are all 30+ components needed, or can we prioritize a smaller subset for MVP?

---

## REFERENCES

### Related Documentation

- `COMPREHENSIVE_ARCHITECTURE_GUIDE.md` - Full Club App architecture
- `AWS_INFRASTRUCTURE_DEEP_DIVE.md` - AWS infrastructure details
- Club App API docs - http://localhost:3000/api/docs (after deployment)

### External Resources

- Shadcn/ui Documentation: https://ui.shadcn.com/
- Next.js Documentation: https://nextjs.org/docs
- Tailwind CSS Documentation: https://tailwindcss.com/docs
- NestJS Documentation: https://docs.nestjs.com/
- TypeScript Documentation: https://www.typescriptlang.org/docs/

---

**Document Version:** 1.0  
**Status:** Ready for Review  
**Next Review:** After team approval  
**Created by:** AI Assistant  
**Date:** October 30, 2025
