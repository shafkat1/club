# DOCUMENTATION INDEX - CLUB APP COMPREHENSIVE GUIDES

**Created:** October 30, 2025  
**Purpose:** Single source of truth for all Club App architecture, infrastructure, and setup documentation

---

## 📚 DOCUMENTATION FILES CREATED

### 1. **COMPREHENSIVE_ARCHITECTURE_GUIDE.md** (Main Reference)
**Size:** ~2,900 lines  
**Purpose:** Complete end-to-end documentation of the entire Club App project

**Includes:**
- ✅ Project overview and features
- ✅ High-level system architecture with diagrams
- ✅ Complete technology stack for all 4 platforms (backend, web, mobile, infra)
- ✅ Detailed repository structure
- ✅ AWS infrastructure setup (VPC, RDS, ElastiCache, S3, ECS, ALB, Route53, CloudFront)
- ✅ NestJS backend architecture with module organization
- ✅ Frontend & mobile architecture
- ✅ Database schema with Prisma models
- ✅ Secret keys & credentials management (with location info)
- ✅ Deployment pipeline and CI/CD workflows
- ✅ GitHub Actions setup with OIDC
- ✅ Complete security architecture (authentication, authorization, encryption)
- ✅ Monitoring & logging configuration
- ✅ Development guidelines & best practices
- ✅ Comprehensive troubleshooting guide

**Sections:** 15 major sections with subsections

---

### 2. **AWS_INFRASTRUCTURE_DEEP_DIVE.md** (Infrastructure Reference)
**Size:** ~1,800 lines  
**Purpose:** Detailed AWS-specific configuration and setup guide

**Includes:**
- ✅ Quick reference with AWS account details (Account ID: 425687053209)
- ✅ Current resource status checklist
- ✅ AWS account setup checklist
- ✅ Detailed VPC architecture (CIDR blocks, subnets, route tables)
- ✅ RDS PostgreSQL configuration (db.t4g.medium, 16.4, Multi-AZ)
- ✅ ElastiCache Redis configuration (7.1, Multi-AZ)
- ✅ S3 bucket configuration for all 4 buckets
- ✅ ECS Fargate configuration (task definition, roles, service)
- ✅ Application Load Balancer setup
- ✅ Container Registry (ECR) configuration
- ✅ AWS service interconnections & data flow
- ✅ Cost optimization strategies (~$190-260/month estimate)
- ✅ Disaster recovery & backup strategy
- ✅ Security audit checklist
- ✅ Monitoring & alerting setup
- ✅ AWS CLI commands reference
- ✅ Emergency procedures

**Sections:** 12 major sections with detailed subsections

---

## 📋 QUICK ACCESS GUIDE

### For New Developers
👉 Start with: **COMPREHENSIVE_ARCHITECTURE_GUIDE.md**
- Read sections 1-3 (Overview, Architecture, Tech Stack)
- Then read Development Guidelines (section 14)
- Reference as needed when implementing features

### For DevOps/Infrastructure
👉 Start with: **AWS_INFRASTRUCTURE_DEEP_DIVE.md**
- Read Quick Reference & Setup Checklist
- Use as deployment manual for infrastructure setup
- Reference cost optimization for budget planning

### For Troubleshooting Issues
👉 Use: **COMPREHENSIVE_ARCHITECTURE_GUIDE.md** - Section 15
- ECS Deployment Issues
- Database Connection Issues
- Redis Connection Issues
- S3 Upload Failures
- WebSocket Issues
- JWT Token Issues
- Performance Issues

### For API Development
👉 Use: **COMPREHENSIVE_ARCHITECTURE_GUIDE.md** - Section 6
- Backend Architecture
- Module Organization
- API Endpoints
- Key Services (Prisma, Redis, S3)

---

## 🔐 SECRET KEYS & CREDENTIALS REFERENCE

**All documented in:** COMPREHENSIVE_ARCHITECTURE_GUIDE.md - Section 9

### Secret Locations:

