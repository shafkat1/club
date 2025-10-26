# React Native + Expo Mobile App Setup

## Quick Start

```bash
cd mobile
npm install
npx expo start
```

Press `i` for iOS, `a` for Android, or `w` for web.

## Project Structure

```
mobile/
├── app.json                    # Expo config
├── package.json
├── tsconfig.json
├── src/
│   ├── app/                    # React Navigation screens
│   │   ├── (auth)/            # Auth flow (login, OTP)
│   │   ├── (app)/             # Main app
│   │   │   ├── map/           # Map screen
│   │   │   ├── profile/       # User profile
│   │   │   ├── orders/        # Orders
│   │   │   └── settings/      # Settings
│   │   └── _layout.tsx        # Root layout
│   ├── components/            # Reusable UI
│   │   ├── VenueCard.tsx
│   │   ├── PeopleList.tsx
│   │   ├── Button.tsx
│   │   └── Input.tsx
│   ├── hooks/                 # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useLocation.ts
│   │   └── useVenues.ts
│   ├── services/              # API & external services
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── location.ts
│   ├── store/                 # State management (Zustand)
│   │   ├── auth.store.ts
│   │   ├── venue.store.ts
│   │   └── user.store.ts
│   └── utils/                 # Helpers
│       ├── constants.ts
│       ├── validation.ts
│       └── geo.ts
└── assets/                    # Images, fonts
```

## Key Dependencies

```json
{
  "expo": "^50.0.0",
  "expo-router": "^2.0.0",
  "react-native": "^0.73.0",
  "react-native-maps": "^1.8.0",
  "react-native-vision-camera": "^4.0.0",
  "vision-camera-code-scanner": "^0.1.0",
  "zustand": "^4.4.0",
  "react-query": "^3.39.0",
  "axios": "^1.6.0",
  "stripe-react-native": "^0.32.0",
  "@react-native-google-signin/google-signin": "^10.0.0",
  "@react-native-async-storage/async-storage": "^1.21.0",
  "expo-location": "^16.3.0",
  "expo-notifications": "^0.26.0",
  "react-native-gesture-handler": "^2.14.0",
  "react-native-reanimated": "^3.6.0",
  "expo-status-bar": "^1.11.0"
}
```

## Setup Steps

### 1. Initialize Project

```bash
npx create-expo-app --template mobile
cd mobile
npm install
```

### 2. Add Routing

```bash
npx expo install expo-router expo-constants expo-linking
npx expo install react-native-gesture-handler react-native-reanimated expo-splash-screen
```

### 3. Create app.json

```json
{
  "expo": {
    "name": "Club",
    "slug": "clubapp",
    "version": "1.0.0",
    "assetBundlePatterns": ["**/*"],
    "plugins": [
      [
        "expo-router",
        { "origin": false }
      ],
      [
        "@react-native-google-signin/google-signin",
        { "iosUrlScheme": "com.googleusercontent.apps...." }
      ],
      "expo-location",
      "expo-notifications"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.clubapp"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.clubapp"
    }
  }
}
```

### 4. Authentication Flow (app/(auth)/login.tsx)

```typescript
import { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const { loginWithPhone } = useAuth();

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Phone number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <Button title="Send OTP" onPress={() => loginWithPhone(phone)} />
    </View>
  );
}
```

### 5. Map Screen (app/(app)/map/index.tsx)

```typescript
import { useEffect, useState } from 'react';
import MapView, { Marker, Cluster } from 'react-native-maps';
import { useVenues } from '@/hooks/useVenues';

export default function MapScreen() {
  const { venues, loading } = useVenues();

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: 40.7128,
        longitude: -74.0060,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
    >
      {venues.map(venue => (
        <Marker
          key={venue.id}
          coordinate={{ latitude: venue.latitude, longitude: venue.longitude }}
          title={venue.name}
        />
      ))}
    </MapView>
  );
}
```

### 6. State Management (store/auth.store.ts)

```typescript
import { create } from 'zustand';

interface AuthStore {
  user: any | null;
  token: string | null;
  login: (phone: string, otp: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  login: async (phone, otp) => {
    // Call API
    set({ user: { phone }, token: 'jwt-token' });
  },
  logout: () => set({ user: null, token: null }),
}));
```

### 7. API Service (services/api.ts)

```typescript
import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  venues: {
    search: (lat: number, lng: number) =>
      apiClient.get('/venues', { params: { lat, lng } }),
  },
  orders: {
    create: (data: any) => apiClient.post('/orders', data),
    list: () => apiClient.get('/me/orders'),
  },
  auth: {
    sendOtp: (phone: string) => apiClient.post('/auth/otp/send', { phone }),
    verifyOtp: (phone: string, code: string) =>
      apiClient.post('/auth/otp/verify', { phone, code }),
  },
};
```

## Running Tests

```bash
npm run test
```

## Building for Production

### iOS

```bash
eas build --platform ios
eas submit --platform ios  # Submit to App Store
```

### Android

```bash
eas build --platform android
eas submit --platform android  # Submit to Google Play
```

## Common Issues

- **Maps not showing**: Ensure API keys are set in app.json
- **Camera permissions**: Add to app.json under `plugins`
- **Location errors**: Grant permissions (iOS requests runtime)

For details: https://docs.expo.dev/
