# AUTHENTICATION INTEGRATION GUIDE - Social Networking App → Club App

**Created:** October 30, 2025  
**Purpose:** Step-by-step guide for integrating Social Networking App authentication directly with Club App's Passport JWT  
**Approach:** Direct NestJS integration - NO Supabase, NO adapter layer  
**Status:** Ready for Implementation

---

## TABLE OF CONTENTS

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Phase 1: Setup (Weeks 1-2)](#phase-1-setup-weeks-1-2)
4. [Phase 2: API Client Creation (Weeks 1-2)](#phase-2-api-client-creation-weeks-1-2)
5. [Phase 3: Auth Store Setup (Weeks 2-3)](#phase-3-auth-store-setup-weeks-2-3)
6. [Phase 4: Component Migration (Weeks 3-4)](#phase-4-component-migration-weeks-3-4)
7. [Phase 5: Token Management (Week 5)](#phase-5-token-management-week-5)
8. [Phase 6: OAuth Integration (Week 5-6)](#phase-6-oauth-integration-week-5-6)
9. [Testing & Validation (Week 6-7)](#testing--validation-week-6-7)
10. [Troubleshooting](#troubleshooting)

---

## OVERVIEW

### Current State (Social Networking App)
- **Auth Provider:** Supabase Auth
- **Token Storage:** localStorage
- **Auth Mechanism:** Supabase JWT
- **Flow:** Email/Password, OAuth (Google, Facebook)

### Target State (Club App Integrated)
- **Auth Provider:** NestJS + Passport JWT (existing)
- **Token Storage:** httpOnly cookies + state
- **Auth Mechanism:** Passport JWT
- **Flow:** Same (Email/Password, OAuth)

### Key Principle
**NO BRIDGE OR ADAPTER** - Direct calls to NestJS endpoints

---

## ARCHITECTURE

### Data Flow

```
┌─────────────────────────────────────────────────────────┐
│  FRONTEND (Social Networking App Components)             │
│  - AuthScreen.tsx                                        │
│  - ProfileSettings.tsx                                   │
│  - Any component needing auth                            │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ Uses ↓
                   │
┌──────────────────────────────────────────────────────────┐
│  /web/utils/api-client.ts (NEW - Direct API)             │
│  - signup(email, password)                               │
│  - login(email, password)                                │
│  - logout()                                              │
│  - refreshToken()                                        │
│  - Token interceptors (automatic refresh)                │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ HTTP Calls ↓
                   │
┌──────────────────────────────────────────────────────────┐
│  NestJS Backend (EXISTING - Passport JWT)                │
│  - POST /api/auth/signup                                 │
│  - POST /api/auth/login                                  │
│  - POST /api/auth/refresh-token                          │
│  - POST /api/auth/logout                                 │
│  - POST /api/auth/google (OAuth)                         │
│  - POST /api/auth/facebook (OAuth)                       │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ Database Queries ↓
                   │
┌──────────────────────────────────────────────────────────┐
│  PostgreSQL Database (EXISTING)                          │
│  - Users table (hashed passwords)                        │
│  - Refresh tokens table                                  │
└──────────────────────────────────────────────────────────┘
```

---

### Interceptor Flow for Token Refresh

```
1. Frontend makes API call with expired token
   GET /api/users/me
   Headers: { Authorization: "Bearer expired_token" }

2. NestJS responds with 401 Unauthorized
   Response: { error: "Token expired" }

3. axios interceptor catches 401
   - Stores original request
   - Calls POST /api/auth/refresh-token
   - Gets new accessToken

4. New token automatically added to stored request
   GET /api/users/me
   Headers: { Authorization: "Bearer new_token" }

5. Original request retries and succeeds
   Response: { id, email, displayName, ... }

6. User never knows token was refreshed ✅
```

---

## PHASE 1: SETUP (WEEKS 1-2)

### Step 1.1: Remove Supabase Dependencies

**File:** `/web/package.json`

**BEFORE:**
```json
{
  "dependencies": {
    "@jsr/supabase__supabase-js": "^2.49.8",
    // ... other deps
  }
}
```

**AFTER:**
```json
{
  "dependencies": {
    // REMOVED: "@jsr/supabase__supabase-js"
    "axios": "^1.6.0",
    "zustand": "^4.4.0",
    // ... other deps (keep everything else)
  }
}
```

**Action:**
```bash
npm uninstall @jsr/supabase__supabase-js
npm install
```

---

### Step 1.2: Remove Supabase Files

**Delete these files:**
```
❌ /web/utils/supabase/
❌ /web/lib/supabase.ts (if exists)
❌ /web/config/supabase.ts (if exists)
```

**Verify these are removed from all components:**
```bash
# Search for all Supabase imports
grep -r "import.*supabase" web/src/
grep -r "from.*supabase" web/src/
grep -r "supabase\." web/src/

# Should return NOTHING if all removed
```

---

### Step 1.3: Environment Setup

**File:** `/web/.env.local`

**ADD/UPDATE:**
```
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
# OR for production:
# NEXT_PUBLIC_API_URL=https://api.desh.co/api

# Token Settings
NEXT_PUBLIC_TOKEN_EXPIRY=86400  # 24 hours in seconds
NEXT_PUBLIC_REFRESH_TOKEN_KEY=refreshToken
```

---

## PHASE 2: API CLIENT CREATION (WEEKS 1-2)

### Step 2.1: Create Direct API Client

**File:** `/web/utils/api-client.ts` (NEW)

```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';

interface ApiConfig {
  baseURL?: string;
  timeout?: number;
}

export class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private refreshQueue: Array<() => void> = [];

  constructor(config: ApiConfig = {}) {
    const baseURL = config.baseURL || process.env.NEXT_PUBLIC_API_URL || '/api';
    
    this.client = axios.create({
      baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Important for httpOnly cookies
    });

    this.setupInterceptors();
    this.loadTokensFromStorage();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor: Add token to headers
    this.client.interceptors.request.use((config) => {
      const token = this.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor: Handle 401 and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Handle 401 - token expired or invalid
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Token refresh in progress - queue this request
            return new Promise((resolve) => {
              this.refreshQueue.push(() => {
                resolve(this.client(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Attempt to refresh token
            await this.refreshToken();
            
            // Process queued requests
            this.refreshQueue.forEach(cb => cb());
            this.refreshQueue = [];
            this.isRefreshing = false;

            // Retry original request with new token
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed - redirect to login
            this.clearTokens();
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login';
            }
            return Promise.reject(refreshError);
          }
        }

        // Other errors - just reject
        return Promise.reject(error);
      }
    );
  }

  /**
   * Authentication Methods
   */

  async signup(email: string, password: string, displayName?: string) {
    try {
      const response = await this.client.post('/auth/signup', {
        email,
        password,
        displayName,
      });

      this.setTokens(response.data.accessToken, response.data.refreshToken);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async login(email: string, password: string) {
    try {
      const response = await this.client.post('/auth/login', {
        email,
        password,
      });

      this.setTokens(response.data.accessToken, response.data.refreshToken);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout() {
    try {
      await this.client.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  async refreshToken(): Promise<string> {
    try {
      const response = await this.client.post('/auth/refresh-token', {
        refreshToken: this.refreshToken,
      });

      this.setAccessToken(response.data.accessToken);
      return response.data.accessToken;
    } catch (error) {
      this.clearTokens();
      throw this.handleError(error);
    }
  }

  async googleLogin(token: string) {
    try {
      const response = await this.client.post('/auth/google', { token });
      this.setTokens(response.data.accessToken, response.data.refreshToken);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async facebookLogin(token: string) {
    try {
      const response = await this.client.post('/auth/facebook', { token });
      this.setTokens(response.data.accessToken, response.data.refreshToken);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Token Management
   */

  private setTokens(accessToken: string, refreshToken: string) {
    this.setAccessToken(accessToken);
    this.refreshToken = refreshToken;
    localStorage.setItem('refreshToken', refreshToken);
  }

  private setAccessToken(token: string) {
    this.accessToken = token;
    // Don't store access token in localStorage for security
    // It's stored in memory and sent via Authorization header
  }

  private getAccessToken(): string | null {
    if (!this.accessToken) {
      // Try to load from storage (for page refresh)
      // Note: In production, this would require a secure mechanism
      this.accessToken = sessionStorage.getItem('accessToken') || null;
    }
    return this.accessToken;
  }

  private clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('accessToken');
  }

  private loadTokensFromStorage() {
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Profile Methods
   */

  async getProfile() {
    const response = await this.client.get('/users/me');
    return response.data;
  }

  async updateProfile(data: any) {
    const response = await this.client.put('/users/me', data);
    return response.data;
  }

  /**
   * Generic Request Methods
   */

  get(url: string, config?: any) {
    return this.client.get(url, config);
  }

  post(url: string, data?: any, config?: any) {
    return this.client.post(url, data, config);
  }

  put(url: string, data?: any, config?: any) {
    return this.client.put(url, data, config);
  }

  delete(url: string, config?: any) {
    return this.client.delete(url, config);
  }

  /**
   * Error Handling
   */

  private handleError(error: any) {
    if (axios.isAxiosError(error)) {
      return {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        error: error.response?.data?.error,
      };
    }
    return error;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
```

---

### Step 2.2: Create Error Handler

**File:** `/web/utils/error-handler.ts` (NEW)

```typescript
export interface ApiError {
  status?: number;
  message: string;
  error?: string;
}

export function handleApiError(error: any): ApiError {
  if (error?.status) {
    return {
      status: error.status,
      message: error.message || 'An error occurred',
      error: error.error,
    };
  }

  if (error?.response?.status) {
    return {
      status: error.response.status,
      message: error.response.data?.message || error.message,
      error: error.response.data?.error,
    };
  }

  return {
    status: 500,
    message: error?.message || 'An unexpected error occurred',
  };
}

export function getErrorMessage(error: any): string {
  const apiError = handleApiError(error);

  switch (apiError.status) {
    case 400:
      return 'Invalid input - please check your details';
    case 401:
      return 'Unauthorized - please log in again';
    case 403:
      return 'You do not have permission for this action';
    case 404:
      return 'Resource not found';
    case 409:
      return 'This resource already exists';
    case 429:
      return 'Too many requests - please try again later';
    case 500:
      return 'Server error - please try again later';
    case 503:
      return 'Service unavailable - please try again later';
    default:
      return apiError.message || 'An error occurred';
  }
}
```

---

## PHASE 3: AUTH STORE SETUP (WEEKS 2-3)

### Step 3.1: Create Zustand Auth Store

**File:** `/web/store/authStore.ts` (NEW)

```typescript
import { create } from 'zustand';
import { apiClient } from '@/utils/api-client';
import { getErrorMessage } from '@/utils/error-handler';

export interface User {
  id: string;
  email: string;
  displayName: string;
  profileImage?: string;
  bio?: string;
  age?: number;
  interests?: string[];
  preferredDrinks?: string[];
  phoneVerified?: boolean;
  emailVerified?: boolean;
  stats?: {
    drinksReceived?: number;
    drinksGiven?: number;
    rating?: number;
    reviewCount?: number;
  };
}

export interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  signup: (email: string, password: string, displayName?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
  loadUser: () => Promise<void>;

  // Getters
  isLogged: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  signup: async (email, password, displayName) => {
    set({ isLoading: true, error: null });
    try {
      const result = await apiClient.signup(email, password, displayName);
      set({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const result = await apiClient.login(email, password);
      set({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.logout();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      });
    }
  },

  refreshSession: async () => {
    try {
      await apiClient.refreshToken();
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        error: getErrorMessage(error),
      });
    }
  },

  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
    });
  },

  clearError: () => {
    set({ error: null });
  },

  loadUser: async () => {
    set({ isLoading: true });
    try {
      const user = await apiClient.getProfile();
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  isLogged: () => {
    const { isAuthenticated } = get();
    return isAuthenticated;
  },
}));
```

---

## PHASE 4: COMPONENT MIGRATION (WEEKS 3-4)

### Step 4.1: Update AuthScreen Component

**File:** `/web/components/AuthScreen.tsx` (UPDATED)

**BEFORE (with Supabase):**
```typescript
import { supabase } from '@/utils/supabase/client';

export function AuthScreen({ onAuthSuccess }: Props) {
  const handleSignup = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUpWithPassword({
      email,
      password,
    });
    if (error) {
      toast.error(error.message);
    } else {
      onAuthSuccess(data.user);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      toast.error(error.message);
    } else {
      onAuthSuccess(data.user);
    }
  };
  // ...
}
```

**AFTER (Direct NestJS):**
```typescript
import { apiClient } from '@/utils/api-client';
import { useAuthStore } from '@/store/authStore';
import { getErrorMessage } from '@/utils/error-handler';
import { toast } from 'sonner';

export function AuthScreen({ onAuthSuccess }: Props) {
  const { signup, login, error, clearError } = useAuthStore();

  const handleSignup = async (email: string, password: string, displayName: string) => {
    try {
      await signup(email, password, displayName);
      toast.success('Account created successfully!');
      onAuthSuccess?.();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      toast.success('Logged in successfully!');
      onAuthSuccess?.();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="auth-screen">
      {/* Your existing UI */}
      <form onSubmit={(e) => {
        e.preventDefault();
        // Use handleSignup or handleLogin
      }}>
        {error && <Alert className="error">{error}</Alert>}
        {/* Form fields */}
      </form>
    </div>
  );
}
```

---

### Step 4.2: Update App Root Component

**File:** `/web/src/App.tsx` (UPDATED)

**ADD Auth Check on App Load:**

```typescript
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';

function App() {
  const { loadUser, isLoading, isAuthenticated } = useAuthStore();

  // Load user profile on app mount
  useEffect(() => {
    const initAuth = async () => {
      // Check if user has valid refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          await loadUser();
        } catch (error) {
          console.error('Failed to load user:', error);
          // User will be shown login screen
        }
      }
    };

    initAuth();
  }, [loadUser]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={() => loadUser()} />;
  }

  return (
    <div className="app-container">
      {/* Your existing app UI */}
    </div>
  );
}

export default App;
```

---

### Step 4.3: Update ProfileSettings Component

**File:** `/web/components/ProfileSettings.tsx` (UPDATED)

```typescript
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/utils/api-client';
import { toast } from 'sonner';

export function ProfileSettings() {
  const { user, setUser, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (data: any) => {
    setLoading(true);
    try {
      const updated = await apiClient.updateProfile(data);
      setUser(updated);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/auth/login';
  };

  return (
    <div className="profile-settings">
      {/* Your existing profile UI */}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

---

## PHASE 5: TOKEN MANAGEMENT (WEEK 5)

### Step 5.1: Token Storage Strategy

**httpOnly Cookies (Most Secure - Backend Managed):**
- Backend sets JWT in httpOnly cookie
- Automatically included in all requests
- Frontend can't access directly (secure against XSS)
- Automatically cleared on logout

**Implementation in NestJS (Backend):**
```typescript
// Already implemented in Club App
res.cookie('accessToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
});
```

**Implementation in Frontend:**
```typescript
// /web/utils/api-client.ts already handles this
// withCredentials: true enables cookie transmission
this.client = axios.create({
  withCredentials: true,  // ← This is the key
});
```

---

### Step 5.2: Token Refresh Strategy

**Current Implementation:**
- Access token expires in 24 hours
- Refresh token expires in 30 days
- Automatic refresh on 401 response
- Queue requests during refresh

**Automatic Refresh Diagram:**
```
1. User makes request with expired token
   ↓
2. Backend returns 401
   ↓
3. Frontend intercepts 401
   ↓
4. Frontend calls POST /api/auth/refresh-token
   ↓
5. Backend validates refresh token
   ↓
6. Backend returns new access token
   ↓
7. Frontend retries original request
   ↓
8. Request succeeds ✅
```

**Testing Token Refresh:**
```typescript
// In browser console
// 1. Login
await apiClient.login('user@example.com', 'password');

// 2. Make a request (note the token in Authorization header)
await apiClient.get('/users/me');
// Success ✅

// 3. Wait for token to expire (or manually clear access token)
sessionStorage.removeItem('accessToken');

// 4. Make another request
// Interceptor will automatically refresh and retry
await apiClient.get('/users/me');
// Still succeeds ✅ (token was refreshed automatically)
```

---

## PHASE 6: OAUTH INTEGRATION (WEEK 5-6)

### Step 6.1: Google OAuth Setup

**File:** `/web/components/AuthScreen.tsx`

```typescript
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { apiClient } from '@/utils/api-client';
import { useAuthStore } from '@/store/authStore';

function AuthScreen() {
  const { setUser } = useAuthStore();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const result = await apiClient.googleLogin(credentialResponse.credential);
      setUser(result.user);
      toast.success('Logged in with Google!');
      onAuthSuccess?.();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <div className="auth-options">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => toast.error('Google login failed')}
          text="signup_with"
        />
      </div>
    </GoogleOAuthProvider>
  );
}
```

**Environment Setup:**
```
# .env.local
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

---

### Step 6.2: Facebook OAuth Setup

**File:** `/web/components/AuthScreen.tsx`

```typescript
import FacebookLogin from 'react-facebook-login';
import { apiClient } from '@/utils/api-client';
import { useAuthStore } from '@/store/authStore';

function AuthScreen() {
  const { setUser } = useAuthStore();

  const handleFacebookResponse = async (response: any) => {
    try {
      const result = await apiClient.facebookLogin(response.accessToken);
      setUser(result.user);
      toast.success('Logged in with Facebook!');
      onAuthSuccess?.();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="auth-options">
      <FacebookLogin
        appId={process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!}
        autoLoad={false}
        fields="name,email,picture"
        callback={handleFacebookResponse}
        cssClass="facebook-login-button"
      />
    </div>
  );
}
```

**Environment Setup:**
```
# .env.local
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id_here
```

---

## TESTING & VALIDATION (WEEK 6-7)

### Test 1: Basic Authentication Flow

```typescript
describe('Authentication', () => {
  it('should signup a new user', async () => {
    const result = await apiClient.signup(
      'test@example.com',
      'password123',
      'Test User'
    );

    expect(result.user.email).toBe('test@example.com');
    expect(result.user.displayName).toBe('Test User');
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });

  it('should login an existing user', async () => {
    const result = await apiClient.login(
      'test@example.com',
      'password123'
    );

    expect(result.user.email).toBe('test@example.com');
    expect(result.accessToken).toBeDefined();
  });

  it('should reject invalid credentials', async () => {
    expect(async () => {
      await apiClient.login('test@example.com', 'wrongpassword');
    }).rejects.toThrow();
  });

  it('should refresh token', async () => {
    await apiClient.login('test@example.com', 'password123');
    const newToken = await apiClient.refreshToken();
    expect(newToken).toBeDefined();
  });

  it('should logout', async () => {
    await apiClient.login('test@example.com', 'password123');
    await apiClient.logout();
    expect(apiClient.isAuthenticated()).toBe(false);
  });
});
```

### Test 2: Token Refresh on 401

```typescript
describe('Token Refresh Interceptor', () => {
  it('should refresh token on 401 response', async () => {
    await apiClient.login('test@example.com', 'password123');

    // Make request - should succeed
    let response = await apiClient.get('/users/me');
    expect(response.status).toBe(200);

    // Manually expire token
    sessionStorage.removeItem('accessToken');

    // Make another request
    // Should automatically refresh and retry
    response = await apiClient.get('/users/me');
    expect(response.status).toBe(200);
  });

  it('should queue requests during refresh', async () => {
    await apiClient.login('test@example.com', 'password123');

    // Manually expire token
    sessionStorage.removeItem('accessToken');

    // Make multiple requests simultaneously
    const requests = [
      apiClient.get('/users/me'),
      apiClient.get('/venues'),
      apiClient.get('/orders'),
    ];

    const results = await Promise.all(requests);
    
    // All should succeed with refreshed token
    results.forEach(result => {
      expect(result.status).toBe(200);
    });
  });

  it('should redirect to login if refresh fails', async () => {
    // This test verifies the fallback behavior
    // Would require mocking window.location.href
  });
});
```

### Test 3: Auth Store Integration

```typescript
describe('Auth Store', () => {
  it('should manage login state', async () => {
    const store = useAuthStore.getState();

    expect(store.isAuthenticated).toBe(false);

    await store.login('test@example.com', 'password123');
    expect(store.isAuthenticated).toBe(true);
    expect(store.user).toBeDefined();

    await store.logout();
    expect(store.isAuthenticated).toBe(false);
    expect(store.user).toBeNull();
  });

  it('should handle errors gracefully', async () => {
    const store = useAuthStore.getState();
    store.clearError();

    try {
      await store.login('test@example.com', 'wrongpassword');
    } catch (error) {
      expect(store.error).toBeDefined();
    }

    store.clearError();
    expect(store.error).toBeNull();
  });
});
```

---

## TROUBLESHOOTING

### Issue 1: "Token is undefined"

**Symptom:**
```
POST /api/auth/refresh-token 401 Unauthorized
```

**Cause:** Access token not stored properly

**Solution:**
```typescript
// Check if token is stored
console.log('Access token:', apiClient.getAccessToken());
console.log('Refresh token:', localStorage.getItem('refreshToken'));

// Verify setTokens is called
// Verify not clearing tokens prematurely
```

---

### Issue 2: "CORS error when login"

**Symptom:**
```
Access to XMLHttpRequest at 'http://localhost:3000/api/auth/login' 
from origin 'http://localhost:3001' has been blocked by CORS policy
```

**Cause:** CORS not configured on backend

**Solution:**
Check backend `/src/main.ts`:
```typescript
app.enableCors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true, // ← This is important!
});
```

---

### Issue 3: "Infinite redirect loop"

**Symptom:**
```
Page keeps redirecting to /auth/login infinitely
```

**Cause:** Token refresh keeps failing

**Solution:**
```typescript
// Check 1: Is backend returning new token?
// Check 2: Is error handling correct?
// Check 3: Is there a fallback for when refresh fails?

// Debug in api-client.ts
console.log('Refresh token error:', error);
console.log('Clearing tokens and redirecting...');
```

---

### Issue 4: "User logged in but profile not loading"

**Symptom:**
```
isAuthenticated = true
user = null
```

**Cause:** loadUser() not called after login

**Solution:**
```typescript
// After login, always call loadUser
await useAuthStore.getState().login(email, password);
await useAuthStore.getState().loadUser();

// OR use callback in App.tsx
useEffect(() => {
  if (isAuthenticated && !user) {
    loadUser();
  }
}, [isAuthenticated, user, loadUser]);
```

---

### Issue 5: "httpOnly cookie not being sent"

**Symptom:**
```
Authorization header always empty
Cookie not in request headers
```

**Cause:** withCredentials not set

**Solution:**
```typescript
// Check in api-client.ts
this.client = axios.create({
  withCredentials: true, // ← Must be true
  // ...
});
```

---

## SECURITY BEST PRACTICES

### 1. Never store access token in localStorage

```typescript
// ❌ BAD
localStorage.setItem('accessToken', token);

// ✅ GOOD
// Store in memory or httpOnly cookie (backend handles)
```

### 2. Always use HTTPS in production

```typescript
// In api-client.ts
headers: {
  'Content-Type': 'application/json',
  // No sensitive data in headers except Bearer token
}
```

### 3. Clear tokens on logout

```typescript
// ✅ GOOD
async logout() {
  await apiClient.logout();
  localStorage.removeItem('refreshToken');
  sessionStorage.removeItem('accessToken');
  // Redirect to login
}
```

### 4. Validate tokens don't expire while in use

```typescript
// Implement idle timeout
const setupIdleTimeout = () => {
  let idleTimer: NodeJS.Timeout;

  const resetTimer = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      useAuthStore.getState().logout();
    }, 30 * 60 * 1000); // 30 minutes idle
  };

  window.addEventListener('mousemove', resetTimer);
  window.addEventListener('keypress', resetTimer);
};
```

---

## DEPLOYMENT CHECKLIST

- [ ] All Supabase code removed
- [ ] API client created and tested
- [ ] Auth store created and tested
- [ ] AuthScreen component updated
- [ ] App component has auth check on mount
- [ ] Environment variables configured
- [ ] OAuth credentials added (Google, Facebook)
- [ ] Token refresh logic tested
- [ ] Error handling tested
- [ ] CORS configured on backend
- [ ] HTTPS enabled in production
- [ ] Security headers configured
- [ ] Test complete auth flow (signup, login, logout, refresh)

---

**Document Version:** 1.0  
**Status:** Ready for Implementation  
**Last Updated:** October 30, 2025  
**Created by:** AI Assistant
