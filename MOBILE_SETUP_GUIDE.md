# 📱 Mobile App Setup Guide (React Native + Expo)

Quick reference for setting up and developing the Club App mobile frontend using React Native and Expo.

## 🚀 Quick Start

### Prerequisites
```bash
# Check Node.js version (must be 18+)
node --version

# Install Expo CLI globally
npm install -g expo-cli

# Or use npx (no installation needed)
npx expo@latest
```

### Initial Setup
```bash
cd mobile

# 1. Install dependencies
npm install

# 2. Create .env.local
cp .env.example .env.local

# 3. Update .env.local with your backend URL
# For local development:
REACT_NATIVE_API_URL=http://localhost:3001
# For same network:
REACT_NATIVE_API_URL=http://YOUR_IP:3001
# For remote:
REACT_NATIVE_API_URL=https://ngrok-url.ngrok.io

# 4. Start development server
npm start
```

## 📱 Development

### Running on Different Platforms

```bash
cd mobile

# iOS Simulator (macOS only)
npm run ios

# Android Emulator
npm run android

# Expo Go App (on physical device)
npm start
# Then scan QR code with Expo Go app

# Web Version (for testing)
npm run web
```

### Development Workflow

```bash
# Start Expo dev server
npm start

# In the Expo CLI menu, press:
# i - iOS simulator
# a - Android emulator
# w - Web browser
# j - Jump to logs
# r - Reload app
# s - Switch Metro bundler mode
# o - Open project in Xcode
# ```

### Common Development Tasks

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Linting with fix
npm run lint -- --fix

# Running tests
npm test

# Clearing cache
npx expo start --clear

# Resetting watchman
watchman watch-del-all
```

## 🔧 Configuration Files

### app.json (Main Config)
```json
{
  "expo": {
    "name": "Club",
    "slug": "club-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png"
    },
    "platforms": ["ios", "android", "web"],
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png"
      },
      "package": "com.desh.club"
    },
    "ios": {
      "supportsTabletMode": true,
      "bundleIdentifier": "com.desh.club"
    },
    "plugins": [
      ["expo-location"],
      ["expo-camera"],
      ["expo-notifications"]
    ]
  }
}
```

### eas.json (EAS Build Config)
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": true
      }
    },
    "preview2": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": true
      }
    },
    "preview3": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "ios": {
        "distribution": "store"
      },
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "ascAppId": 123456789
      },
      "android": {
        "serviceAccountKeyPath": "./path/to/keyfile.json",
        "track": "internal"
      }
    }
  }
}
```

## 🏗️ Project Structure

```
mobile/
├── app/                          # Expo Router navigation
│   ├── (auth)/                  # Auth route group
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (app)/                   # Authenticated routes
│   │   ├── _layout.tsx
│   │   ├── map.tsx
│   │   ├── discover/
│   │   ├── groups/
│   │   ├── friends/
│   │   └── ...
│   └── _layout.tsx              # Root layout
│
├── src/                         # Source code
│   ├── lib/                     # Utilities
│   │   ├── api.ts             # API client
│   │   ├── auth.ts            # Auth utilities
│   │   └── errors.ts
│   ├── store/                   # Zustand stores
│   │   ├── authStore.ts
│   │   ├── venueStore.ts
│   │   └── userStore.ts
│   ├── screens/                 # Screen components
│   ├── components/              # Reusable components
│   └── types/                   # TypeScript types
│
├── assets/                      # Images, fonts, etc.
├── app.json                     # Expo config
├── eas.json                     # EAS Build config
├── metro.config.js              # Metro bundler config
├── package.json
├── tsconfig.json
└── .env.example
```

## 🌐 API Integration

### Direct Backend Connection

```typescript
// src/lib/api.ts
import axios from 'axios';

const API_URL = process.env.REACT_NATIVE_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Add interceptors for token management
apiClient.interceptors.request.use((config) => {
  // Add auth token if available
  return config;
});
```

### Usage Example

```typescript
// In a component
import { apiClient } from '../lib/api';

const loginUser = async (phone: string, otp: string) => {
  try {
    const response = await apiClient.post('/auth/login', {
      phone,
      otp,
    });
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

## 📦 Building & Deployment

### Local Build (Development)

```bash
# iOS (macOS only)
cd ios
pod install
cd ..
npm run ios

# Android
npm run android
```

### EAS Build (Production)

```bash
# Login to Expo
eas login

# Configure EAS for your project
eas build:configure

# Build for iOS (TestFlight)
eas build --platform ios --profile production

# Build for Android (Google Play)
eas build --platform android --profile production