```
AWS Secrets Manager:
├── clubapp/dev/rds                    → Database credentials (auto-rotated 30 days)
├── clubapp/dev/jwt-secret             → JWT signing key
├── clubapp/dev/stripe-api-key         → Stripe payment processing
├── clubapp/dev/sendgrid-api-key       → Email service
├── clubapp/dev/twilio-credentials     → SMS service
└── [other service credentials]

Environment Variables (.env for development):
├── DATABASE_URL                       → PostgreSQL connection string
├── REDIS_URL                          → ElastiCache Redis connection
├── NODE_ENV                           → Development/Production
├── JWT_SECRET                         → JWT signing (dev only)
└── [other config variables]

Local Development:
└── ~/.aws/credentials                 → AWS CLI credentials for local testing
```

---

## 🏗️ INFRASTRUCTURE ARCHITECTURE SUMMARY

### AWS Account
- **Account ID:** 425687053209
- **Region:** us-east-1 (N. Virginia)
- **Multi-AZ:** Yes (us-east-1a, us-east-1b)

### VPC Network
- **CIDR:** 10.0.0.0/16
- **Public Subnets:** 10.0.1.0/24 (AZ-a), 10.0.2.0/24 (AZ-b)
- **Private Subnets:** 10.0.10.0/24 (AZ-a), 10.0.11.0/24 (AZ-b)
- **NAT Gateways:** 2 (one per AZ)

### Core Services

| Service | Type | Configuration | Cost/mo |
|---------|------|---------------|---------|
| **PostgreSQL RDS** | Database | db.t4g.medium, Multi-AZ, 100GB | $80-100 |
| **ElastiCache Redis** | Cache | cache.t4g.micro, Multi-AZ, 2 nodes | $30-40 |
| **ECS Fargate** | Compute | 1 vCPU, 2GB RAM, min=1, max=4 | $20-30 |
| **ALB** | Load Balancer | Application LB, HTTPS | $15-20 |
| **S3** | Storage | 4 buckets, < 100GB | $6-12 |
| **CloudFront** | CDN | assets.desh.co distribution | $1-5 |
| **NAT Gateways** | Networking | 2 gateways (1 per AZ) | $30-40 |
| **Route 53** | DNS | desh.co hosted zone | $0.50 |
| **Secrets Manager** | Security | DB credential rotation | $0.40 |
| **CloudWatch** | Monitoring | Logs, Metrics, Alarms | $5-10 |
| | | **TOTAL ESTIMATED** | **~$190-260** |

---

## 🚀 DEPLOYMENT PIPELINE

### Automated Deployment Flow
```
Developer Push to main
    ↓
GitHub Actions Triggered
    ├─ Lint & Test
    ├─ Build Docker Image
    ├─ Push to ECR
    ├─ Update ECS Task Definition
    ├─ Update ECS Service (rolling update)
    ├─ Health Check (5 min wait)
    └─ Slack Notification
    
Result: Zero-downtime blue-green deployment
```

### Infrastructure as Code (Terraform)
```
Terraform files in: infra/terraform/
├─ 20+ .tf files
├─ State stored in S3 (clubapp-dev-tfstate)
├─ State locking via DynamoDB
└─ Deployed via GitHub Actions OIDC
```

---

## 📊 DATABASE SCHEMA

**Prisma Models (in backend/prisma/schema.prisma):**

```
Users
├─ Authentication (phone, email, OAuth IDs)
├─ Profile (displayName, bio, profileImage)
└─ Relationships (groups, orders, devices)

Orders
├─ Buyer & Recipient (user relationships)
├─ Venue (location reference)
├─ Status (PENDING, PAID, ACCEPTED, REJECTED, REDEEMED, EXPIRED, CANCELLED)
└─ Payment (Stripe integration)

Presence (Real-time venue tracking)
├─ User at Venue (1:1 per venue)
├─ Flags (wantsToBuy, wantsToReceive)
└─ Location (optional latitude/longitude)

Groups & GroupMembers
├─ Group organization
└─ Member management

Venues
├─ Location (lat/long)
├─ Name & Description
└─ Cover Image

Redemptions
├─ QR Code verification
├─ Bartender authorization
└─ Order fulfillment tracking

AuditLog
├─ User actions
├─ Resource changes
└─ IP & User Agent
```

