# COMPREHENSIVE ARCHITECTURE & INFRASTRUCTURE GUIDE - CLUB APP

**Last Updated:** October 30, 2025
**Project:** Club App - Map-First Drink Purchasing Platform
**Repository:** https://github.com/shafkat1/club
**Domain:** desh.co

---

## TABLE OF CONTENTS

1. [Project Overview](#project-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Technology Stack](#technology-stack)
4. [Repository Structure](#repository-structure)
5. [Infrastructure & AWS Setup](#infrastructure--aws-setup)
6. [Backend Architecture](#backend-architecture)
7. [Frontend & Mobile Architecture](#frontend--mobile-architecture)
8. [Database Schema & Data Flow](#database-schema--data-flow)
9. [Secret Keys & Credentials Management](#secret-keys--credentials-management)
10. [Deployment Pipeline](#deployment-pipeline)
11. [GitHub Actions & CI/CD](#github-actions--cicd)
12. [Security Architecture](#security-architecture)
13. [Monitoring & Logging](#monitoring--logging)
14. [Development Guidelines](#development-guidelines)
15. [Troubleshooting & Common Issues](#troubleshooting--common-issues)

---

## PROJECT OVERVIEW

### What is Club App?

Club App is a **map-first mobile and web application** for purchasing drinks between people at bars, clubs, and pubs.

**Core Value Proposition:**
- Users discover nearby venues on an interactive map
- Users can send drink orders to others at the same venue
- Bartenders can verify and redeem orders via QR codes
- Groups can coordinate and discover each other in real-time
- Privacy-respecting presence tracking (scoped to venues only, no GPS sharing)

### Key Features

1. **Map-First Discovery**
   - Real-time venue locations with live drink seeker/buyer counts
   - Privacy-focused location tracking (venue-level only)

2. **Social Drink Ordering**
   - Send/receive drink orders from friends or strangers
   - Message with orders
   - 24-hour expiration on pending orders

3. **Bartender Portal**
   - QR code scanning for order redemption
   - Phone number lookup verification
   - Order status management

4. **Real-Time Updates**
   - WebSocket-based presence updates
   - Live drink counts per venue
   - Group coordination

5. **Payment Integration**
   - Stripe payment processing
   - Apple Pay / Google Pay support
   - Order history and receipts

6. **Accessibility & Compliance**
   - WCAG 2.2 AA compliance
   - Large touch targets for mobile
   - Screen reader support

---

## HIGH-LEVEL ARCHITECTURE

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                           USERS                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Mobile     │  │   Web Portal │  │  Bartenders  │          │
│  │  (React      │  │  (Next.js)   │  │  (Next.js)   │          │
│  │  Native +    │  │  Admin       │  │  QR Scanner  │          │
│  │  Expo)       │  │              │  │              │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼──────────────────┼──────────────────┼──────────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                    ┌────────▼────────┐
                    │   AWS Route 53  │
                    │   (DNS)         │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
     ┌────▼─────┐   ┌───────▼────────┐  ┌──────▼──────┐
     │ api.desh  │   │ assets.desh.co │  │ admin.desh  │
     │   .co     │   │ (CloudFront)   │  │  .co        │
     │  (ALB)    │   │                │  │  (ALB)      │
     └────┬─────┘   └────────────────┘  └─────────────┘
          │
     ┌────▼──────────────────────────────────────┐
     │      AWS ECS Fargate Cluster              │
     │  ┌──────────────────────────────────────┐ │
     │  │  NestJS Backend (1+ Tasks)           │ │
     │  │  - API Routes                        │ │
     │  │  - WebSocket Server (Socket.io)      │ │
     │  │  - Authentication & JWT              │ │
     │  │  - Business Logic                    │ │
     │  └──────────────────────────────────────┘ │
     └────┬──────────────────────────────────────┘
          │
    ┌─────┴─────────────┬──────────────┬─────────────┐
    │                   │              │             │
┌───▼────┐      ┌──────▼────┐  ┌─────▼──┐  ┌──────▼──┐
│   RDS  │      │ ElastiCache│  │   S3   │  │DynamoDB │
│Postgres│      │   Redis    │  │Buckets │  │ Tables  │
│Multi-AZ│      │ Multi-AZ   │  │(Assets)│  │(Presence)
└────────┘      └────────────┘  └────────┘  └─────────┘
    │
    │
┌───▼──────────────────────────────────────────┐
│  AWS Secrets Manager                         │
│  - DB credentials (auto-rotating)            │
│  - JWT secrets                               │
│  - API keys (Stripe, SendGrid, Twilio)       │
└──────────────────────────────────────────────┘
```

### Data Flow Layers

```
PRESENTATION LAYER
├── Mobile App (React Native/Expo) → Venues, Orders, Groups, Presence
├── Web Admin (Next.js) → Dashboard, Analytics
└── Bartender Web (Next.js) → QR Scanner, Order Redemption

API LAYER (NestJS)
├── REST Endpoints (with Swagger docs)
├── WebSocket Gateway (Socket.io)
├── Authentication (JWT + OAuth)
├── Rate Limiting & Throttling
└── Validation & Error Handling

BUSINESS LOGIC LAYER
├── Venues Service (discovery, counts)
├── Orders Service (create, update, redeem)
├── Presence Service (real-time tracking)
├── Users Service (profiles, groups)
├── Auth Service (JWT, OAuth providers)
├── Redemptions Service (QR verification)
└── Payments Service (Stripe integration)

DATA ACCESS LAYER
├── Prisma ORM (PostgreSQL)
├── Redis (caching, real-time data)
├── DynamoDB (presence, counts)
└── S3 (file storage)

DATA PERSISTENCE LAYER
├── PostgreSQL RDS (relational data)
├── ElastiCache Redis (sessions, caching, streams)
├── DynamoDB (NoSQL for presence)
└── S3 (file objects, receipts, logs)
```

---

## TECHNOLOGY STACK

### Backend
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | NestJS | ^10.3.0 | Modular Node.js framework |
| Runtime | Node.js | 18-alpine | JavaScript runtime |
| Language | TypeScript | ^5.3.3 | Type-safe language |
| ORM | Prisma | ^5.8.0 | Database abstraction |
| Real-time | Socket.io | ^4.8.1 | WebSocket communication |
| Auth | JWT + Passport | - | Authentication |
| APIs | Stripe, SendGrid, Twilio | - | Payment, Email, SMS |
| Logging | Sentry | ^7.99.0 | Error tracking |
| Validation | class-validator | ^0.14.0 | DTO validation |
| Database Driver | PostgreSQL | 16.4 | Primary database |
| Cache | ioredis | ^5.3.2 | Redis client |
| AWS SDK | aws-sdk | ^2.1577.0 | AWS integration |

### Frontend (Web)
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | Next.js | ^14.0.0 | React meta-framework |
| UI | React | ^18.2.0 | UI library |
| Language | TypeScript | ^5.3.0 | Type safety |
| Styling | Tailwind CSS | ^3.4.0 | Utility CSS |
| Forms | React Hook Form | ^7.50.0 | Form state management |
| Validation | Zod | ^3.22.0 | Schema validation |
| State | Zustand | ^4.4.0 | Lightweight state mgmt |
| QR Scanner | ZXing | ^0.20.0 | QR code scanning |
| HTTP | Axios | ^1.6.0 | HTTP client |
| Real-time | Socket.io-client | ^4.7.0 | WebSocket client |

### Mobile (React Native)
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | Expo | ^50.0.0 | React Native tooling |
| Router | Expo Router | ~3.4.10 | Navigation |
| Runtime | React Native | 0.73.6 | Mobile framework |
| Language | TypeScript | ^5.3.0 | Type safety |
| Styling | NativeWind | ^2.0.0 | Tailwind for React Native |
| Forms | React Hook Form | ^7.50.0 | Form handling |
| State | Zustand | ^4.4.0 | State management |
| Storage | AsyncStorage | 1.21.0 | Local storage |
| Location | Expo Location | ^16.5.5 | GPS/location APIs |
| Camera | Expo Camera | ~14.1.3 | Camera access |
| Notifications | Expo Notifications | ~0.27.8 | Push notifications |
| HTTP | Axios | ^1.12.2 | HTTP client |

### Infrastructure (AWS & IaC)
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| IaC Tool | Terraform | >= 1.6 | Infrastructure as Code |
| Cloud Provider | AWS | - | Cloud infrastructure |
| Container Orchestration | ECS Fargate | - | Serverless container service |
| Load Balancing | Application Load Balancer | - | Traffic distribution |
| Database | RDS PostgreSQL | 16.4 | Multi-AZ relational DB |
| Cache | ElastiCache Redis | 7.1 | In-memory data store |
| NoSQL | DynamoDB | - | Serverless NoSQL |
| CDN | CloudFront | - | Content delivery |
| Object Storage | S3 | - | File storage |
| DNS | Route 53 | - | Domain management |
| SSL/TLS | ACM | - | Certificates |
| Secret Management | Secrets Manager | - | Credential rotation |
| Logging | CloudWatch | - | Logs and monitoring |
| IAM | AWS IAM | - | Identity and access |

### CI/CD & DevOps
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Source Control | GitHub | Repository hosting |
| CI/CD | GitHub Actions | Automated workflows |
| Authentication | OIDC | Secure AWS access from GitHub |
| Code Quality | ESLint | Code linting |
| Testing | Jest | Unit testing |
| Build | Docker | Container images |
| Registry | ECR | Container image storage |

---

## REPOSITORY STRUCTURE

```
club/
├── infra/                              # Infrastructure as Code (Terraform)
│   ├── terraform/                      # Terraform configurations
│   │   ├── backend-bootstrap.tf        # S3 & DynamoDB for state
│   │   ├── backend.tf                  # Terraform state backend config
│   │   ├── providers.tf                # AWS provider configuration
│   │   ├── versions.tf                 # Provider versions
│   │   ├── variables.tf                # Input variables
│   │   ├── locals.tf                   # Local variables & naming
│   │   ├── networking.tf               # VPC, subnets, IGW, NAT
│   │   ├── security.tf                 # Security groups (if exists)
│   │   ├── iam.tf                      # IAM roles and policies
│   │   ├── rds.tf                      # PostgreSQL RDS instance
│   │   ├── redis.tf                    # ElastiCache Redis cluster
│   │   ├── dynamodb.tf                 # DynamoDB tables
│   │   ├── s3.tf                       # S3 buckets
│   │   ├── ecs.tf                      # ECS cluster & Fargate tasks
│   │   ├── alb.tf                      # Application Load Balancer
│   │   ├── route53.tf                  # DNS records
│   │   ├── cloudfront.tf               # CloudFront distribution
│   │   ├── acm.tf                      # ACM certificates
│   │   ├── secrets_rotation.tf         # Secrets Manager & rotation
│   │   ├── outputs.tf                  # Terraform outputs
│   │   ├── terraform.tfvars.example    # Variable template
│   │   └── README.md                   # Terraform documentation
│   └── scripts/
│       └── setup-github-oidc.sh        # GitHub OIDC setup script
│
├── backend/                            # NestJS API
│   ├── src/
│   │   ├── main.ts                     # Application bootstrap
│   │   ├── app.module.ts               # Root module
│   │   ├── modules/                    # Feature modules
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── auth.module.ts
│   │   │   ├── users/
│   │   │   │   ├── users.controller.ts
│   │   │   │   ├── users.service.ts
│   │   │   │   └── users.module.ts
│   │   │   ├── venues/
│   │   │   ├── orders/
│   │   │   ├── presence/
│   │   │   ├── groups/
│   │   │   ├── redemptions/
│   │   │   ├── realtime/
│   │   │   │   └── realtime.gateway.ts # WebSocket gateway
│   │   │   └── health/
│   │   ├── common/
│   │   │   ├── dtos/                   # Data Transfer Objects
│   │   │   ├── guards/                 # JWT guard, RBAC guards
│   │   │   ├── filters/                # HTTP exception filters
│   │   │   ├── interceptors/           # Sentry, logging interceptors
│   │   │   └── services/
│   │   │       ├── prisma.service.ts   # Database connection
│   │   │       ├── redis.service.ts    # Cache & real-time
│   │   │       └── s3.service.ts       # File uploads
│   │   └── config/                     # Configuration
│   ├── prisma/
│   │   └── schema.prisma               # Database schema
│   ├── Dockerfile                      # Multi-stage Docker build
│   ├── task-definition.json            # ECS task definition
│   ├── package.json                    # Dependencies
│   ├── tsconfig.json                   # TypeScript config
│   └── nest-cli.json                   # NestJS CLI config
│
├── web/                                # Next.js Bartender & Admin Portal
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/                  # Login page
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                # Dashboard home
│   │   │   ├── scan/                   # QR scanner
│   │   │   ├── orders/                 # Order management
│   │   │   ├── profile/
│   │   │   ├── settings/
│   │   │   └── help/
│   │   ├── layout.tsx                  # Root layout
│   │   └── globals.css
│   ├── lib/
│   │   ├── api.ts                      # API client
│   │   └── auth.ts                     # Auth logic
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── mobile/                             # React Native + Expo App
│   ├── app/
│   │   ├── (app)/                      # App layout & screens
│   │   │   ├── _layout.tsx             # Main navigation
│   │   │   ├── index.tsx               # Home/map
│   │   │   ├── map.tsx                 # Venue map
│   │   │   ├── discover/               # Venue discovery
│   │   │   ├── groups/                 # Group management
│   │   │   ├── buy-drink/              # Order flow
│   │   │   ├── notifications/
│   │   │   └── profile/
│   │   └── (auth)/
│   │       ├── login.tsx
│   │       └── signup.tsx
│   ├── src/
│   │   ├── lib/
│   │   │   ├── api.ts                  # API client
│   │   │   ├── auth.ts
│   │   │   ├── googlePlacesAPI.ts
│   │   │   ├── userContext.tsx         # User context
│   │   │   └── mockData.ts
│   │   └── screens/
│   │       └── (app)/
│   ├── store/
│   │   └── groupStore.ts               # Zustand store
│   ├── app.json                        # Expo config
│   ├── eas.json                        # EAS build config
│   ├── package.json
│   └── tsconfig.json
│
├── .github/                            # GitHub configuration
│   └── workflows/                      # CI/CD workflows (if exists)
│
├── DEPLOYMENT.md                       # Deployment guide
├── DEPLOYMENT_GUIDE.md                 # Detailed deployment
├── DEPLOYMENT_CHECKLIST.md
├── README.md                           # Project overview
├── AWS_SETUP_SUMMARY.md
├── AWS_CREDENTIALS_SETUP.md
├── GITHUB_OIDC_SETUP.md
└── [Other documentation files]

```

---

## INFRASTRUCTURE & AWS SETUP

### AWS Account Structure

**Account ID:** 425687053209
**Primary Region:** us-east-1 (N. Virginia)

### VPC Architecture

```
VPC: 10.0.0.0/16
├── Public Subnets (AZ-a, AZ-b)
│   ├── 10.0.1.0/24 (us-east-1a)
│   └── 10.0.2.0/24 (us-east-1b)
│   └── Resources: NAT Gateways, IGW, ALB
│
└── Private Subnets (AZ-a, AZ-b)
    ├── 10.0.10.0/24 (us-east-1a)
    ├── 10.0.11.0/24 (us-east-1b)
    └── Resources: ECS Fargate tasks, RDS, Redis, DynamoDB
```

### Internet Connectivity

- **Internet Gateway (IGW):** Allows public subnets to reach the internet
- **NAT Gateways:** Two NAT GWs (one per AZ) for private subnet egress
- **Route Tables:** Separate routing for public and private subnets

### AWS Services Architecture

#### 1. **Database Layer**

**PostgreSQL RDS (Multi-AZ)**
```
Service: Amazon RDS
Engine: PostgreSQL 16.4
Instance Type: db.t4g.medium
Multi-AZ: YES (automatic failover)
Storage: 100 GB (auto-scaling up to 512 GB)
Backup: 7-day retention
Encryption: Enabled (KMS)
Publicly Accessible: NO
Security Group: Restricted to ECS tasks only
Credentials: Stored in Secrets Manager with auto-rotation (30 days)

Database Identifier: clubapp-dev-postgres
Master Username: app
Password: Auto-generated + rotated
```

**Connection Details:**
- Endpoint: `clubapp-dev-postgres.c1jtbcb1z2w1.us-east-1.rds.amazonaws.com:5432`
- Database Name: `postgres`
- Connection Method: Prisma ORM via DATABASE_URL

**Secrets Manager Integration:**
```
Secret Name: clubapp/dev/rds
Secret Value (JSON):
{
  "host": "clubapp-dev-postgres.c1jtbcb1z2w1.us-east-1.rds.amazonaws.com",
  "port": 5432,
  "username": "app",
  "password": "<auto-rotated>",
  "dbname": "postgres"
}

Rotation Lambda: Runs every 30 days automatically
```

#### 2. **Cache Layer**

**ElastiCache Redis (Multi-AZ)**
```
Service: Amazon ElastiCache
Engine: Redis 7.1
Node Type: cache.t4g.micro (or similar)
Number of Nodes: 2 (multi-AZ)
Automatic Failover: Enabled
Subnet Group: Private subnets
Security Group: Restricted to ECS tasks
Encryption: At-rest (enabled), In-transit (TLS)
```

**Redis Usage Patterns:**
- Session storage (JWT tokens)
- Real-time presence data
- Pub/Sub for WebSocket broadcasts
- Caching frequently accessed data
- Rate limiting counters

**Connection Details:**
- Primary Endpoint: `clubapp-dev-redis.xxxxx.ng.0001.use1.cache.amazonaws.com:6379`
- Accessed by: `ioredis` client in NestJS

#### 3. **NoSQL Database**

**DynamoDB Tables**
```
Table 1: presence_count
├── Partition Key: venueId (String)
├── Sort Key: timestamp (Number)
├── TTL: Enabled (24 hours)
└── Use: Real-time presence counts per venue
    - wantsToBuy count
    - wantsToReceive count

Table 2: venue_activity
├── Partition Key: venueId (String)
├── Sort Key: timestamp (Number)
└── Use: Activity logs and metrics

On-Demand Billing: PAY_PER_REQUEST (auto-scaling)
```

#### 4. **Object Storage**

**S3 Buckets**

```
Bucket 1: clubapp-dev-assets
├── Purpose: User profile images, venue photos, QR codes
├── Versioning: Enabled
├── Public Access: BLOCKED (access via CloudFront)
├── Lifecycle: 90 days → Glacier
└── Encryption: AES-256 (KMS)

Bucket 2: clubapp-dev-receipts
├── Purpose: Order receipts, payment proofs
├── Versioning: Enabled
├── Public Access: BLOCKED
├── Lifecycle: 1 year → Archive
└── Encryption: AES-256

Bucket 3: clubapp-dev-logs
├── Purpose: Application logs, access logs
├── Versioning: Disabled
├── Lifecycle: 30 days → Delete
└── Encryption: AES-256

Bucket 4: clubapp-dev-tfstate (Terraform State)
├── Purpose: Terraform state backup
├── Versioning: Enabled
├── Public Access: BLOCKED
├── Encryption: AES-256
└── MFA Delete: Disabled
```

#### 5. **Load Balancing & Networking**

**Application Load Balancer (ALB)**
```
Name: clubapp-dev-alb
Scheme: Internet-facing
Subnets: Public subnets (AZ-a, AZ-b)
Security Group: Allow 80, 443 from anywhere

Listeners:
├── Port 80 (HTTP) → Redirect to 443 (HTTPS)
└── Port 443 (HTTPS) → Target Group (api.desh.co)

Target Group: clubapp-dev-tg
├── Protocol: HTTP
├── Port: 3000
├── Health Check: /health (every 30s, 3 retries)
├── Type: IP-based (for Fargate)
└── VPC: vpc-xxxxx

Auto-scaling: Configured for ECS service
```

#### 6. **Container Orchestration**

**ECS Fargate Cluster**
```
Cluster Name: clubapp-dev-ecs
Launch Type: FARGATE (serverless)

Task Definition: clubapp-backend-task
├── CPU: 1024 (1 vCPU)
├── Memory: 2048 MB
├── Network Mode: awsvpc
├── Container: web
│   ├── Image: 425687053209.dkr.ecr.us-east-1.amazonaws.com/clubapp-backend:latest
│   ├── Port Mapping: 3000 → 3000
│   ├── Log Driver: CloudWatch (/ecs/clubapp-backend)
│   └── Health Check: /health endpoint
├── Execution Role: ecsTaskExecutionRole
│   └── Permissions: CloudWatch logs, ECR auth, Secrets Manager
└── Task Role: ecsTaskRole
    └── Permissions: S3, RDS, DynamoDB, Secrets Manager

Service: clubapp-dev-svc
├── Desired Count: 1 (can scale up)
├── Deployment: Rolling updates
├── Load Balancer: ALB → Target Group
├── VPC/Subnets: Private subnets
└── Security Group: Allow 3000 from ALB only

Scaling:
├── Min: 1 task
├── Max: 4 tasks (auto-scaling on CPU/memory)
└── Metric: CPU > 70% → scale up
```

**Container Image Registry (ECR)**
```
Repository: 425687053209.dkr.ecr.us-east-1.amazonaws.com/clubapp-backend
├── Image Tag: latest (or <git-sha>)
├── Scan on Push: Enabled
├── Lifecycle Policy: Keep 10 latest images
└── Auto-deployment: GitHub Actions on push to main
```

#### 7. **DNS & CDN**

**Route 53 (DNS)**
```
Hosted Zone: desh.co (Public)
Name Servers: 4 NS records (set in domain registrar)

DNS Records:
├── api.desh.co → ALB DNS name (alias)
├── assets.desh.co → CloudFront domain (alias)
└── @ (desh.co) → TBD (main website)

Domain Status: In-progress transfer from GoDaddy to Route 53
```

**CloudFront Distribution (CDN)**
```
Domain: d1234567890.cloudfront.net
Alias: assets.desh.co

Origin: S3 bucket (clubapp-dev-assets)
├── Origin Access Identity (OAI): Restricts direct S3 access
└── Use CloudFront for all asset delivery

Caching Behavior:
├── Default TTL: 86400 seconds (1 day)
├── Max TTL: 31536000 seconds (1 year)
├── Compress: Enabled
└── Security: HTTPS only, TLSv1.2+

SSL/TLS:
├── Certificate: ACM (assets.desh.co)
├── Viewer Protocol Policy: HTTPS only
└── Origin Protocol Policy: HTTPS

Performance:
├── HTTP/2: Enabled
├── HTTP/3 (QUIC): Enabled
└── Caching: Optimized for frequently accessed assets
```

#### 8. **SSL/TLS Certificates (ACM)**

```
Certificate 1: assets.desh.co
├── Status: Pending/Issued
├── Validation Method: DNS (Route 53)
├── Renewal: Auto-renewal (AWS handles)
└── Used by: CloudFront

Certificate 2: api.desh.co
├── Status: Pending/Issued
├── Validation Method: DNS (Route 53)
├── Renewal: Auto-renewal
└── Used by: Application Load Balancer

Validation Records (CNAME): Created automatically in Route 53
```

#### 9. **Identity & Access Management (IAM)**

**IAM Roles**

```
1. ecsTaskExecutionRole
   ├── Purpose: Pull images, write logs, manage secrets
   ├── Permissions:
   │   ├── logs:CreateLogGroup, logs:CreateLogStream
   │   ├── logs:PutLogEvents
   │   ├── ecr:GetAuthorizationToken
   │   ├── ecr:BatchGetImage
   │   ├── ecr:GetDownloadUrlForLayer
   │   └── secretsmanager:GetSecretValue
   └── Trust Policy: ECS service principal

2. ecsTaskRole
   ├── Purpose: Application permissions (S3, RDS, DynamoDB)
   ├── Permissions:
   │   ├── s3:GetObject, s3:PutObject (clubapp-dev-*)
   │   ├── rds:DescribeDBInstances
   │   ├── dynamodb:Query, dynamodb:Scan, dynamodb:PutItem
   │   ├── secretsmanager:GetSecretValue (DB credentials)
   │   ├── kms:Decrypt (KMS encryption)
   │   └── sns:Publish (for notifications)
   └── Trust Policy: ECS task service principal

3. github-oidc-deployment-role
   ├── Purpose: GitHub Actions deployment access
   ├── Permissions:
   │   ├── ecr:GetAuthorizationToken
   │   ├── ecr:BatchCheckLayerAvailability
   │   ├── ecr:PutImage
   │   ├── ecs:UpdateService
   │   ├── iam:PassRole (for task execution/role)
   │   ├── secretsmanager:GetSecretValue
   │   └── logs:CreateLogGroup, logs:CreateLogStream
   ├── Trust Policy: GitHub OIDC provider
   │   ├── Provider: token.actions.githubusercontent.com
   │   ├── Audience: sts.amazonaws.com
   │   └── Condition: repo:shafkat1/club:*
   └── Session Duration: 1 hour

4. TerraformExecutionRole
   ├── Purpose: Terraform infrastructure management
   ├── Permissions: Full AWS admin (for IaC)
   └── Trust Policy: GitHub OIDC + manual AWS credentials
```

**IAM Policies**

```
Policy 1: ecr-pull-push-policy
├── Action: ECR operations (push/pull images)
└── Resource: ECR repository ARN

Policy 2: ecs-deployment-policy
├── Action: Update ECS services, register task definitions
└── Resource: ECS service ARNs

Policy 3: s3-bucket-access-policy
├── Action: Get/Put objects
├── Resource: S3 bucket ARNs
└── Condition: Deny unencrypted uploads

Policy 4: secrets-access-policy
├── Action: GetSecretValue, DescribeSecret
├── Resource: Secrets Manager ARNs
└── Condition: Restrict to production secrets only

Policy 5: rds-connect-policy
├── Action: Describe RDS instances
└── Resource: RDS instance ARNs
```

#### 10. **Secrets Management**

**AWS Secrets Manager**

```
Secret: clubapp/dev/rds
├── Type: Database credentials
├── Value: { "host", "port", "username", "password", "dbname" }
├── Rotation:
│   ├── Lambda Function: Auto-rotate every 30 days
│   ├── Strategy: Single-use temp credentials
│   └── Notification: SNS topic on rotation
└── Access: ECS tasks via IAM role

Secret: clubapp/dev/jwt-secret
├── Type: Application secret
├── Value: JWT signing key (256-bit)
├── Rotation: Manual (on security events)
└── Access: ECS tasks

Secret: clubapp/dev/stripe-api-key
├── Type: Third-party credentials
├── Value: Stripe API secret key
├── Rotation: Manual (change from Stripe dashboard)
└── Access: ECS tasks

Secret: clubapp/dev/sendgrid-api-key
├── Type: Email service credentials
├── Value: SendGrid API key
└── Access: ECS tasks

Secret: clubapp/dev/twilio-credentials
├── Type: SMS service credentials
├── Value: Twilio auth token and SID
└── Access: ECS tasks

KMS Encryption:
└── All secrets encrypted with KMS key (arn:aws:kms:...)
```

#### 11. **Monitoring & Logging**

**CloudWatch Logs**

```
Log Group: /ecs/clubapp-backend
├── Retention: 30 days
├── Streams:
│   ├── ecs/clubapp-backend/web/<container-id>
│   └── Multiple streams per task
└── Log Level: INFO (configurable)

Log Group: /aws/ecs/service-deployment
├── Purpose: Service deployment logs
└── Retention: 7 days

Log Group: /aws/rds/instance/clubapp-dev-postgres
├── Purpose: Database logs
├── Log Types: error, general (configurable)
└── Retention: 7 days
```

**CloudWatch Metrics**

```
Metrics Collected:
├── ECS:
│   ├── CPUUtilization, MemoryUtilization
│   ├── TaskCount, ServiceRunningCount
│   └── Deployments, DeploymentErrors
├── RDS:
│   ├── DatabaseConnections
│   ├── CPUUtilization, FreeableMemory
│   ├── ReadLatency, WriteLatency
│   └── FailoverEvents
├── ALB:
│   ├── TargetResponseTime
│   ├── HTTPCode_Target_5XX
│   ├── HealthyHostCount, UnhealthyHostCount
│   └── RequestCount
├── ElastiCache:
│   ├── CPUUtilization, EvictionRate
│   ├── NetworkBytesIn/Out
│   └── CurrItems, Evictions
└── Custom Metrics: Application-defined via CloudWatch API
```

**Alarms & Notifications**

```
Alarm 1: High ECS CPU
├── Metric: ECS CPUUtilization > 80%
├── Duration: 5 minutes
└── Action: SNS notification + auto-scale

Alarm 2: ALB Unhealthy Targets
├── Metric: UnhealthyHostCount > 0
├── Duration: 2 minutes
└── Action: SNS notification + PagerDuty

Alarm 3: RDS Storage
├── Metric: FreeStorageSpace < 10%
├── Duration: 10 minutes
└── Action: SNS notification

Alarm 4: Redis Eviction
├── Metric: EvictionRate > 0
├── Duration: 5 minutes
└── Action: SNS notification (investigate cache hits)
```

#### 12. **KMS Encryption**

```
KMS Key: clubapp-dev-kms
├── Alias: alias/clubapp-dev
├── Key Policy: Allow IAM roles to decrypt
├── Key Rotation: Annual
└── Services Using:
    ├── RDS (database encryption)
    ├── S3 (object encryption)
    ├── Secrets Manager (secret encryption)
    └── EBS volumes (for persistence)
```

---

## BACKEND ARCHITECTURE

### NestJS Application Structure

#### Module Organization

```
AppModule (Root)
├── ConfigModule (global configuration)
├── ThrottlerModule (rate limiting)
├── JwtModule (authentication)
│
├── HealthModule
│   ├── HealthController
│   ├── HealthService
│   └── Health checks (database, cache, services)
│
├── AuthModule
│   ├── AuthController (/auth/*)
│   │   ├── POST /auth/signup
│   │   ├── POST /auth/login
│   │   ├── POST /auth/refresh-token
│   │   └── POST /auth/logout
│   ├── AuthService
│   │   ├── validateCredentials()
│   │   ├── generateJWT()
│   │   └── validateJWT()
│   ├── JwtStrategy
│   └── LocalStrategy
│
├── UsersModule
│   ├── UsersController (/users/*)
│   │   ├── GET /users/me
│   │   ├── PUT /users/me
│   │   ├── GET /users/:id/profile
│   │   └── DELETE /users/:id (account deletion)
│   ├── UsersService
│   │   ├── createUser()
│   │   ├── updateProfile()
│   │   ├── getUser()
│   │   └── deleteUser()
│   └── Entities: User, Device, AuditLog
│
├── VenuesModule
│   ├── VenuesController (/venues/*)
│   │   ├── GET /venues (list nearby)
│   │   ├── GET /venues/:id (details)
│   │   ├── POST /venues (create - admin)
│   │   └── GET /venues/:id/presence
│   ├── VenuesService
│   │   ├── listNearby()
│   │   ├── getVenue()
│   │   ├── createVenue()
│   │   └── getVenueCounts()
│   └── Entities: Venue
│
├── OrdersModule
│   ├── OrdersController (/orders/*)
│   │   ├── POST /orders (create order)
│   │   ├── GET /orders (list user orders)
│   │   ├── GET /orders/:id (order details)
│   │   ├── PUT /orders/:id (update status)
│   │   └── DELETE /orders/:id (cancel order)
│   ├── OrdersService
│   │   ├── createOrder()
│   │   ├── updateStatus()
│   │   ├── getOrders()
│   │   └── expireOldOrders() (scheduled task)
│   ├── PaymentService (Stripe integration)
│   └── Entities: Order, OrderStatus enum
│
├── RedemptionsModule
│   ├── RedemptionsController (/redemptions/*)
│   │   ├── POST /redemptions/scan (scan QR code)
│   │   ├── PUT /redemptions/:id/redeem
│   │   ├── GET /redemptions/:id/status
│   │   └── GET /redemptions (bartender history)
│   ├── RedemptionsService
│   │   ├── createRedemption()
│   │   ├── redeemOrder()
│   │   ├── getRedemption()
│   │   └── generateQRCode()
│   └── Entities: Redemption, RedemptionStatus enum
│
├── PresenceModule
│   ├── PresenceController (/presence/*)
│   │   ├── POST /presence/checkin
│   │   ├── POST /presence/checkout
│   │   ├── PUT /presence (update flags)
│   │   └── GET /presence/:venueId/counts
│   ├── PresenceService
│   │   ├── checkIn()
│   │   ├── checkOut()
│   │   ├── updateFlags()
│   │   ├── getCounts()
│   │   ├── publishUpdate() (WebSocket)
│   │   └── cleanupExpiredPresence() (scheduled)
│   └── Entities: Presence (Redis + DB)
│
├── GroupsModule
│   ├── GroupsController (/groups/*)
│   │   ├── POST /groups (create)
│   │   ├── GET /groups (list user groups)
│   │   ├── GET /groups/:id
│   │   ├── PUT /groups/:id
│   │   ├── DELETE /groups/:id
│   │   ├── POST /groups/:id/members (add member)
│   │   └── DELETE /groups/:id/members/:userId
│   ├── GroupsService
│   │   ├── createGroup()
│   │   ├── getGroup()
│   │   ├── updateGroup()
│   │   ├── addMember()
│   │   └── removeMember()
│   └── Entities: Group, GroupMember
│
├── RealtimeModule (WebSocket)
│   ├── RealtimeGateway
│   │   ├── @SubscribeMessage('join-venue')
│   │   ├── @SubscribeMessage('leave-venue')
│   │   ├── @SubscribeMessage('order-sent')
│   │   ├── @SubscribeMessage('order-accepted')
│   │   ├── @SubscribeMessage('presence-update')
│   │   └── broadcast* methods
│   ├── WebSocket Rooms: venue:{venueId}
│   └── Events: order-created, order-updated, presence-changed
│
├── Common (Shared across modules)
│   ├── Services/
│   │   ├── PrismaService
│   │   │   ├── $connect()
│   │   │   ├── $disconnect()
│   │   │   └── Lifecycle hooks
│   │   ├── RedisService
│   │   │   ├── get(), set(), del()
│   │   │   ├── subscribe(), publish()
│   │   │   └── Connection pool management
│   │   └── S3Service
│   │       ├── uploadFile()
│   │       ├── downloadFile()
│   │       ├── deleteFile()
│   │       └── generateSignedURL()
│   ├── Guards/
│   │   ├── JwtAuthGuard
│   │   │   └── canActivate() → JWT validation
│   │   ├── RolesGuard
│   │   │   └── canActivate() → Role-based access
│   │   └── ThrottlerGuard (from library)
│   ├── Interceptors/
│   │   ├── SentryInterceptor
│   │   │   └── Capture errors → Sentry
│   │   ├── LoggingInterceptor
│   │   │   └── Log request/response
│   │   └── TransformInterceptor
│   │       └── Standardize response format
│   ├── Filters/
│   │   └── HttpExceptionFilter
│   │       └── Catch exceptions → standardized error response
│   └── DTOs/
│       ├── auth.dto.ts
│       │   ├── SignUpDto
│       │   ├── LoginDto
│       │   └── RefreshTokenDto
│       ├── orders.dto.ts
│       │   ├── CreateOrderDto
│       │   └── UpdateOrderStatusDto
│       ├── venue.dto.ts
│       │   ├── CreateVenueDto
│       │   └── VenueFilterDto
│       └── [other DTOs]
│
└── Configuration
    ├── Environment Variables (from .env or Secrets Manager)
    │   ├── DATABASE_URL
    │   ├── REDIS_URL
    │   ├── JWT_SECRET
    │   ├── NODE_ENV
    │   ├── STRIPE_SECRET_KEY
    │   ├── SENDGRID_API_KEY
    │   ├── SENTRY_DSN
    │   └── [other secrets]
    └── Initialization: main.ts bootstrap
```

### Key Services Explained

#### 1. **PrismaService**

```typescript
// Location: src/common/services/prisma.service.ts
class PrismaService extends PrismaClient {
  constructor() {
    super({
      // Enable logging for slow queries
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  // Lifecycle hooks
  async onModuleInit() {
    await this.$connect(); // Connect on app start
  }

  async onModuleDestroy() {
    await this.$disconnect(); // Disconnect on app shutdown
  }
}

// Usage in other services:
this.prisma.user.findUnique({ where: { id: userId } });
this.prisma.order.create({ data: orderData });
this.prisma.presence.upsert({...}); // Create or update
```

**Database Capabilities:**
- Type-safe queries (generated types)
- Connection pooling (managed)
- Automatic migrations (prisma migrate)
- Relationship resolution
- Pagination support

#### 2. **RedisService**

```typescript
// Location: src/common/services/redis.service.ts
class RedisService {
  private redis: Redis;

  // Caching patterns
  async getCached(key: string) {
    return this.redis.get(key); // JSON string
  }

  async setCached(key: string, value: any, ttl: number) {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  // Pub/Sub patterns
  async subscribe(channel: string, handler: (msg) => void) {
    const subscriber = this.redis.duplicate();
    await subscriber.subscribe(channel);
    subscriber.on('message', (ch, msg) => handler(msg));
  }

  async publish(channel: string, message: any) {
    await this.redis.publish(channel, JSON.stringify(message));
  }

  // Session management
  async setSession(userId: string, sessionData: any, ttl: number) {
    await this.setCached(`session:${userId}`, sessionData, ttl);
  }

  // Rate limiting
  async checkRateLimit(key: string, limit: number, window: number) {
    const current = await this.redis.incr(key);
    if (current === 1) {
      await this.redis.expire(key, window);
    }
    return current <= limit;
  }
}

// Usage:
this.redis.setCached('venue:counts:v1', counts, 300); // Cache for 5 min
this.redis.publish('presence-updated', { venueId, counts }); // Broadcast
this.redis.checkRateLimit(`user:${userId}:orders`, 5, 60); // 5 orders per minute
```

**Real-Time Data Patterns:**
- Presence updates: `presence:{venueId}` (set of user IDs)
- Venue counts: `venue:counts:{venueId}` (cached JSON)
- WebSocket room tracking
- Session tokens

#### 3. **S3Service**

```typescript
// Location: src/common/services/s3.service.ts
class S3Service {
  private s3: S3Client;

  async uploadFile(bucket: string, key: string, file: Buffer, contentType: string) {
    const params = {
      Bucket: bucket,
      Key: key,
      Body: file,
      ContentType: contentType,
      ServerSideEncryption: 'AES256',
    };
    await this.s3.send(new PutObjectCommand(params));
    return `s3://${bucket}/${key}`;
  }

  async deleteFile(bucket: string, key: string) {
    await this.s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  }

  async generateSignedURL(bucket: string, key: string, expiresIn: number = 3600) {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    return await getSignedUrl(this.s3, command, { expiresIn });
  }
}

// Usage:
const url = await this.s3Service.uploadFile(
  'clubapp-dev-assets',
  `profiles/${userId}/avatar.jpg`,
  fileBuffer,
  'image/jpeg'
);
```

**S3 Bucket Usage:**
- `clubapp-dev-assets` → Profile images, venue photos
- `clubapp-dev-receipts` → Order receipts, payment proofs
- `clubapp-dev-logs` → Application logs

### API Endpoints

```
=== HEALTH ===
GET /health
  → { status: 'ok', db: true, redis: true, s3: true }

=== AUTHENTICATION ===
POST /auth/signup
  → { accessToken, refreshToken, user: {...} }
POST /auth/login
  → { accessToken, refreshToken, user: {...} }
POST /auth/refresh-token
  → { accessToken }
POST /auth/logout
  → { ok: true }

=== VENUES ===
GET /venues?latitude=40.7&longitude=-74.0&radius=5
  → { venues: [...], totalCount }
GET /venues/:venueId
  → { id, name, location, counts: { buyers, seekers } }
POST /venues (admin)
  → { id, name, ... }

=== ORDERS ===
POST /orders
  Body: { recipientId, venueId, amount, message }
  → { id, status: 'PENDING', expiresAt }
GET /orders (list user's orders)
  → { sent: [...], received: [...] }
GET /orders/:orderId
  → { id, status, buyer, recipient, ... }
PUT /orders/:orderId
  Body: { status: 'ACCEPTED' | 'REJECTED' }
  → { id, status, ... }
DELETE /orders/:orderId
  → { ok: true }

=== PRESENCE ===
POST /presence/checkin
  Body: { venueId, latitude?, longitude?, wantsToBuy?, wantsToReceive? }
  → { presenceId, expiresAt }
POST /presence/checkout
  Body: { venueId }
  → { ok: true }
PUT /presence
  Body: { venueId, wantsToBuy, wantsToReceive }
  → { presenceId, ... }
GET /presence/:venueId/counts
  → { buyers: 5, seekers: 3, total: 8 }

=== REDEMPTIONS ===
POST /redemptions/scan
  Body: { qrCode }
  → { orderId, recipient, amount, status }
PUT /redemptions/:redemptionId/redeem
  → { status: 'REDEEMED', redeemedAt }

=== GROUPS ===
POST /groups
  Body: { name }
  → { id, name, createdAt }
GET /groups (user's groups)
  → [{ id, name, members: [...] }]
POST /groups/:groupId/members
  Body: { userId }
  → { ok: true, memberId }

=== USERS ===
GET /users/me
  → { id, displayName, profileImage, ... }
PUT /users/me
  Body: { displayName, bio, profileImage, ... }
  → { id, displayName, ... }
GET /users/:userId/profile
  → { id, displayName, bio, profileImage }
```

### Scheduled Tasks

```typescript
// Location: src/modules/*/orders.service.ts
@Cron('0 0 * * *') // Daily at midnight
async expireOldOrders() {
  await this.prisma.order.updateMany({
    where: {
      status: 'PENDING',
      expiresAt: { lt: new Date() },
    },
    data: { status: 'EXPIRED' },
  });
}

// Location: src/modules/*/presence.service.ts
@Cron('*/5 * * * *') // Every 5 minutes
async cleanupExpiredPresence() {
  await this.prisma.presence.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });
}
```

---

## FRONTEND & MOBILE ARCHITECTURE

### Web Application (Next.js)

**Purpose:** Bartender QR scanner & admin dashboard

**Key Pages:**
1. **Login** (`/auth/login`)
   - Phone number entry
   - OTP verification
   - JWT token storage

2. **Dashboard** (`/`)
   - Welcome message
   - Navigation to scan, orders, profile

3. **QR Scanner** (`/dashboard/scan`)
   - Real-time camera access
   - QR code detection (ZXing library)
   - Order confirmation

4. **Orders** (`/dashboard/orders`)
   - List redeemed orders
   - Filter by date/venue
   - Export reports

5. **Profile** (`/dashboard/profile`)
   - Bartender info
   - Venue assignment
   - Settings

6. **Settings** (`/dashboard/settings`)
   - Preferences
   - Account security
   - Logout

**Tech Details:**
```javascript
// Authentication: JWT stored in httpOnly cookies
// State Management: Zustand stores
// Forms: React Hook Form + Zod validation
// Styling: Tailwind CSS
// API: Axios with interceptors for JWT refresh
// Real-time: Socket.io client for live updates
```

### Mobile Application (React Native + Expo)

**Purpose:** End-user platform for discovering venues and ordering drinks

**Key Screens:**

1. **Authentication** (`/(auth)/login`, `/(auth)/signup`)
   - Phone number entry
   - OTP verification
   - Profile creation

2. **Home/Map** (`/(app)/`)
   - Interactive map showing venues
   - Live counts (buyers, seekers)
   - User location (scoped to venue)

3. **Discover** (`/(app)/discover`)
   - List view of nearby venues
   - Filter by distance, type
   - Recommendations

4. **Groups** (`/(app)/groups`)
   - User's groups
   - Members online at venues
   - Group chat

5. **Buy Drink** (`/(app)/buy-drink`)
   - Find nearby seekers
   - Create order
   - Payment flow

6. **Notifications** (`/(app)/notifications`)
   - Order notifications
   - Friend presence updates
   - Messages

7. **Profile** (`/(app)/profile`)
   - User profile
   - Edit profile
   - Wallet/payment methods
   - Friends list

**Tech Details:**
```javascript
// Framework: Expo (managed React Native)
// Navigation: Expo Router (file-based routing)
// State: Zustand stores + React Context
// Forms: React Hook Form + Zod
// Styling: NativeWind (Tailwind for React Native)
// Storage: AsyncStorage (local persistence)
// Location: Expo Location API
// Camera: Expo Camera API
// Notifications: Expo Notifications
// API: Axios
// Real-time: Socket.io client
```

---

## DATABASE SCHEMA & DATA FLOW

### Data Models (Prisma Schema)

```
User
├── id (String, CUID)
├── phone (String, unique)
├── email (String, unique)
├── displayName (String)
├── profileImage (String, S3 URL)
├── bio (String)
├── OAuth IDs (googleId, facebookId, etc.)
├── Relationships:
│   ├── groupMembers[] → GroupMember
│   ├── sentDrinkOrders[] → Order (as buyer)
│   ├── receivedOrders[] → Order (as recipient)
│   ├── redemptions[] → Redemption (as bartender)
│   ├── presence? → Presence
│   └── devices[] → Device
└── Timestamps: createdAt, updatedAt, deletedAt

Group
├── id (String, CUID)
├── name (String)
├── venueId (String, foreign key)
├── members[] → GroupMember
└── Timestamps: createdAt, updatedAt

GroupMember
├── id, groupId, userId
├── isOwner (Boolean)
└── joinedAt (DateTime)

Venue
├── id (String, CUID)
├── name (String)
├── description (String)
├── latitude, longitude (Float)
├── address (String)
├── city (String)
├── coverImage (String, S3 URL)
├── orders[] → Order
├── presence[] → Presence (real-time users)
├── groups[] → Group
└── Timestamps: createdAt, updatedAt

Order
├── id (String, CUID)
├── buyerId, recipientId (User foreign keys)
├── venueId (Venue foreign key)
├── amount (Int, in cents)
├── currency (String, default "USD")
├── status (OrderStatus: PENDING|PAID|ACCEPTED|REJECTED|REDEEMED|EXPIRED|CANCELLED)
├── paymentMethod (PaymentMethod: STRIPE|APPLE_PAY|GOOGLE_PAY)
├── stripePaymentIntentId (String)
├── message (String)
├── redemptionId (Redemption foreign key)
├── Timestamps: createdAt, updatedAt, expiresAt

Redemption
├── id (String, CUID)
├── orders[] → Order (list of orders for this redemption)
├── bartenderId (User foreign key)
├── qrCode (String, unique)
├── status (RedemptionStatus: PENDING|SCANNED|REDEEMED|CANCELLED)
├── redeemedAt (DateTime)
└── Timestamps: createdAt, updatedAt

Presence
├── id (String, CUID)
├── userId (User, unique per venue)
├── venueId (Venue)
├── wantsToBuy (Boolean)
├── wantsToReceive (Boolean)
├── latitude, longitude (Float, optional)
├── expiresAt (DateTime, TTL for Redis)
├── lastSeen (DateTime)
└── Unique: [userId, venueId]

Device
├── id (String, CUID)
├── userId (User)
├── deviceToken (String, for push notifications)
├── platform (String: ios|android|web)
├── appVersion, osVersion (String)
├── pushEnabled (Boolean)
└── Timestamps: createdAt, lastUsedAt

AuditLog
├── id (String, CUID)
├── userId (String, optional)
├── action (String: CREATE|UPDATE|DELETE)
├── resource (String: Order|User|etc)
├── resourceId (String)
├── changes (JSON, what changed)
├── ipAddress (String)
├── userAgent (String)
└── createdAt (DateTime)
```

### Data Flow Example: Ordering a Drink

```
User A (Buyer) Flow:
1. Opens app → Venue Map
2. Selects Venue → Sees presence counts
3. Discovers User B in venue
4. Creates Order → POST /orders
   {
     "recipientId": "B",
     "venueId": "v1",
     "amount": 2000, // $20.00
     "message": "I owe you one!"
   }

Backend Processing:
5. Auth Guard validates JWT
6. OrderService.createOrder() called
7. Validates buyer has funds (or creates Stripe PaymentIntent)
8. Prisma creates Order { status: PENDING, expiresAt: 24h }
9. Payment processed if using Stripe
10. RealtimeGateway broadcasts to venue room:
    event: 'order-created'
    data: { orderId, buyerId, recipientId, amount }
11. Redis pub/sub: 'order:created' → notification service
12. Response to User A: { orderId, status: PENDING }

User B (Recipient) Flow:
13. Receives push notification (Expo Notifications)
14. Opens app → sees order in inbox
15. Accepts/Rejects order:
    PUT /orders/{orderId}
    { status: 'ACCEPTED' }

Backend:
16. Update Order in Prisma { status: ACCEPTED }
17. Broadcast to WebSocket: 'order-accepted'
18. Send confirmation to User A

Redemption Flow (Bartender):
19. Bartender scans QR code at bar
    POST /redemptions/scan
    { qrCode: "order_xyz_qr" }

20. Backend:
    - Validates QR code
    - Updates Order { status: REDEEMED }
    - Updates Redemption { status: REDEEMED, redeemedAt: now }
    - Records AuditLog

21. Broadcast: 'order-redeemed'
22. Response shows: ✅ Order redeemed!
```

### Cache Strategy

```
Redis Keys:
├── session:{userId} (TTL: 24h)
│   └── JWT + user info for quick lookups
├── presence:{venueId} (TTL: 30m)
│   └── Set of user IDs present at venue
├── venue:counts:{venueId} (TTL: 5m)
│   └── { buyers: 5, seekers: 3 }
├── user:profile:{userId} (TTL: 1h)
│   └── User profile data (to reduce DB queries)
├── rate:order:{userId} (TTL: 60s)
│   └── Counter for rate limiting orders
└── orders:pending:{userId} (TTL: realtime)
    └── Quick access to user's pending orders

Cache Invalidation:
├── When order is created → invalidate venue counts
├── When presence updates → invalidate venue presence
├── When user profile changes → invalidate user profile cache
└── TTL-based expiration for safety
```

---

## SECRET KEYS & CREDENTIALS MANAGEMENT

### Environment Variables & Secrets

```
=== DATABASE CREDENTIALS ===
DATABASE_URL=postgresql://app:MvbuAtwhxli9ZmAetz1Y1GaT@clubapp-dev-postgres.c1jtbcb1z2w1.us-east-1.rds.amazonaws.com:5432/postgres
  Location: AWS Secrets Manager (auto-rotated every 30 days)
  Retrieved by: ECS task via IAM role
  Format: PostgreSQL connection string
  Rotation: Lambda function manages credential rotation

=== REDIS CONNECTION ===
REDIS_URL=redis://:password@clubapp-dev-redis.xxxxx.ng.0001.use1.cache.amazonaws.com:6379
  Location: AWS Secrets Manager or environment
  Retrieved by: ECS task
  Auth: ElastiCache auth token
  TLS: Enabled for in-transit encryption

=== JWT AUTHENTICATION ===
JWT_SECRET=<256-bit random key>
  Location: AWS Secrets Manager (secret: clubapp/dev/jwt-secret)
  Rotation: Manual (on security incidents)
  Algorithm: HS256
  Expiration: 24 hours
  Used for: Access token signing

JWT_REFRESH_SECRET=<different 256-bit key>
  Location: AWS Secrets Manager
  Expiration: 7 days
  Used for: Refresh token signing

=== PAYMENT PROCESSING ===
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
  Location: AWS Secrets Manager (secret: clubapp/dev/stripe-api-key)
  Retrieved by: ECS task via IAM role
  Used for: Creating payment intents, charging cards
  Webhook Secret: STRIPE_WEBHOOK_SECRET (stored separately)

STRIPE_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx
  Location: Frontend environment variables (public)
  Used for: Stripe.js client-side initialization

=== EMAIL SERVICE ===
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
  Location: AWS Secrets Manager (secret: clubapp/dev/sendgrid-api-key)
  Retrieved by: ECS task
  Used for: Transactional emails (order confirmations, etc.)
  Sender Email: noreply@desh.co

=== SMS SERVICE ===
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
  Location: AWS Secrets Manager (secret: clubapp/dev/twilio-credentials)
  Retrieved by: ECS task
  Used for: OTP SMS, notifications

=== AWS CREDENTIALS ===
AWS_ACCESS_KEY_ID=AKIA... (for local testing only)
AWS_SECRET_ACCESS_KEY=... (for local testing only)
  Location: ~/.aws/credentials (local development)
  Retrieved by: ECS task via IAM role (production)
  Scope: ECS, ECR, S3, Secrets Manager, RDS

=== OAUTH PROVIDERS ===
GOOGLE_OAUTH_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-xxxxx
  Location: AWS Secrets Manager
  Used for: Google Sign-In integration

FACEBOOK_APP_ID=xxxxxxxxxxxxx
FACEBOOK_APP_SECRET=xxxxxxxxxxxxx
  Location: AWS Secrets Manager
  Used for: Facebook Login integration

=== ERROR TRACKING ===
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/000000
  Location: Environment variable or Secrets Manager
  Retrieved by: ECS task
  Used for: Error tracking and alerting
  Environment: production | development

=== LOGGING ===
LOG_LEVEL=info | debug | error
NODE_ENV=production | development
  Used for: Controlling log verbosity

=== CORS & SECURITY ===
CORS_ORIGIN=https://api.desh.co,https://assets.desh.co
ALLOWED_DOMAINS=desh.co
  Frontend URLs allowed to call API

=== APPLICATION CONFIG ===
PORT=3000
API_VERSION=v1
API_PREFIX=/api
SWAGGER_ENABLED=true | false
  Used for: API configuration

=== S3 BUCKETS ===
S3_ASSETS_BUCKET=clubapp-dev-assets
S3_RECEIPTS_BUCKET=clubapp-dev-receipts
S3_LOGS_BUCKET=clubapp-dev-logs
S3_REGION=us-east-1
  Determined by: Terraform outputs
  Retrieved by: ECS task via IAM role
```

### Secret Rotation Schedule

```
CRITICAL SECURITY: Database Credentials
├── Rotation: Every 30 days (automatic via Lambda)
├── Method: Secrets Manager creates new temp credentials
├── Old credentials: Invalidated after grace period
├── Monitoring: CloudWatch logs + SNS notification

IMPORTANT: JWT Secrets
├── Rotation: On security incidents or quarterly
├── Method: Manual update in Secrets Manager
├── Impact: Invalidates all existing tokens (users re-login)
└── Monitoring: Requires approval + audit log

HIGH: API Keys (Stripe, SendGrid, Twilio)
├── Rotation: Quarterly or on compromise
├── Method: Regenerate in service dashboard
├── Impact: No impact if done correctly
└── Monitoring: Test with test transactions

MEDIUM: OAuth Credentials
├── Rotation: Annually or if compromised
├── Method: Regenerate in provider dashboard
└── Impact: Brief disruption to OAuth users

LOW: Configuration Values
├── Rotation: As needed (not sensitive)
└── Method: Manual update in Secrets Manager
```

### Secret Retrieval in Different Environments

```
=== LOCAL DEVELOPMENT ===
Method: .env file (git-ignored)
File: .env (create from .env.example)
Credentials: AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY
Database: Local PostgreSQL or RDS via VPN
Cache: Local Redis or ElastiCache via VPN

Example .env:
```
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/clubapp
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-secret-key-for-local-only
STRIPE_SECRET_KEY=sk_test_xxxxx
SENTRY_DSN=
LOG_LEVEL=debug
```

=== STAGING / PRODUCTION ===
Method: AWS Secrets Manager (automatic retrieval)
IAM Role: ecsTaskRole (allows GetSecretValue)
Retrieval Pattern:

```typescript
// Backend code
const secret = await secretsManager.getSecretValue({
  SecretId: 'clubapp/dev/rds'
});
const { host, port, username, password } = JSON.parse(secret.SecretString);

// Or use AWS SDK v3
const client = new SecretsManagerClient({});
const command = new GetSecretValueCommand({ SecretId: 'clubapp/dev/jwt-secret' });
const { SecretString } = await client.send(command);
```

Rotation: Handled automatically, app reads fresh value on each request

=== GITHUB ACTIONS ===
Method: GitHub Secrets + Environment Variables
Storage: GitHub repository secrets (encrypted)
Retrieval: Environment variable in workflow

Example workflow:
```yaml
env:
  AWS_ROLE_TO_ASSUME: ${{ secrets.AWS_ROLE_TO_ASSUME }}
  AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
  AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

Access: Via OIDC in production (more secure)
```

---

## DEPLOYMENT PIPELINE

### Deployment Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ DEVELOPMENT FLOW                                            │
└─────────────────────────────────────────────────────────────┘

Developer commits code → git push origin feature-branch

GitHub PR created → Code review → Approved

Developer merges PR → git push origin main

├─ GitHub Actions Trigger
│
├─ STEP 1: CHECKOUT & SETUP
│   ├── Checkout code
│   ├── Setup Node.js 18
│   └── Setup Docker buildx
│
├─ STEP 2: LINT & TEST
│   ├── ESLint checks
│   ├── TypeScript compilation
│   ├── Jest unit tests
│   ├── Prisma schema validation
│   └── Report errors if failed
│
├─ STEP 3: BUILD DOCKER IMAGE
│   ├── Build multi-stage Docker image
│   ├── Tag: 425687053209.dkr.ecr.us-east-1.amazonaws.com/clubapp-backend:latest
│   └── Tag: :${{ github.sha }} (commit hash)
│
├─ STEP 4: PUSH TO ECR
│   ├── Authenticate to ECR (OIDC)
│   ├── Push image with both tags
│   └── Image scan: CVE vulnerability check
│
├─ STEP 5: UPDATE ECS TASK DEFINITION
│   ├── Register new task definition
│   ├── Update image reference: :${{ github.sha }}
│   ├── Preserve existing env vars & secrets
│   └── Record new task definition revision
│
├─ STEP 6: UPDATE ECS SERVICE
│   ├── Force new deployment
│   ├── Rolling update (1 task at a time)
│   ├── Health check: Wait 5 min for new task to be healthy
│   └── If unhealthy: Rollback to previous task definition
│
├─ STEP 7: VERIFY DEPLOYMENT
│   ├── Check service status
│   ├── Verify task count = desired count
│   ├── Run smoke tests against API
│   └── Send Slack notification (success/failure)
│
└─ Deployment Complete!
   Users automatically receive updates (blue-green deployment)

┌─────────────────────────────────────────────────────────────┐
│ INFRASTRUCTURE (TERRAFORM) DEPLOYMENT                       │
└─────────────────────────────────────────────────────────────┘

Developer modifies terraform/* files → git push origin feature-branch

GitHub PR created → Terraform plan generated

├─ STEP 1: TERRAFORM PLAN
│   ├── Run: terraform init
│   ├── Run: terraform plan
│   ├── Output: Show what will change
│   ├── Review: Humans approve changes
│   └── Artifact: Save tfplan file
│
├─ STEP 2: TERRAFORM APPLY (on merge to main)
│   ├── Download tfplan artifact
│   ├── Run: terraform apply tfplan
│   ├── Wait for all resources to be provisioned
│   ├── Capture outputs (ALB DNS, RDS endpoint, etc.)
│   └── Run tests to verify infrastructure
│
└─ Infrastructure changes live!
   VPC, RDS, Redis, ECS cluster, ALB, etc. updated
```

### Deployment Safety

```
ROLLBACK STRATEGY:
├── If ECS task fails health check:
│   ├── Automatically stop the failed task
│   ├── Keep previous task definition running
│   ├── Send alert to team
│   └── Manual investigation required
│
├── If Terraform apply fails:
│   ├── Terraform rollback (partial - manual)
│   ├── Previous infrastructure still running
│   ├── Manual reversal needed for specific resources
│   └── Document what failed
│
└── Manual Rollback (if needed):
    ├── Revert git commit
    ├── Push to main
    ├── GitHub Actions redeploys previous version
    └── Takes ~5-10 minutes

ZERO-DOWNTIME DEPLOYMENT:
├── ALB health check: 30s interval, 3 consecutive checks
├── ECS task grace period: 60 seconds
├── New task starts → receives traffic only when healthy
├── Old task continues serving → traffic redirected gradually
└── Result: Users see no interruption
```

---

## GITHUB ACTIONS & CI/CD

### GitHub Actions Workflows

**File Location:** `.github/workflows/` (if it exists - need to check)

**Workflows Configured:**

1. **Build & Deploy Backend** (terraform.yml or deploy.yml)

```yaml
name: Build and Deploy Backend

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  AWS_REGION: us-east-1
  ECR_REGISTRY: 425687053209.dkr.ecr.us-east-1.amazonaws.com
  ECR_REPOSITORY: clubapp-backend

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies (backend)
        working-directory: backend
        run: npm ci
      
      - name: Lint
        working-directory: backend
        run: npm run lint
      
      - name: Build
        working-directory: backend
        run: npm run build
      
      - name: Test
        working-directory: backend
        run: npm run test:cov
  
  build-docker:
    needs: build-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v2
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_TO_ASSUME }}
          role-session-name: github-actions
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Login to Amazon ECR
        run: |
          aws ecr get-login-password --region ${{ env.AWS_REGION }} | \
          docker login --username AWS --password-stdin ${{ env.ECR_REGISTRY }}
      
      - name: Build Docker image
        working-directory: backend
        run: |
          docker build -t ${{ env.ECR_REGISTRY }}/${{ env.ECR_REPOSITORY }}:latest \
            -t ${{ env.ECR_REGISTRY }}/${{ env.ECR_REPOSITORY }}:${{ github.sha }} .
      
      - name: Push image to ECR
        run: |
          docker push ${{ env.ECR_REGISTRY }}/${{ env.ECR_REPOSITORY }}:latest
          docker push ${{ env.ECR_REGISTRY }}/${{ env.ECR_REPOSITORY }}:${{ github.sha }}
  
  deploy-ecs:
    needs: build-docker
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v2
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_TO_ASSUME }}
          role-session-name: github-actions
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Update ECS task definition
        run: |
          aws ecs register-task-definition \
            --cli-input-json file://backend/task-definition.json \
            --container-definitions "[{\"name\":\"web\",\"image\":\"${{ env.ECR_REGISTRY }}/${{ env.ECR_REPOSITORY }}:${{ github.sha }}\"}]"
      
      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster clubapp-dev-ecs \
            --service clubapp-dev-svc \
            --force-new-deployment
      
      - name: Wait for deployment
        run: |
          aws ecs wait services-stable \
            --cluster clubapp-dev-ecs \
            --services clubapp-dev-svc
      
      - name: Slack notification
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "Deployment successful! ✅",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Deployment to Production*\nCommit: ${{ github.sha }}\nAuthor: ${{ github.actor }}"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### GitHub OIDC Setup

```
Purpose: Allow GitHub Actions to assume AWS IAM role without storing secrets

Configuration:

1. AWS: Create OIDC Provider
   ├── Provider URL: token.actions.githubusercontent.com
   ├── Audience: sts.amazonaws.com
   └── Thumbprint: (AWS calculates this)

2. AWS: Create IAM Role
   ├── Role Name: github-oidc-deployment-role
   ├── Trust Policy:
   │   {
   │     "Effect": "Allow",
   │     "Principal": {
   │       "Federated": "arn:aws:iam::425687053209:oidc-provider/token.actions.githubusercontent.com"
   │     },
   │     "Action": "sts:AssumeRoleWithWebIdentity",
   │     "Condition": {
   │       "StringEquals": {
   │         "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
   │       },
   │       "StringLike": {
   │         "token.actions.githubusercontent.com:sub": "repo:shafkat1/club:*"
   │       }
   │     }
   │   }
   └── Inline Policy: ECR push, ECS update, Secrets Manager read

3. GitHub: Add Repository Secrets
   ├── AWS_ROLE_TO_ASSUME = arn:aws:iam::425687053209:role/github-oidc-deployment-role
   └── Optional: SLACK_WEBHOOK_URL (for notifications)

Benefits:
├── No long-lived secrets needed
├── Tokens expire in 1 hour
├── Automatically rotated per job
└── Audit trail via CloudTrail

Files:
├── deployment-trust-policy.json (Trust policy for OIDC)
├── deployment-policy.json (IAM permissions)
└── trust-policy-github-oidc.json (Reference)
```

---

## SECURITY ARCHITECTURE

### Authentication & Authorization

```
AUTHENTICATION FLOW (JWT):

1. User Signs Up:
   POST /auth/signup
   { phone, email, password }
   
   Backend:
   ├── Validate input (Zod schema)
   ├── Hash password (bcrypt, 10 rounds)
   ├── Create User in database
   ├── Generate JWT: { userId, role, issuedAt, expiresIn: 24h }
   ├── Generate RefreshToken: { userId, expiresIn: 7d }
   └── Return both tokens (HTTP-only cookies)

2. User Logs In:
   POST /auth/login
   { phone, password }
   
   Backend:
   ├── Find user by phone
   ├── Compare password (bcrypt verify)
   ├── Generate JWT + RefreshToken
   └── Return both tokens

3. Authenticated Requests:
   GET /orders
   Header: Authorization: Bearer <JWT>
   
   Backend:
   ├── JwtAuthGuard validates JWT signature
   ├── Extract userId from decoded token
   ├── Attach user to request
   └── Allow/deny based on permissions

4. Token Refresh:
   POST /auth/refresh-token
   { refreshToken }
   
   Backend:
   ├── Validate RefreshToken signature
   ├── Check if token is blacklisted (Redis)
   ├── Generate new JWT (same userId/role)
   └── Return new JWT

5. Logout:
   POST /auth/logout
   
   Backend:
   ├── Add JWT to blacklist (Redis, TTL: remaining token lifetime)
   ├── Add RefreshToken to blacklist
   └── Clear cookies on client
```

### OAuth Integration

```
GOOGLE OAUTH:
1. Frontend: Redirect to Google login
2. Google returns auth code
3. Backend exchanges code for tokens:
   POST /auth/google/callback
   { code }
   ↓
4. Backend calls Google to verify code
5. Get user info: { email, name, picture }
6. Upsert user in database (link to googleId)
7. Generate JWT
8. Redirect to app with token

SIMILAR FLOW FOR: Facebook, Apple, Instagram, TikTok
```

### Authorization (Roles & Permissions)

```
ROLES:
├── USER (default)
│   ├── Can create/update own profile
│   ├── Can create orders (with balance check)
│   ├── Can manage own groups
│   ├── Can join venues (presence)
│   └── Cannot: Redeem orders, create venues
│
├── BARTENDER
│   ├── All USER permissions
│   ├── Can scan QR codes
│   ├── Can redeem orders
│   ├── Can view orders at assigned venue
│   ├── Cannot: Delete users, modify other profiles
│   └── Assigned to specific venues
│
└── ADMIN
    ├── All permissions
    ├── Can create venues
    ├── Can assign bartenders
    ├── Can view analytics
    ├── Can manage users
    ├── Can delete content
    └── Full database access

IMPLEMENTATION:
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'BARTENDER')
@Post('venues')
createVenue(@Body() dto: CreateVenueDto) {
  // Only admins and bartenders can create venues
}

RBAC Hierarchy:
USER < BARTENDER < ADMIN
(more privileged roles can do everything less privileged can)
```

### Data Security

```
PASSWORD HASHING:
├── Algorithm: bcrypt
├── Cost Factor: 10 (takes ~100ms per hash)
├── Stored in: PostgreSQL users table
├── Never transmitted: Only used for login verification

DATABASE ENCRYPTION:
├── RDS Encryption: AES-256 (KMS key)
├── All data at-rest: Encrypted
├── Backups: Also encrypted
├── Restore: Automatic decryption

API TRANSMISSION:
├── Protocol: HTTPS only
├── Certificates: ACM (auto-renewed)
├── TLS Version: 1.2+
├── Ciphers: Strong (no weak cipher suites)

S3 ENCRYPTION:
├── Server-side: AES-256
├── KMS: Optional (for sensitive files)
├── Upload: Enforce encryption via bucket policy
├── Access: Signed URLs (time-limited)

REDIS ENCRYPTION:
├── In-transit: TLS (ElastiCache AUTH)
├── At-rest: Encryption at rest (enabled)
└── Sessions: Stored with TTL

SECRETS MANAGEMENT:
├── Storage: AWS Secrets Manager (encrypted)
├── Rotation: Automatic (30 days for DB credentials)
├── Retrieval: Only ECS tasks via IAM role
├── Audit: CloudTrail logs all access
└── Backup: AWS handles automatic backups
```

### Network Security

```
SECURITY GROUPS:

ALB Security Group:
├── Inbound:
│   ├── 80 (HTTP) from 0.0.0.0/0 → Auto-redirect to 443
│   ├── 443 (HTTPS) from 0.0.0.0/0 → Forward to ECS
│   └── No other ports allowed
└── Outbound: All allowed

ECS Tasks Security Group:
├── Inbound:
│   ├── 3000 from ALB security group only
│   ├── 22 (SSH) from bastion host only (if needed)
│   └── No other inbound traffic
├── Outbound:
│   ├── 5432 (PostgreSQL) to RDS security group
│   ├── 6379 (Redis) to Redis security group
│   ├── 443 (HTTPS) to internet (for external APIs)
│   └── 53 (DNS) to internet
└── No inbound from internet (private subnets)

RDS Security Group:
├── Inbound:
│   └── 5432 (PostgreSQL) from ECS security group only
└── Outbound: All allowed (usually not needed)

ElastiCache Security Group:
├── Inbound:
│   └── 6379 (Redis) from ECS security group only
└── Outbound: All allowed

VPC Endpoints (for AWS Services):
├── S3: Gateway endpoint (no internet needed)
├── Secrets Manager: Interface endpoint
├── ECR: Interface endpoints (api, dkr, logs)
└── CloudWatch: Interface endpoint
(Allows private subnets to reach AWS services without NAT)
```

### DDoS & Rate Limiting

```
RATE LIMITING:
├── API Level:
│   ├── Throttler Guard: 10 requests per 60 seconds (global)
│   ├── Per-endpoint: Custom limits (e.g., order creation: 5/min)
│   ├── Storage: Redis (incremented counter)
│   └── Response: 429 Too Many Requests
│
├── AWS WAF (optional):
│   ├── Rate-based rules: 2000 requests per 5 minutes
│   ├── IP reputation lists: Block known bad actors
│   └── Geo-blocking: Optional (if not serving certain regions)
│
└── CloudFront:
    ├── DDoS protection: AWS Shield Standard (free)
    ├── Advanced: AWS Shield Advanced (optional paid)
    └── Bot mitigation: AWS Bot Control (optional)

IMPLEMENTATION:
this.redis.checkRateLimit(`user:${userId}:orders`, 5, 60)
// User can create max 5 orders per minute
```

---

## MONITORING & LOGGING

### CloudWatch Logging

```
LOG STRUCTURE:
{
  "timestamp": "2025-10-30T12:34:56.789Z",
  "level": "INFO",
  "logger": "OrdersService",
  "message": "Order created successfully",
  "context": {
    "orderId": "order_123",
    "buyerId": "user_456",
    "venueId": "venue_789",
    "amount": 2000
  },
  "trace": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "span": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}

LOG LEVELS:
├── DEBUG: Detailed diagnostic info (dev only)
├── INFO: General informational messages
├── WARN: Warning messages (investigate)
├── ERROR: Error messages (requires attention)
└── FATAL: Critical errors (system down)

EXAMPLES:
├── Order created → INFO
├── User login failed → WARN
├── Database connection error → ERROR
├── ECS task crash → FATAL
└── Cache miss on high-traffic endpoint → DEBUG

RETENTION:
├── /ecs/clubapp-backend → 30 days
├── /aws/ecs/service-deployment → 7 days
├── /aws/rds/instance/... → 7 days
└── /aws/lambda/secrets-rotation → 14 days

FILTERING:
├── Error logs: [ERROR, FATAL]
├── Slow queries: duration > 1000ms
├── Failed requests: status >= 400
└── Deployment events: action: "DEPLOY"
```

### CloudWatch Dashboards

```
Main Dashboard:
├── ECS Metrics:
│   ├── Running tasks vs Desired count
│   ├── CPU utilization (avg, max)
│   ├── Memory utilization (avg, max)
│   └── Failed deployments (red alert if > 0)
│
├── Application Metrics:
│   ├── Request count (per endpoint)
│   ├── Error rate (5xx errors)
│   ├── Response time (p50, p95, p99)
│   └── Active users (concurrent)
│
├── Database Metrics:
│   ├── Connection count
│   ├── Query latency
│   ├── Storage usage
│   └── Replica lag
│
├── Cache Metrics:
│   ├── Hit/miss ratio
│   ├── Eviction rate
│   ├── Memory usage
│   └── Network throughput
│
└── ALB Metrics:
    ├── Request count
    ├── Health host count (should be > 0)
    ├── Response time
    └── HTTP status distribution

ALERTS CONFIGURED:
├── ECS CPU > 80% → Scale up
├── ALB unhealthy targets > 0 → Alert team
├── RDS storage < 10% free → Alert team
├── Redis eviction rate > 0 → Investigate cache
├── Error rate > 5% → Page on-call
└── Deployment failed → Slack notification
```

### Error Tracking (Sentry)

```
INTEGRATION:
├── DSN: From Secrets Manager (SENTRY_DSN env var)
├── Environment: production, staging, development
├── Release: Git commit SHA
├── Traces Sample Rate: 0.1 (10% of requests)

CAPTURED:
├── Unhandled exceptions
├── HTTP errors (5xx)
├── Validation errors
├── Database errors
├── API integration errors
└── WebSocket disconnections

SENTRY DASHBOARD:
├── Error trends: Graph of errors over time
├── Issue details: Stack trace, source context, breadcrumbs
├── Release tracking: Which code version caused it
├── Assignee: Route to developer
└── Resolution: Mark as resolved/ignored

ALERTS:
├── New issue created → Slack
├── Error rate spike → PagerDuty
└── Performance degradation → Slack

EXAMPLE ERROR:
{
  "title": "TypeError: Cannot read property 'id' of undefined",
  "error": {
    "message": "Cannot read property 'id' of undefined",
    "stack": [
      "at OrdersService.createOrder (backend/src/modules/orders/orders.service.ts:45:10)",
      "at OrdersController.create (backend/src/modules/orders/orders.controller.ts:20:5)",
      ...
    ]
  },
  "context": {
    "userId": "user_123",
    "venueId": "venue_456",
    "timestamp": "2025-10-30T12:34:56Z"
  },
  "release": "abc123def456"
}
```

---

## DEVELOPMENT GUIDELINES

### Local Development Setup

```bash
=== PREREQUISITES ===
1. Node.js 18+
2. Docker Desktop (for PostgreSQL, Redis locally)
3. AWS Account credentials
4. Git

=== CLONE & SETUP ===
git clone https://github.com/shafkat1/club.git
cd club

=== BACKEND SETUP ===
cd backend

# Copy environment template
cp .env.example .env

# Install dependencies
npm ci  # Use npm ci instead of npm install (locked versions)

# Setup local database
docker-compose up -d postgres redis  # If docker-compose.yml exists
# OR manually:
docker run --name postgres -e POSTGRES_PASSWORD=password -d postgres:16
docker run --name redis -d redis:7

# Run database migrations
npm run migration:deploy

# Generate Prisma client
npm run prisma:generate

# Start development server
npm run start:dev
# API: http://localhost:3000

=== WEB SETUP ===
cd ../web

npm ci
npm run dev
# Web: http://localhost:3000

=== MOBILE SETUP ===
cd ../mobile

npm ci
npm run start
# Expo: Follow prompts to launch in simulator or device

=== TESTING ===
# Backend unit tests
cd backend
npm run test

# With coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Code Quality

```
LINTING:
├── ESLint: JavaScript/TypeScript linting
├── Prettier: Code formatting
├── TSC: TypeScript compilation check
└── Prisma: Schema validation

RUNNING CHECKS:
cd backend
npm run lint          # ESLint with auto-fix
npm run format        # Prettier format
npm run type-check    # TypeScript check
npm run test          # Jest tests

COMMIT HOOKS (via husky - if configured):
├── Pre-commit: Lint changed files
├── Pre-push: Run tests
└── Commit-msg: Validate message format

CONVENTIONAL COMMITS:
├── feat: New feature
├── fix: Bug fix
├── docs: Documentation
├── style: Code style (no logic change)
├── refactor: Code restructuring
├── perf: Performance improvement
├── test: Adding/updating tests
└── chore: Build, deps, etc.

EXAMPLE:
feat(orders): add drink order expiration
fix(auth): prevent JWT token replay attacks
docs(api): update swagger documentation
```

### Database Migrations

```
CREATE NEW MIGRATION:
npm run migration:create add_user_phone_verification

# Edit schema.prisma with your changes

# Review generated migration:
cat prisma/migrations/[timestamp]_add_user_phone_verification/migration.sql

# Apply migration to database:
npm run migration:deploy

# Rollback (careful!):
# Cannot rollback in Prisma directly - requires manual SQL

RESET DATABASE (development only):
npm run migration:reset
# Drops all data and re-runs all migrations

GENERATE PRISMA CLIENT:
npm run prisma:generate

OPEN PRISMA STUDIO (GUI for database):
npm run prisma:studio
# Opens http://localhost:5555
```

### Git Workflow

```
BRANCH NAMING:
├── feature/[feature-name] → New feature
├── fix/[issue-name] → Bug fix
├── hotfix/[issue-name] → Production hotfix
├── refactor/[description] → Code refactoring
└── docs/[topic] → Documentation updates

WORKFLOW:
1. Create feature branch from main:
   git checkout -b feature/new-feature

2. Make commits (atomic, descriptive messages):
   git add .
   git commit -m "feat(orders): add order cancellation"

3. Keep branch updated:
   git fetch origin
   git rebase origin/main
   (or git merge origin/main if you prefer)

4. Push and create Pull Request:
   git push origin feature/new-feature
   # Go to GitHub, create PR

5. Code review and merge:
   # After approval, merge via GitHub UI
   # Delete branch after merge

PULL REQUEST TEMPLATE:
## Description
[What changes did you make?]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change

## How Has This Been Tested?
[Describe your testing]

## Checklist
- [ ] Code follows project style
- [ ] Added/updated tests
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tested locally
```

---

## TROUBLESHOOTING & COMMON ISSUES

### ECS Deployment Issues

```
SYMPTOM: ECS service stuck in deploying, rolling back
CAUSES:
├── Task fails health check (/health endpoint returns non-200)
├── Out of memory (memory reserved too low)
├── Container fails to start (image not found, env vars wrong)
└── Security group misconfiguration

DIAGNOSIS:
1. Check ECS service logs:
   aws ecs describe-services --cluster clubapp-dev-ecs --services clubapp-dev-svc

2. Check task logs in CloudWatch:
   /ecs/clubapp-backend stream

3. Check task definition:
   aws ecs describe-task-definition --task-definition clubapp-backend-task

SOLUTIONS:
├── Increase memory: Edit task definition, change memory from 2048 to 3072
├── Check image: Ensure ECR image exists and is not corrupt
├── Check env vars: Verify DATABASE_URL, REDIS_URL are correct
├── Check health endpoint: Test GET /health manually
└── Check security groups: Ensure ECS → ALB → Internet routing
```

### Database Connection Issues

```
SYMPTOM: "ECONNREFUSED" or "FATAL: password authentication failed"
CAUSES:
├── Database not running
├── Wrong credentials
├── Security group blocking traffic
├── Database parameter: max_connections exceeded

DIAGNOSIS:
1. Check database is running:
   aws rds describe-db-instances --db-instance-identifier clubapp-dev-postgres

2. Check credentials:
   aws secretsmanager get-secret-value --secret-id clubapp/dev/rds

3. Check security group:
   aws ec2 describe-security-groups --group-ids sg-xxxxx

SOLUTIONS:
├── Start/restart RDS: AWS Console → RDS → Databases
├── Rotate credentials: Secrets Manager → Rotation
├── Check source CIDR: Ensure ECS security group is allowed
├── Increase max_connections: RDS parameter group
└── Check connection string: Validate DATABASE_URL format
```

### Redis Connection Issues

```
SYMPTOM: "redis connection refused" or "NOAUTH Authentication required"
CAUSES:
├── Redis not running
├── Wrong password/auth token
├── Security group blocking traffic
├── ElastiCache AUTH not enabled

DIAGNOSIS:
1. Check Redis cluster:
   aws elasticache describe-cache-clusters --cache-cluster-id clubapp-dev-redis

2. Test connection:
   redis-cli -h <endpoint> -p 6379 PING

3. Check security group:
   aws ec2 describe-security-groups --group-ids sg-xxxxx

SOLUTIONS:
├── Start/restart ElastiCache: AWS Console
├── Update auth token: ElastiCache → Modify
├── Check REDIS_URL: Must include password if AUTH enabled
├── Update security group: Allow port 6379 from ECS security group
└── Check ioredis client config: password, username fields
```

### S3 Upload Failures

```
SYMPTOM: "Access Denied" or "NoSuchBucket" when uploading
CAUSES:
├── IAM role missing S3 permissions
├── Bucket policy blocking uploads
├── Encryption misconfiguration
├── Bucket name wrong

DIAGNOSIS:
1. Check IAM role permissions:
   aws iam get-role-policy --role-name ecsTaskRole --policy-name s3-access

2. Check bucket policy:
   aws s3api get-bucket-policy --bucket clubapp-dev-assets

3. Check bucket encryption:
   aws s3api get-bucket-encryption --bucket clubapp-dev-assets

SOLUTIONS:
├── Attach policy: ecs-task-policy includes s3:PutObject
├── Update bucket policy: Allow PutObject, GetObject for role
├── Check encryption: Ensure ServerSideEncryption: AES256
└── Verify bucket name: Check S3_ASSETS_BUCKET env var
```

### WebSocket Connection Issues

```
SYMPTOM: "WebSocket connection failed" or clients not receiving broadcasts
CAUSES:
├── ALB not configured for WebSocket (HTTP instead of WS)
├── CORS headers missing
├── Socket.io namespace misconfigured
├── Redis Pub/Sub not working

DIAGNOSIS:
1. Check ALB listener:
   aws elbv2 describe-listeners --load-balancer-arn <arn>

2. Check Socket.io logs:
   CloudWatch /ecs/clubapp-backend

3. Test WebSocket:
   wscat -c ws://api.desh.co/socket.io/?transport=websocket

SOLUTIONS:
├── Update ALB: Listener must forward to HTTP (not redirect to HTTPS for WS)
├── Add CORS headers: cors: { origin: "*", credentials: true }
├── Check Socket.io config: namespace setup correct
└── Test Redis Pub/Sub: Ensure Redis is connected
```

### JWT Token Issues

```
SYMPTOM: "Unauthorized" or "Invalid token" on authenticated routes
CAUSES:
├── Token expired (expiresIn: 24h)
├── Token malformed or corrupted
├── JWT_SECRET changed (old tokens now invalid)
├── Token tampered with

DIAGNOSIS:
1. Decode token: jwt.decode(token) at jwt.io
2. Check expiration: exp field in decoded token
3. Check secret: Ensure JWT_SECRET matches on backend

SOLUTIONS:
├── Get new token: POST /auth/refresh-token
├── Re-login: POST /auth/login (get new token)
├── Check JWT_SECRET: Ensure Secrets Manager has correct value
├── Sync clocks: Check server time (NTP sync)
└── Increase expiration: Change expiresIn if needed
```

### Performance Issues

```
SYMPTOM: "API slow" or "timeouts" or "high latency"
CAUSES:
├── Database slow queries
├── Missing database indexes
├── Cache misses (Redis down or misconfigured)
├── N+1 queries (loading related data inefficiently)
├── Large payload responses

DIAGNOSIS:
1. Check query performance:
   EXPLAIN ANALYZE SELECT * FROM orders WHERE venueId = 'v1';

2. Check Redis hit rate:
   CloudWatch metrics: CacheHits / (CacheHits + CacheMisses)

3. Check ECS CPU/Memory:
   CloudWatch metrics: CPUUtilization, MemoryUtilization

4. Check ALB response time:
   CloudWatch metrics: TargetResponseTime

SOLUTIONS:
├── Add indexes: Prisma schema @@index on frequently filtered fields
├── Implement caching: Use Redis for repeated queries
├── Optimize queries: Use select fields instead of *
├── Batch requests: Load related data efficiently with Prisma
├── Paginate responses: Limit data returned (e.g., 50 items per page)
├── Compress responses: Enable gzip on ALB
└── Scale up: Increase ECS task CPU/memory
```

---

## ADDITIONAL RESOURCES

### Important URLs

```
GitHub Repository: https://github.com/shafkat1/club
AWS Console: https://console.aws.amazon.com/
AWS Account ID: 425687053209

API Endpoints (after deployment):
├── API: https://api.desh.co (ALB)
├── Assets CDN: https://assets.desh.co (CloudFront)
├── Swagger Docs: https://api.desh.co/api/docs
└── Health Check: https://api.desh.co/health

Database Access:
├── RDS Endpoint: clubapp-dev-postgres.c1jtbcb1z2w1.us-east-1.rds.amazonaws.com:5432
├── Prisma Studio: http://localhost:5555 (dev only)
└── Credentials: AWS Secrets Manager

Local Development:
├── Backend: http://localhost:3000
├── Web: http://localhost:3000 (different port)
├── Mobile: Expo Go app
└── PostgreSQL: localhost:5432
└── Redis: localhost:6379
```

### Key Documentation Files

```
PROJECT DOCUMENTATION:
├── README.md - Project overview
├── DEPLOYMENT.md - Step-by-step deployment guide
├── AWS_SETUP_SUMMARY.md - AWS infrastructure details
├── AWS_CREDENTIALS_SETUP.md - Credential configuration
├── GITHUB_OIDC_SETUP.md - OIDC authentication setup
├── BACKEND_SETUP.md - Backend development guide
├── WEB_SETUP.md - Web frontend guide
├── MOBILE_SETUP.md - Mobile app guide
└── TESTING_GUIDE.md - Testing procedures

INFRASTRUCTURE:
├── infra/terraform/README.md - Terraform documentation
├── infra/terraform/variables.tf - IaC input variables
├── infra/terraform/outputs.tf - IaC outputs
└── infra/scripts/setup-github-oidc.sh - GitHub OIDC setup

DEPLOYMENT & POLICIES:
├── deployment-trust-policy.json - GitHub OIDC trust
├── deployment-policy.json - Deployment permissions
├── ecs-task-trust-policy.json - ECS task trust
├── github-actions-apprunner-policy.json - GitHub Actions policy
└── terraform-policy.json - Terraform execution policy
```

### Contact & Support

```
For Questions:
├── GitHub Issues: https://github.com/shafkat1/club/issues
├── Author: Shafkat (shafkat1 on GitHub)
├── Email: [project contact email if available]
└── Documentation: See this guide first!

Escalation Path:
1. Check documentation (this guide)
2. Check GitHub issues (existing solutions)
3. Check CloudWatch logs
4. Check Sentry errors
5. Contact team lead
6. Open GitHub issue (if new problem)
```

---

## CONCLUSION

This comprehensive guide covers the entire architecture, infrastructure, and deployment pipeline of the Club App project. All future LLM tasks should reference this document as the single source of truth for:

✅ **System Architecture** - How components interact
✅ **Infrastructure Setup** - AWS resources and configuration
✅ **Technology Stack** - All dependencies and versions
✅ **Deployment Process** - CI/CD pipeline and rollback procedures
✅ **Security** - Authentication, encryption, and access control
✅ **Monitoring** - Logging, metrics, and alerting
✅ **Development** - Local setup, coding standards, git workflows
✅ **Troubleshooting** - Common issues and solutions
✅ **Secret Management** - Credential locations and rotation

**For Future Development:**
1. Reference section numbers when discussing specific topics
2. Update version numbers when dependencies change
3. Add new AWS resources/services to the infrastructure section
4. Document new API endpoints in the Backend Architecture section
5. Update troubleshooting section with new common issues

**Last Updated:** October 30, 2025
**Maintained By:** Development Team
**Review Cycle:** Quarterly or when major changes occur