# Submit to App Stores
eas submit --platform ios
eas submit --platform android
```

### Manual Build

```bash
# iOS
eas build --platform ios --type simulator # Simulator
eas build --platform ios --type archive   # Device

# Android
eas build --platform android --type apk   # APK
eas build --platform android --type app-bundle # AAB (for Play Store)
```

## 🔑 Permissions & Native Modules

### Required Permissions

Update `app.json`:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow Club to access your location"
        }
      ],
      [
        "expo-camera",
        {
          "cameraPermission": "Allow Club to access your camera"
        }
      ],
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png"
        }
      ]
    ]
  }
}
```

### Install Native Modules

```bash
# Location Services
expo install expo-location

# Camera
expo install expo-camera

# Push Notifications
expo install expo-notifications expo-device

# Maps
npm install react-native-maps
expo install react-native-maps
```

## 🧪 Testing

### Unit Testing

```bash
# Run tests
npm test

# Watch mode
npm test -- --watch

# With coverage
npm test -- --coverage
```

### E2E Testing (Optional)

```bash
# Install Detox
npm install detox-cli --global

# Build test app
detox build-framework-cache
detox build-app-cache

# Run tests
detox test
```

## 📊 Performance Tips

### Optimize Bundle Size

```bash
# Analyze bundle
npx expo-bundle-analyzer

# Tree shake unused code
npm run build:android -- --optimize
```

### Reduce Build Time

```bash
# Use prebuild cache
eas build --platform ios --cache-commits 10

# Use internal builds
eas build --platform android --profile preview
```

## 🐛 Debugging

### Expo DevTools

```bash
# Press 'd' in Expo CLI to open DevTools
# Features:
# - React DevTools
# - Redux DevTools (if using Redux)
# - Network tab
# - Console
```

### React Native Debugger

```bash
# Install
npm install --save-dev react-native-debugger

# Open debugger
react-native-debugger

# Connect app
# In Expo menu, select "Debug with Chrome"
```

### Console Logs

```bash
# View logs in terminal
npm start
# Then watch the output

# Or in Expo menu, press 'j' for logs
```

## 🔗 Linking & Deep Links

### Configure Deep Linking

```json
{
  "expo": {
    "scheme": "club",
    "plugins": [
      [
        "expo-linking",
        {
          "customScheme": "club"
        }
      ]
    ]
  }
}
```

### Handle Deep Links

```typescript
import * as Linking from 'expo-linking';

export function useDeepLink() {
  useEffect(() => {
    const handleUrl = (event: { url: string }) => {
      const url = event.url.replace(/.*?:\/\//g, '');
      
      if (url.startsWith('map')) {
        // Navigate to map
      } else if (url.startsWith('profile')) {
        // Navigate to profile
      }
    };

    Linking.addEventListener('url', handleUrl);

    return () => {
      Linking.removeEventListener('url', handleUrl);
    };
  }, []);
}
```

## 📱 Submitting to App Stores

### App Store (iOS)

```bash
# Prerequisites
# - Apple Developer Account
# - App Certificate
# - Provisioning Profiles

# Configure in eas.json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-email@example.com",
        "ascAppId": 1234567890
      }
    }
  }
}

# Submit
eas submit --platform ios
```

### Google Play (Android)

```bash
# Prerequisites
# - Google Play Developer Account
# - Keystore file
# - Google Play credentials

# Configure in eas.json
{
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./android-keystore.json",
        "track": "internal"  # internal, alpha, beta, production
      }
    }
  }
}

# Submit
eas submit --platform android
```

## 🔄 Continuous Integration

See `.github/workflows/mobile-deploy.yml` for automated deployment.

### Manual Deployment

```bash
# Test build
npm run lint
npm run type-check
npm test

# Build
eas build --platform ios --platform android

# Submit
eas submit --platform ios --platform android
```

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [Expo Router Guide](https://docs.expo.dev/routing/introduction/)
- [EAS Build Guide](https://docs.expo.dev/eas-update/introduction/)
- [App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Guidelines](https://play.google.com/about/developer-content-policy/)

## 🆘 Common Issues

### Build Fails

```bash
# Clear cache
rm -rf node_modules .expo
npm install

# Update EAS
npm install -g eas-cli@latest

# Check logs
eas build --platform ios --logs
```

### Connection Issues

```bash
# Use ngrok for local network
ngrok http 3001

# Update .env.local
REACT_NATIVE_API_URL=https://your-ngrok.ngrok.io
```

### Simulator/Emulator Issues

```bash
# Restart Xcode (iOS)
killall "Simulator"

# Restart emulator (Android)
adb devices
adb -s <device-id> emu kill

# Reset Metro
watchman watch-del-all
```

---

**Last Updated**: October 2025