---

## 🔒 SECURITY ARCHITECTURE

### Authentication
- ✅ JWT tokens (24-hour expiration)
- ✅ Refresh tokens (7-day expiration)
- ✅ OAuth providers (Google, Facebook, Apple, etc.)
- ✅ Password hashing (bcrypt, 10 rounds)
- ✅ Token blacklisting (Redis)

### Authorization
- ✅ Role-Based Access Control (RBAC)
- ✅ Roles: USER, BARTENDER, ADMIN
- ✅ Hierarchical permissions

### Encryption
- ✅ RDS: AES-256 (at-rest)
- ✅ HTTPS/TLS 1.2+ (in-transit)
- ✅ ElastiCache: TLS (in-transit)
- ✅ S3: AES-256 (at-rest)
- ✅ Secrets Manager: KMS encrypted

### Network Security
- ✅ Security Groups (principle of least privilege)
- ✅ ALB only allows 80, 443
- ✅ ECS only accessible from ALB
- ✅ RDS/Redis only accessible from ECS
- ✅ No direct internet access to private resources

---

## 📈 MONITORING & ALERTING

### CloudWatch Dashboards
- ✅ clubapp-dev-overview (main dashboard)
- ✅ ECS metrics (CPU, Memory, Deployments)
- ✅ RDS metrics (Connections, Storage, Latency)
- ✅ ALB metrics (Request count, Status codes)
- ✅ ElastiCache metrics (Hit rate, Evictions)

### CloudWatch Alarms
- ✅ ECS CPU > 80% → Auto-scale + SNS
- ✅ ALB Unhealthy Targets > 0 → SNS + PagerDuty
- ✅ RDS Storage < 10% → SNS
- ✅ Redis Eviction Rate > 0 → SNS
- ✅ ALB 5XX Errors > 10 → SNS + PagerDuty

### Error Tracking
- ✅ Sentry integration
- ✅ Real-time error alerts
- ✅ Stack trace capture
- ✅ Release tracking

### Logging
- ✅ CloudWatch Logs (/ecs/clubapp-backend)
- ✅ 30-day retention
- ✅ JSON structured logging
- ✅ Multiple log levels (DEBUG, INFO, WARN, ERROR, FATAL)

---

## 🛠️ DEVELOPMENT WORKFLOW

### Local Setup
```bash
# Backend
cd backend
npm ci
npm run start:dev          # http://localhost:3000

# Web
cd web
npm ci
npm run dev               # http://localhost:3000

# Mobile
cd mobile
npm ci
npm run start            # Expo Go app
```

### Git Workflow
```
Feature Branch: feature/feature-name
├─ Create branch from main
├─ Make atomic commits
├─ Push and create PR
├─ Code review & approval
└─ Merge to main (auto-deploys)
```

### Testing
```bash
# Backend
npm run test              # Jest tests
npm run test:cov          # Coverage report
npm run lint              # ESLint
npm run type-check        # TypeScript
```

---

## 📞 SUPPORT & RESOURCES

### Key URLs
- **GitHub Repo:** https://github.com/shafkat1/club
- **AWS Console:** https://console.aws.amazon.com/
- **API Docs:** https://api.desh.co/api/docs (after deployment)
- **Health Check:** https://api.desh.co/health

