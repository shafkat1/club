# Club App Development Progress

## Overview
This document tracks the development progress of the Club App - a map-first drink purchasing platform connecting people at venues.

## Completed ✅

### Infrastructure & DevOps
- [x] AWS Terraform infrastructure (VPC, RDS, Redis, DynamoDB, S3, ECS, ALB)
- [x] Secrets Manager with auto-rotation
- [x] GitHub Actions CI/CD pipeline with OIDC
- [x] S3 backend and DynamoDB state locking
- [x] Terraform unlock workflow for stuck locks

### Backend (NestJS)
- [x] Prisma schema with complete data models:
  - Users (phone, email, OAuth)
  - Groups & GroupMembers (friend management)
  - Venues (bars, clubs, pubs)
  - Orders (drink purchases)
  - Redemptions (bartender verification)
  - Presence (real-time tracking)
  - Devices (push notifications)
  - AuditLog (activity tracking)
  
- [x] Core DTOs:
  - Auth DTOs (OTP, social login, tokens)
  - Order DTOs (CRUD operations)
  - Venue DTOs (search, presence)
  
- [x] Authentication Module:
  - Phone OTP via Twilio
  - Social login (Google, Facebook, Instagram, Apple, TikTok, Snapchat, Twitter)
  - JWT token generation & refresh
  - Redis-backed session storage
  - Current user profile endpoint

## In Progress 🚀

### Infrastructure
- Terraform deployment (currently applying with `enable_domain=false`)
- Will enable domain/DNS after infrastructure is stable

### Backend (Next Tasks)
- [ ] Venues Module (search by location, proximity)
- [ ] Orders Module (create, list, update, payment integration with Stripe)
- [ ] Redemptions Module (QR code generation, bartender scanning)
- [ ] Presence Module (real-time user tracking, drink interests)
- [ ] Groups Module (friend management, shared venue presence)
- [ ] Payments Module (Stripe integration, Apple Pay, Google Pay)
- [ ] WebSocket/Realtime Module (Ably or Socket.IO for live updates)
- [ ] Push Notifications (Firebase Cloud Messaging)
- [ ] API Documentation (Swagger/OpenAPI)
- [ ] E2E Tests

### Mobile (React Native + Expo)
- [ ] Project initialization
- [ ] Authentication screens (phone OTP, social login)
- [ ] Map screen with nearby venues
- [ ] Venue details & presence list
- [ ] Drink buyer flow (select recipient, send drink)
- [ ] Drink receiver flow (accept/reject drinks)
- [ ] Groups & friends management
- [ ] Profile & settings
- [ ] Push notifications integration

### Web Portal (Next.js) - Bartender/Admin
- [ ] Project initialization
- [ ] Bartender authentication
- [ ] QR code scanner
- [ ] Redemption workflow
- [ ] Admin dashboard

## Technology Stack

| Component | Technology |
|-----------|-----------|
| **Backend** | NestJS + TypeScript |
| **Database** | PostgreSQL (RDS) + Prisma ORM |
| **Cache/Realtime** | Redis (ElastiCache) |
| **Mobile** | React Native + Expo + TypeScript |
| **Web** | Next.js + React + TypeScript |
| **State Management** | Zustand (mobile & web) |
| **API Client** | Axios |
| **Authentication** | JWT + Phone OTP + OAuth |
| **Payments** | Stripe |
| **SMS** | Twilio |
| **Email** | SendGrid |
| **QR Code Scanning** | @zxing/browser (web), react-native-camera (mobile) |
| **Maps** | Mapbox SDK or Google Maps |
| **Monitoring** | Sentry |
| **Infrastructure** | AWS (Terraform) |
| **CI/CD** | GitHub Actions |

## Key Features Status

### Core Features
| Feature | Status | Notes |
|---------|--------|-------|
| Phone registration | ✅ Complete | Twilio OTP verified |
| Social login | ✅ Complete | 7 providers supported |
| Map view | 🟡 Pending | Mobile/Web |
| Find nearby people | 🟡 Pending | Proximity search with Redis |
| Buy drink for someone | 🟡 Pending | Stripe payment flow |
| Receive drink offer | 🟡 Pending | Accept/reject logic |
| Groups/Friends | 🟡 Pending | Group management module |
| Bartender QR verify | 🟡 Pending | QR code scanning & redemption |

### Security Features
| Feature | Status | Notes |
|---------|--------|-------|
| JWT Authentication | ✅ Complete | 24h access + 7d refresh |
| CORS | ✅ Complete | Global middleware |
| Rate limiting | ✅ Complete | ThrottlerGuard |
| Input validation | ✅ Complete | class-validator + pipes |
| Encryption at rest | ✅ Complete | KMS + RDS encryption |
| Encryption in transit | 🟡 In Progress | TLS/HTTPS (domain pending) |
| Secrets rotation | ✅ Complete | AWS Secrets Manager + SAR |

## Next Immediate Steps

1. **Monitor Terraform Apply** - Check AWS console for resource creation
2. **Create Venues Module** - Implement location-based search with PostGIS
3. **Create Orders Module** - Core drink purchase flow with Stripe
4. **Initialize Mobile App** - Expo project with auth screens
5. **Initialize Web Portal** - Next.js bartender dashboard
6. **Enable Domain** - Switch `enable_domain=true` after DNS validation

## Environment Setup

All env files and setup instructions are documented in:
- `ENV_SETUP.md` - Comprehensive environment variable guide
- `BACKEND_SETUP.md` - Backend development guide
- `MOBILE_SETUP.md` - Mobile app guide  
- `WEB_SETUP.md` - Web portal guide
- `GITHUB_OIDC_SETUP.md` - CI/CD setup guide

## Deployment Plan

### Phase 1: Infrastructure (In Progress)
- ✅ S3 backend + DynamoDB state locking
- ✅ Terraform code with all AWS resources
- 🟡 Apply to AWS (currently deploying with `enable_domain=false`)
- [ ] Verify all resources created
- [ ] Get RDS endpoint, Redis URL, etc.

### Phase 2: Backend Deployment
- [ ] Create Prisma migrations
- [ ] Deploy to ECS Fargate
- [ ] Verify health checks
- [ ] Setup logging & monitoring

### Phase 3: Mobile & Web
- [ ] Build mobile app (iOS/Android)
- [ ] Deploy web portal
- [ ] Setup CDN for assets

### Phase 4: DNS & Security
- [ ] Enable Route 53 DNS
- [ ] Validate ACM certificates
- [ ] Enable HTTPS on ALB & CloudFront
- [ ] Setup WAF (optional)

---

**Last Updated**: October 26, 2025
**Deployed By**: Terraform + GitHub Actions OIDC
