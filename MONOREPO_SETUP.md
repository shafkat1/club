# 🏗️ Club App - Monorepo Setup Guide

A comprehensive guide for the Club App monorepo containing backend (NestJS), web frontend (Next.js), and mobile (React Native/Expo).

## 📋 Table of Contents

1. [Repository Structure](#repository-structure)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Environment Setup](#environment-setup)
5. [Development Workflow](#development-workflow)
6. [Deployment](#deployment)
7. [Scripts & Commands](#scripts--commands)
8. [CI/CD Pipeline](#cicd-pipeline)
9. [Troubleshooting](#troubleshooting)

---

## 📁 Repository Structure

```
club/
├── backend/                          # NestJS Backend (Node.js)
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── modules/
│   │   ├── dto/
│   │   ├── pipes/
│   │   └── main.ts
│   ├── prisma/                       # Database ORM
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── package.json
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── README.md
│
├── web/                              # Next.js Web Frontend
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (dashboard)/
│   │   │   └── ...
│   │   ├── map/page.tsx
│   │   ├── discover/page.tsx
│   │   ├── friends/page.tsx
│   │   ├── groups/page.tsx
│   │   ├── offers/page.tsx
│   │   ├── messages/page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── Navigation.tsx
│   │   └── ...
│   ├── store/
│   │   ├── authStore.ts
│   │   └── ...
│   ├── utils/
│   │   ├── api-client.ts
│   │   └── error-handler.ts
│   ├── styles/
│   ├── public/
│   ├── package.json
│   ├── next.config.js
│   ├── tsconfig.json
│   └── README.md
│
├── mobile/                           # React Native + Expo Mobile App
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login.tsx
│   │   │   └── signup.tsx
│   │   ├── (app)/
│   │   │   ├── map.tsx
│   │   │   ├── discover/
│   │   │   ├── groups/
│   │   │   └── ...
│   │   └── _layout.tsx
│   ├── src/
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── auth.ts
│   │   ├── store/
│   │   ├── screens/
│   │   └── ...
│   ├── assets/
│   ├── package.json
│   ├── app.json
│   ├── eas.json                      # Expo Application Services config
│   ├── tsconfig.json
│   └── README.md
│
├── infra/                            # Infrastructure as Code (Terraform)
│   ├── terraform/
│   │   ├── main.tf
│   │   ├── ecs.tf
│   │   ├── rds.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── terraform.tfvars
│   └── README.md
│
├── .github/
│   ├── workflows/
│   │   ├── web-deploy.yml            # Next.js frontend deployment
│   │   ├── mobile-deploy.yml         # React Native/Expo deployment
│   │   ├── deploy-backend.yml        # NestJS backend deployment
│   │   └── terraform.yml             # Infrastructure deployment
│   └── PULL_REQUEST_TEMPLATE.md
│
├── .env.example                      # Shared environment variables template
├── docker-compose.yml                # Local development environment
├── package.json                      # Root package.json (optional, for shared scripts)
├── README.md
└── MONOREPO_SETUP.md                 # This file
```

---

## 🛠️ Tech Stack

### Backend
- **Framework**: NestJS (TypeScript)
- **Runtime**: Node.js 18+
- **Database**: PostgreSQL 16.4 (Multi-AZ via AWS RDS)
- **ORM**: Prisma
- **Authentication**: Passport.js (JWT + OAuth)
- **API**: RESTful with Swagger/OpenAPI
- **Real-time**: Socket.io
- **Cache**: Redis 7.1 (Multi-AZ via ElastiCache)
- **File Storage**: AWS S3
- **Monitoring**: Sentry + CloudWatch
- **Testing**: Jest

### Web Frontend
- **Framework**: Next.js 14 (React 18, TypeScript)
- **Styling**: Tailwind CSS
- **Components**: Shadcn/ui + Custom
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Maps**: Leaflet
- **Icons**: Lucide React
- **Real-time**: Socket.io-client
- **QR Scanning**: @zxing/browser

### Mobile Frontend
- **Framework**: React Native + Expo
- **Router**: Expo Router
- **Styling**: NativeWind (Tailwind for RN) + Custom
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Maps**: Leaflet (via expo-webview or react-native-maps)
- **Location**: expo-location
- **Camera**: expo-camera
- **Notifications**: expo-notifications
- **Build**: EAS Build (Expo Application Services)

### Infrastructure
- **IaC**: Terraform
- **Cloud**: AWS (ECS Fargate, RDS, ElastiCache, S3, CloudFront, Route53)
- **Container Registry**: Amazon ECR
- **CI/CD**: GitHub Actions with OIDC

---

## 📋 Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Git**: 2.x or higher
- **Docker**: 24.x or higher (optional, for local database)
- **Terraform**: 1.x or higher (for infrastructure changes)

### Accounts & Services
- GitHub (with repository access)
- AWS Account (for deployment)
- Apple Developer Account (for iOS deployment)
- Google Play Developer Account (for Android deployment)
- Expo Account (for mobile app management)
- Twilio Account (for OTP/SMS)
- Stripe Account (for payments)

---

## 🔧 Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/desh/club.git
cd club
```

### 2. Copy Environment Files

```bash
# Root level (shared)
cp .env.example .env.local

# Web frontend
cp web/.env.example web/.env.local

# Mobile frontend
cp mobile/.env.example mobile/.env.local

# Backend (if needed)
cp backend/.env.example backend/.env.local
```

### 3. Configure Environment Variables

Edit `.env.local` in each directory with your specific values:

#### Root `.env.local` (Shared Configuration)
```bash
# API endpoints
NEXT_PUBLIC_API_URL=http://localhost:3000/api
REACT_NATIVE_API_URL=http://localhost:3001
BACKEND_URL=http://localhost:3001

# Ports
BACKEND_PORT=3001
WEB_PORT=3000
EXPO_PORT=19000

# Authentication
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRY=7d

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/club_dev
REDIS_URL=redis://localhost:6379

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret

# Services
TWILIO_ACCOUNT_SID=your_sid
STRIPE_PUBLIC_KEY=pk_test_...
```

#### Web `.env.local` (Next.js Specific)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_ENVIRONMENT=development
```

#### Mobile `.env.local` (React Native Specific)
```bash
REACT_NATIVE_API_URL=http://localhost:3001
EXPO_PUBLIC_ENVIRONMENT=development
```

### 4. Install Dependencies

```bash
# Install all dependencies
npm install

# Or individually:
cd backend && npm install && cd ..
cd web && npm install && cd ..
cd mobile && npm install && cd ..
```

### 5. Setup Local Database

```bash
# Using Docker (recommended for development)
docker-compose up -d

# Or manually setup PostgreSQL and Redis
# Then run migrations:
cd backend
npm run prisma:migrate:dev
```

---

## 🚀 Development Workflow

### Start All Services

**Option 1: Individual terminals (recommended for development)**

```bash
# Terminal 1: Backend (runs on port 3001)
cd backend
npm run dev

# Terminal 2: Web Frontend (runs on port 3000)
cd web
npm run dev

# Terminal 3: Mobile Frontend (runs on Expo port 19000)
cd mobile
npm start

# Terminal 4: Watch for Terraform changes (optional)
cd infra/terraform
terraform plan -out=tfplan
```

**Option 2: Using Docker Compose (for production-like environment)**

```bash
docker-compose -f docker-compose.yml up

# Or in background:
docker-compose -f docker-compose.yml up -d
```

### Web Frontend Development

```bash
cd web

# Start dev server
npm run dev

# Access at: http://localhost:3000
# Login page: http://localhost:3000/login
# App pages: http://localhost:3000/map, /discover, etc.

# Build for production
npm run build

# Start production build
npm start
```

### Mobile Development with Expo

```bash
cd mobile

# Start Expo dev server
npm start

# Press:
# - 'i' to open iOS simulator
# - 'a' to open Android emulator
# - 'w' to open web version

# Or scan QR code with Expo Go app on physical device

# Type check
npm run type-check

# Lint
npm run lint

# Run tests
npm test
```

### Backend Development

```bash
cd backend

# Start dev server with hot reload
npm run dev

# API documentation: http://localhost:3001/api/docs

# Run migrations
npm run prisma:migrate:dev

# Generate Prisma types
npm run prisma:generate

# Seed database (if seed script exists)
npm run seed
```

---

## 🌐 API Communication

### Web Frontend → Backend

```
HTTP Requests:
Web (localhost:3000) 
  → Next.js rewrites /api/* 
  → Backend (localhost:3001)

Example:
- Frontend request: POST /api/auth/login
- Next.js config: rewrites /api/* → http://localhost:3001/*
- Backend endpoint: POST /auth/login
```

### Mobile → Backend

```
Direct HTTP Requests:
Mobile (Expo on Device/Emulator)
  → Backend (localhost:3001 or ngrok tunnel)

Example:
- Mobile request: POST http://localhost:3001/auth/login
- Backend endpoint: POST /auth/login
```

### Local Network Access

**For mobile testing on same network:**

```bash
# 1. Get your computer's IP address
ipconfig getifaddr en0  # macOS
hostname -I            # Linux
ipconfig                # Windows (look for IPv4 Address)

# 2. Update mobile .env.local
REACT_NATIVE_API_URL=http://YOUR_IP:3001

# 3. Mobile app now connects to your local backend
```

**For remote access (ngrok tunnel):**

```bash
# Install ngrok
npm install -g ngrok

# Create tunnel to backend
ngrok http 3001

# Update mobile .env.local
REACT_NATIVE_API_URL=https://your-ngrok-url.ngrok.io
```

---

## 🚀 Deployment

### Web Frontend Deployment

**Automated via GitHub Actions** (`web-deploy.yml`)

```bash
# Push to main branch
git push origin main

# Workflow:
# 1. Build Next.js application
# 2. Upload static files to S3
# 3. Invalidate CloudFront cache
# 4. Deploy to AWS Amplify or Vercel (optional)

# Manual deployment:
cd web
npm run build
# Upload dist/ or .next/ to S3
```

### Mobile Deployment

**Using EAS Build & Submit** (`mobile-deploy.yml`)

```bash
# Setup EAS project
cd mobile
eas build:configure

# Build and submit to stores
eas build --platform ios
eas submit --platform ios

eas build --platform android
eas submit --platform android

# Or with GitHub Actions (automatic on main push)
```

### Backend Deployment

**Docker to AWS ECS** (`deploy-backend.yml`)

```bash
# Push to main branch triggers:
# 1. Build Docker image
# 2. Push to AWS ECR
# 3. Update ECS task definition
# 4. Restart ECS service

# Manual deployment:
cd backend
docker build -t club-backend:latest .
docker tag club-backend:latest YOUR_ECR_URL/club-backend:latest
docker push YOUR_ECR_URL/club-backend:latest
```

### Infrastructure Deployment

**Terraform** (`terraform.yml`)

```bash
# Changes to infra/terraform/ trigger:
# 1. terraform plan
# 2. terraform apply (on main branch only)

# Manual:
cd infra/terraform
terraform plan
terraform apply
```

---

## 📜 Scripts & Commands

### Root Level Scripts (npm)

```bash
npm install        # Install all dependencies
npm run dev        # Start all services (if configured)
npm run build      # Build all apps
npm run test       # Run tests for all apps
```

### Backend Scripts

```bash
cd backend

npm run dev                    # Start development server
npm run build                 # Build for production
npm run start                 # Start production build
npm run test                  # Run unit tests
npm run test:e2e              # Run E2E tests
npm run lint                  # Lint code
npm run format                # Format code
npm run prisma:generate       # Generate Prisma client
npm run prisma:migrate:dev    # Create/run migrations
npm run prisma:seed           # Seed database
npm run docker:build          # Build Docker image
npm run docker:dev            # Run Docker container
```

### Web Scripts

```bash
cd web

npm run dev                    # Start Next.js dev server
npm run build                 # Build for production
npm run start                 # Start production server
npm run lint                  # Lint code
npm run type-check            # TypeScript type checking
npm run format                # Format code
npm run test                  # Run tests
```

### Mobile Scripts

```bash
cd mobile

npm start                      # Start Expo dev server
npm run dev                    # Start with dev client
npm run android               # Open Android emulator
npm run ios                   # Open iOS simulator
npm run web                   # Start web version
npm run test                  # Run tests
npm run type-check            # TypeScript type checking
npm run lint                  # Lint code
npm run build:android         # Build APK/AAB
npm run build:ios             # Build IPA
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows

All workflows trigger on push/PR to `main`:

| Workflow | Trigger | Action |
|----------|---------|--------|
| `web-deploy.yml` | Changes in `web/**` | Build & deploy Next.js to S3/CloudFront |
| `mobile-deploy.yml` | Changes in `mobile/**` | Build & deploy to TestFlight/Google Play |
| `deploy-backend.yml` | Changes in `backend/**` | Build Docker image, push to ECR, update ECS |
| `terraform.yml` | Changes in `infra/terraform/**` | Plan & apply Terraform |

### GitHub Secrets Required

```
# AWS
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_ECR_REGISTRY
AWS_ECR_REPOSITORY

# Mobile (iOS)
APPLE_ID
APPLE_PASSWORD
APPLE_TEAM_ID

# Mobile (Android)
ANDROID_KEYSTORE_BASE64
ANDROID_KEYSTORE_PASSWORD
ANDROID_KEY_ALIAS
ANDROID_KEY_PASSWORD

# Expo
EXPO_TOKEN

# Notifications
SLACK_WEBHOOK_URL
```

---

## 🔍 Monitoring & Logs

### Local Development

```bash
# Backend logs
cd backend && npm run dev   # Logs in terminal

# Web logs
cd web && npm run dev       # Logs in terminal

# Mobile logs
cd mobile && npm start      # Logs via Expo CLI
```

### Production

```bash
# AWS CloudWatch
aws logs tail /ecs/club-backend --follow

# Application Insights
# Visit: AWS Console → CloudWatch → Logs

# Error Tracking
# Sentry dashboard: https://sentry.io/...

# Performance Monitoring
# AWS X-Ray or AppDynamics
```

---

## 🐛 Troubleshooting

### Backend Won't Start

```bash
# Check if port 3001 is in use
lsof -i :3001          # macOS/Linux
netstat -ano | grep 3001  # Windows

# Kill the process
kill -9 <PID>          # macOS/Linux
taskkill /PID <PID> /F # Windows

# Restart
npm run dev
```

### Web Frontend Issues

```bash
# Clear Next.js cache
rm -rf .next

# Restart dev server
npm run dev

# Check if port 3000 is in use
lsof -i :3000
```

### Mobile Connection Issues

```bash
# Clear Expo cache
npx expo start --clear

# Reset Metro bundler
watchman watch-del-all

# Check if backend is reachable
curl http://localhost:3001/health

# Use ngrok for remote testing
ngrok http 3001
```

### Database Issues

```bash
# Reset local database
docker-compose down
docker-compose up -d

# Or run migrations
npm run prisma:migrate:reset
```

### Environment Variable Issues

```bash
# Verify .env.local exists
ls -la .env.local       # Each directory

# Check values are set
cat .env.local

# For Next.js, must have NEXT_PUBLIC_ prefix for client-side
# For Expo, must have EXPO_PUBLIC_ prefix for client-side
```

---

## 📚 Additional Resources

- [Backend README](./backend/README.md)
- [Web README](./web/README.md)
- [Mobile README](./mobile/README.md)
- [Infrastructure README](./infra/README.md)
- [CI/CD Documentation](./CI_CD_PIPELINES.md)
- [API Documentation](./backend/README.md#api-documentation)
- [Architecture Guide](./COMPREHENSIVE_ARCHITECTURE_GUIDE.md)

---

## 💡 Best Practices

### Branching Strategy
```
main              # Production ready
├── develop       # Staging/pre-release
├── feature/*     # Feature branches
├── bugfix/*      # Bug fix branches
└── hotfix/*      # Production hotfixes
```

### Commit Convention
```
feat: Add login page
fix: Resolve API timeout issue
docs: Update monorepo setup
style: Format code
test: Add unit tests
chore: Update dependencies
```

### Pull Request Process
1. Create feature branch from `develop`
2. Make changes and commit
3. Push to GitHub
4. Create Pull Request with description
5. Wait for CI/CD to pass
6. Request code review
7. Merge after approval

---

## 📞 Support

For issues or questions:
- Check existing GitHub Issues
- Review documentation in each module
- Contact team leads
- Create new GitHub Issue with details

---

**Last Updated**: October 2025
**Maintained By**: Club App Team