### Documentation Files in Repository
```
Root Level:
├── README.md                          (Project overview)
├── DEPLOYMENT.md                      (Step-by-step deployment)
├── AWS_SETUP_SUMMARY.md               (AWS setup details)
├── GITHUB_OIDC_SETUP.md               (OIDC authentication)
├── BACKEND_SETUP.md                   (Backend dev guide)
├── WEB_SETUP.md                       (Web frontend guide)
├── MOBILE_SETUP.md                    (Mobile app guide)
├── TESTING_GUIDE.md                   (Testing procedures)
├── COMPREHENSIVE_ARCHITECTURE_GUIDE.md ⭐ (THIS GUIDE - Main Reference)
└── AWS_INFRASTRUCTURE_DEEP_DIVE.md    ⭐ (AWS-specific guide)

Infrastructure:
└── infra/terraform/README.md          (Terraform documentation)
```

### Troubleshooting
1. Check CloudWatch Logs: `/ecs/clubapp-backend`
2. Check Sentry for errors: [sentry.io dashboard]
3. Check AWS Health Dashboard
4. Refer to Troubleshooting section in COMPREHENSIVE_ARCHITECTURE_GUIDE.md

---

## 🎯 NEXT STEPS FOR NEW TEAM MEMBERS

### Day 1: Onboarding
- [ ] Read COMPREHENSIVE_ARCHITECTURE_GUIDE.md (sections 1-3)
- [ ] Set up local development environment
- [ ] Clone repository and get first build running
- [ ] Review project structure

### Day 2: Development Setup
- [ ] Read Development Guidelines (section 14)
- [ ] Set up IDE and linters
- [ ] Create first feature branch
- [ ] Run tests and ensure they pass

### Day 3: Infrastructure Understanding
- [ ] Read AWS_INFRASTRUCTURE_DEEP_DIVE.md (quick reference + 1 section)
- [ ] Review Architecture Diagram
- [ ] Understand data flow
- [ ] Review security practices

### Week 1: Deep Dive
- [ ] Complete entire COMPREHENSIVE_ARCHITECTURE_GUIDE.md
- [ ] Deploy to dev environment (with help)
- [ ] Review and understand CI/CD pipeline
- [ ] Understand database schema

### Week 2+: Contributing
- [ ] Work on first feature
- [ ] Understand deployment process
- [ ] Review troubleshooting procedures
- [ ] Contribute to codebase

---

## 🔄 MAINTENANCE & UPDATES

**Last Updated:** October 30, 2025

### Review Schedule
- **Quarterly:** Full review and updates
- **On Major Changes:** Immediate documentation update
- **Dependencies:** Update when versions change
- **New Features:** Document immediately after implementation

### Version History
- **v1.0** (Oct 30, 2025): Initial comprehensive documentation
  - Complete architecture guide
  - AWS infrastructure deep dive
  - All 15+ sections with detailed subsections

---

## 📝 HOW TO USE THIS DOCUMENTATION

### For Quick Reference
👉 Use `Ctrl+F` to search for specific topics in the comprehensive guide

### For Learning
👉 Read sequentially through sections based on your role:
- **Backend Dev:** Sections 1-2, 6, 8-9, 14-15
- **Frontend Dev:** Sections 1-2, 7, 12, 14
- **DevOps:** Sections 2-5, 10-13
- **Full Stack:** Read all sections in order

### For Troubleshooting
👉 Jump directly to section 15 (Troubleshooting) for common issues

### For Specific Topics
👉 Use the table of contents at the top of each document

---

## ✅ CHECKLIST FOR FUTURE LLM TASKS

When asking an LLM to work on this project:

- [ ] Provide link to this documentation index
- [ ] Reference specific sections when discussing features
- [ ] Update relevant sections after completing work
- [ ] Follow the architecture and patterns documented
- [ ] Use the technology stack specified
- [ ] Follow security practices outlined
- [ ] Document new features/changes
- [ ] Reference troubleshooting guide for common issues

---

**Maintained By:** Development Team  
**Last Review:** October 30, 2025  
**Next Review:** Quarterly or after major changes

---

## 📞 QUESTIONS?

Refer to the comprehensive guides above, or contact the development team for clarification on any aspect of the architecture or infrastructure.

**Remember:** These documents are the single source of truth for Club App. Keep them updated and reference them frequently!
