# AWS INFRASTRUCTURE DEEP DIVE - CLUB APP

**Created:** October 30, 2025
**AWS Account ID:** 425687053209
**Region:** us-east-1 (N. Virginia)
**Project:** Club App - Map-First Drink Purchasing Platform

---

## QUICK REFERENCE

### AWS Account Credentials

```
Account ID: 425687053209
Account Alias: clubapp-dev
Root Email: [configured in AWS]
IAM Users: [configured in AWS]
MFA: Enabled on root account (recommended)
```

### Current Resource Status

```
✅ VPC: clubapp-dev-vpc (10.0.0.0/16)
✅ RDS: clubapp-dev-postgres (PostgreSQL 16.4, db.t4g.medium)
✅ ElastiCache: clubapp-dev-redis (Redis 7.1)
✅ S3 Buckets: 4 buckets (assets, receipts, logs, tfstate)
✅ ECS Cluster: clubapp-dev-ecs (Fargate)
✅ ALB: clubapp-dev-alb
✅ ECR Repository: clubapp-backend
✅ Route 53: desh.co hosted zone (pending domain transfer)
✅ CloudFront: Distribution for assets.desh.co
✅ Secrets Manager: Auto-rotating DB credentials
⏳ GitHub OIDC: Setup in progress
```

---

## AWS ACCOUNT SETUP CHECKLIST

### Initial Setup (One-time)

- [x] AWS Account created (425687053209)
- [x] Billing enabled and payment method configured
- [x] CloudTrail enabled for audit logging
- [x] AWS Config enabled for compliance tracking
- [x] GuardDuty enabled for threat detection
- [ ] AWS Organizations (if managing multiple accounts)
- [ ] AWS IAM Identity Center (for SSO)

### Network Setup

- [x] VPC created: clubapp-dev-vpc (10.0.0.0/16)
- [x] Public subnets (2): 10.0.1.0/24, 10.0.2.0/24
- [x] Private subnets (2): 10.0.10.0/24, 10.0.11.0/24
- [x] Internet Gateway attached
- [x] NAT Gateways created (1 per AZ)
- [x] Route tables configured (public & private)
- [ ] VPC Flow Logs enabled (for debugging)
- [ ] VPC Endpoints configured (S3, Secrets Manager, ECR, CloudWatch)

### Database Setup

- [x] RDS PostgreSQL 16.4 provisioned
- [x] Multi-AZ enabled
- [x] Automated backups (7-day retention)
- [x] KMS encryption enabled
- [x] Security group configured (port 5432)
- [x] Enhanced monitoring enabled
- [ ] Read replica created (for scaling reads)
- [ ] Parameter group tuned (if needed)

### Cache Setup

- [x] ElastiCache Redis 7.1 provisioned
- [x] Multi-AZ enabled
- [x] Automatic failover enabled
- [x] Encryption in-transit (TLS)
- [x] AUTH enabled (password protection)
- [x] Security group configured (port 6379)
- [ ] Cluster mode (optional, for scaling)

### Container & Orchestration Setup

- [x] ECR repository created: clubapp-backend
- [x] ECS Fargate cluster created: clubapp-dev-ecs
- [x] Task definition registered
- [x] ECS service created with ALB integration
- [x] Auto-scaling configured
- [ ] CloudWatch Container Insights enabled
- [ ] Service discovery configured (optional)

### Load Balancing & DNS

- [x] Application Load Balancer created
- [x] Target group configured (HTTP:3000)
- [x] Health checks configured (/health endpoint)
- [x] HTTPS listener (with ACM certificate)
- [x] HTTP → HTTPS redirect
- [x] Route 53 hosted zone created (desh.co)
- [ ] Domain transfer completed from GoDaddy

### Security & IAM

- [x] ECS Task Execution Role created
- [x] ECS Task Role created
- [x] GitHub OIDC Provider created
- [x] GitHub Deployment Role created
- [x] Terraform execution role created
- [x] Security groups configured (all)
- [ ] KMS keys created (if using custom keys)
- [ ] AWS Secrets Manager configured
- [ ] Certificate Manager (ACM) certificates issued

### Storage & Backup

- [x] S3 bucket for Terraform state (clubapp-dev-tfstate)
- [x] S3 bucket for assets (clubapp-dev-assets)
- [x] S3 bucket for receipts (clubapp-dev-receipts)
- [x] S3 bucket for logs (clubapp-dev-logs)
- [x] Versioning enabled on all buckets
- [x] Lifecycle policies configured
- [x] Encryption enabled on all buckets
- [ ] S3 replication configured (for disaster recovery)
- [ ] Glacier archive configured (for old receipts)

### Monitoring & Logging

- [x] CloudWatch Logs configured
- [x] CloudWatch Alarms created (CPU, Memory, Unhealthy hosts)
- [x] CloudWatch Dashboard created
- [x] Sentry integration configured
- [ ] AWS X-Ray enabled (optional, for tracing)
- [ ] AWS Lambda logs configured (for secrets rotation)

---

## DETAILED AWS RESOURCE CONFIGURATION

### 1. VPC Architecture

**VPC:** `clubapp-dev-vpc`
- CIDR: `10.0.0.0/16`
- Enable DNS Hostnames: Yes
- Enable DNS Resolution: Yes
- Enable NAT Gateway: Yes (1 per AZ for HA)
- Availability Zones: us-east-1a, us-east-1b

**Public Subnets:**

| Subnet | CIDR | AZ | IGW | NAT |
|--------|------|-----|-----|-----|
| pub-a | 10.0.1.0/24 | us-east-1a | ✅ | NAT-a |
| pub-b | 10.0.2.0/24 | us-east-1b | ✅ | NAT-b |

**Private Subnets:**

| Subnet | CIDR | AZ | Route via NAT |
|--------|------|-----|---------------|
| priv-a | 10.0.10.0/24 | us-east-1a | NAT-a (us-east-1a) |
| priv-b | 10.0.11.0/24 | us-east-1b | NAT-b (us-east-1b) |

**Route Tables:**

```
Public Route Table:
├── 10.0.0.0/16 → Local
└── 0.0.0.0/0 → Internet Gateway

Private Route Table (us-east-1a):
├── 10.0.0.0/16 → Local
└── 0.0.0.0/0 → NAT Gateway (us-east-1a)

Private Route Table (us-east-1b):
├── 10.0.0.0/16 → Local
└── 0.0.0.0/0 → NAT Gateway (us-east-1b)
```

### 2. RDS PostgreSQL Configuration

```
Identifier: clubapp-dev-postgres
Engine: PostgreSQL
Version: 16.4
Instance Class: db.t4g.medium
  - vCPU: 2
  - Memory: 4 GB
  - Storage: GP3 (General Purpose)
  - IOPS: 3000 (default)
  - Throughput: 125 MB/s

Storage Configuration:
├── Allocated Storage: 100 GB
├── Max Allocated Storage: 512 GB (auto-scaling enabled)
├── Storage Type: gp3
├── Encrypted: Yes (KMS key: arn:aws:kms:us-east-1:...)
└── Backup Retention: 7 days

Availability:
├── Multi-AZ: Yes (automatic failover to standby)
├── Standby Replica: In us-east-1b
├── Backup Window: 03:00-04:00 UTC
└── Maintenance Window: sun:04:00-05:00 UTC

Security:
├── Public Accessibility: No
├── Security Group: clubapp-dev-rds-sg
│   └── Inbound: Port 5432 from ECS security group only
├── VPC: clubapp-dev-vpc
├── DB Subnet Group: clubapp-dev-rds-subnets
│   └── Subnets: priv-a, priv-b
└── IAM Database Authentication: Disabled (uses password)

Database:
├── DB Name: postgres
├── Master Username: app
├── Master Password: [auto-generated + rotated]
├── Character Set: UTF8
└── Port: 5432

Monitoring:
├── Enhanced Monitoring: Yes (1-minute granularity)
├── Performance Insights: Yes (7-day retention)
├── CloudWatch Logs: Yes (error, general, slowquery)
└── Backup Monitoring: Automated

Parameters:
├── log_statement: 'none' (disable for performance)
├── max_connections: auto
├── shared_buffers: {DBInstanceClassMemory/4}
└── effective_cache_size: {DBInstanceClassMemory*3/4}
```

**Access Credentials:**

```
Stored in: AWS Secrets Manager
Secret Name: clubapp/dev/rds
Secret JSON:
{
  "host": "clubapp-dev-postgres.c1jtbcb1z2w1.us-east-1.rds.amazonaws.com",
  "port": 5432,
  "username": "app",
  "password": "<auto-rotated-256-bit>",
  "dbname": "postgres",
  "engine": "postgresql"
}

Rotation:
├── Enabled: Yes
├── Rotation Rules:
│   ├── Automatically: Every 30 days
│   ├── Duration: 3 hours (window)
│   ├── Days since last rotation: 30
│   └── Lambda Function: aws-secretsmanager-[random-uuid]
└── Rotation Status: SUCCESS
```

### 3. ElastiCache Redis Configuration

```
Cluster Identifier: clubapp-dev-redis
Engine: Redis
Version: 7.1
Node Type: cache.t4g.micro
  - vCPU: 1
  - Memory: 1 GB
  - Network: Up to 5 Gigabit

Cluster Mode: Disabled (single primary + replica)
Number of Cache Nodes: 2
  - Primary: In us-east-1a
  - Replica: In us-east-1b

Automatic Failover: Enabled
Multi-AZ: Enabled
Subnet Group: clubapp-dev-redis-subnet-group
  └── Subnets: priv-a, priv-b

Security:
├── Security Group: clubapp-dev-redis-sg
│   └── Inbound: Port 6379 from ECS security group only
├── VPC: clubapp-dev-vpc
├── In-transit Encryption: Enabled (TLS)
├── At-rest Encryption: Enabled (KMS)
├── AUTH: Enabled
│   └── Auth Token: [generated and stored in Secrets Manager]
└── Automatic Backup: Enabled (daily)

Snapshots:
├── Automatic Snapshots: Yes
├── Retention Period: 5 days
├── Backup Window: 03:00-05:00 UTC
└── Snapshot to S3: Enabled

Maintenance:
├── Maintenance Window: sun:05:00-07:00 UTC
├── Auto-upgrade: Yes
└── Notification Topic: [SNS topic for alerts]

Monitoring:
├── Enhanced Monitoring: Yes (1-minute granularity)
├── CloudWatch Metrics:
│   ├── CPUUtilization
│   ├── NetworkBytesIn/Out
│   ├── CurrItems
│   ├── Evictions
│   ├── EngineCPUUtilization
│   └── BytesReadIntoMemcached
└── Event Subscriptions: Enabled
```

**Access Details:**

```
Primary Endpoint: clubapp-dev-redis.c1jtbcb1z2w1.ng.0001.use1.cache.amazonaws.com:6379
Replica Endpoint: clubapp-dev-redis-replica.c1jtbcb1z2w1.ng.0002.use1.cache.amazonaws.com:6379
Reader Endpoint: clubapp-dev-redis.c1jtbcb1z2w1.ng.0001.use1.cache.amazonaws.com:6379

Connection Method:
REDIS_URL=redis://:[AUTH_TOKEN]@clubapp-dev-redis.c1jtbcb1z2w1.ng.0001.use1.cache.amazonaws.com:6379?tls=true
```

### 4. S3 Buckets Configuration

**Bucket 1: clubapp-dev-assets**
```
Purpose: User profile images, venue photos, QR codes
Region: us-east-1
Access Control:
├── Block Public Access: ✅ All enabled
├── Bucket Policy: Restrict to CloudFront OAI
├── CORS: Enabled for CloudFront
└── Versioning: Enabled

Encryption:
├── Method: Server-Side Encryption (AES-256)
├── KMS Key: aws/s3 (default)
└── Bucket Default: Enabled (enforced)

Lifecycle Policy:
├── 90 days → Amazon S3 Glacier
├── 180 days → Deep Archive
└── 7 years → Expiration

Tags:
├── Environment: dev
├── Project: clubapp
├── Purpose: assets
└── CostCenter: engineering

Monitoring:
├── Access Logging: Enabled
└── CloudTrail: Enabled
```

**Bucket 2: clubapp-dev-receipts**
```
Purpose: Order receipts, payment proofs, invoices
Region: us-east-1
Access Control:
├── Block Public Access: ✅ All enabled
├── Bucket Policy: Private (ECS tasks only)
└── Versioning: Enabled

Retention:
├── Default Retention: None
├── Object Lock: Disabled
└── Lifecycle: 1 year → Archive, 7 years → Delete

Encryption: Server-Side Encryption (AES-256)
Tags:
├── Environment: dev
├── Project: clubapp
├── Purpose: receipts
├── Compliance: financial
└── Retention: 7years
```

**Bucket 3: clubapp-dev-logs**
```
Purpose: Application logs, CloudWatch logs export
Region: us-east-1
Access Control:
├── Block Public Access: ✅ All enabled
├── Versioning: Disabled (not needed for logs)
└── Lifecycle:
    ├── 7 days → Glacier
    ├── 30 days → Delete

Encryption: Server-Side Encryption (AES-256)
Tags:
├── Environment: dev
├── Project: clubapp
├── Purpose: logs
└── Retention: 30days
```

**Bucket 4: clubapp-dev-tfstate**
```
Purpose: Terraform state storage
Region: us-east-1
Access Control:
├── Block Public Access: ✅ All enabled
├── Bucket Policy: Restrict to GitHub Actions role
├── Versioning: Enabled (essential for state recovery)
├── MFA Delete: Disabled (not required)
└── Object Lock: Disabled

Encryption:
├── Method: Server-Side Encryption (AES-256)
└── KMS Key: aws/s3 (default)

State Locking:
├── DynamoDB Table: clubapp-dev-tfstate-lock
├── Key: LockID (String)
├── TTL: Disabled (manual unlock only)
└── Billing: PAY_PER_REQUEST

Access Logging: Enabled (track state modifications)

Recommended Practices:
├── Enable versioning (auto-rollback capability)
├── Enable bucket encryption
├── Enable access logging
├── Restrict public access
├── Use IAM policies for access control
├── Use state file locking (DynamoDB)
└── Regularly backup state files
```

### 5. ECS Fargate Configuration

**Cluster: clubapp-dev-ecs**

```
Cluster Name: clubapp-dev-ecs
Capacity Providers: FARGATE, FARGATE_SPOT
Default Capacity Provider: FARGATE

Cluster Settings:
├── Container Insights: Disabled (can enable for metrics)
├── CloudWatch Container Insights: [Link to dashboard]
└── Named Capacity Providers: FARGATE (recommended for production)

IAM Roles:
├── Cluster Role: (optional, not needed for Fargate)
└── Service Linked Role: AWSServiceRoleForECS (auto-created)
```

**Task Definition: clubapp-backend-task**

```
Family: clubapp-backend-task
Revision: 1 (auto-incremented on updates)
Network Mode: awsvpc (required for Fargate)
Requires Compatibilities: FARGATE

Compute Resources:
├── CPU: 1024 (1 vCPU)
├── Memory: 2048 MB (2 GB)
└── Supported Configurations: Valid combination

Container Definition: web
├── Name: web
├── Image: 425687053209.dkr.ecr.us-east-1.amazonaws.com/clubapp-backend:latest
├── Image Pull Policy: Always (for latest tag)
│
├── Port Configuration:
│   └── Container Port 3000
│       ├── Protocol: tcp
│       ├── Host Port: 3000
│       └── Host IP: 0.0.0.0
│
├── Environment Variables (non-sensitive):
│   ├── NODE_ENV: production
│   ├── LOG_LEVEL: info
│   ├── PORT: 3000
│   ├── S3_ASSETS_BUCKET: clubapp-dev-assets
│   ├── S3_RECEIPTS_BUCKET: clubapp-dev-receipts
│   └── S3_REGION: us-east-1
│
├── Secrets (from Secrets Manager):
│   ├── DATABASE_URL: arn:aws:secretsmanager:us-east-1:425687053209:secret:clubapp/dev/rds-xxxxx
│   ├── REDIS_URL: arn:aws:secretsmanager:us-east-1:425687053209:secret:clubapp/dev/redis-xxxxx
│   ├── JWT_SECRET: arn:aws:secretsmanager:us-east-1:425687053209:secret:clubapp/dev/jwt-secret-xxxxx
│   ├── STRIPE_SECRET_KEY: arn:aws:secretsmanager:us-east-1:425687053209:secret:clubapp/dev/stripe-xxxxx
│   ├── SENDGRID_API_KEY: arn:aws:secretsmanager:us-east-1:425687053209:secret:clubapp/dev/sendgrid-xxxxx
│   ├── SENTRY_DSN: arn:aws:secretsmanager:us-east-1:425687053209:secret:clubapp/dev/sentry-xxxxx
│   └── [other secrets]
│
├── Logging:
│   ├── Log Driver: awslogs
│   ├── Log Group: /ecs/clubapp-backend
│   ├── Log Stream Prefix: ecs
│   ├── Region: us-east-1
│   └── Options:
│       ├── awslogs-group: /ecs/clubapp-backend
│       ├── awslogs-region: us-east-1
│       ├── awslogs-stream-prefix: ecs
│       └── awslogs-datetime-format: [%Y-%m-%d %H:%M:%S]
│
├── Health Check:
│   ├── Command: CMD-SHELL "curl -f http://localhost:3000/health || exit 1"
│   ├── Interval: 30 seconds
│   ├── Timeout: 5 seconds
│   ├── Retries: 3
│   └── Start Period: 60 seconds
│
├── Essential: true (restart container if fails)
└── Resource Requirements:
    ├── CPU Units: 1024
    ├── Memory: 2048 MB
    └── GPU: 0
```

**Execution Role: ecsTaskExecutionRole**

```
Role Name: ecsTaskExecutionRole
Trust Relationship: ecs-tasks.amazonaws.com

Permissions:
├── AmazonECSTaskExecutionRolePolicy (AWS managed)
│   ├── ecr:GetAuthorizationToken
│   ├── logs:CreateLogGroup
│   ├── logs:CreateLogStream
│   ├── logs:PutLogEvents
│   └── ecr:BatchGetImage, ecr:GetDownloadUrlForLayer
│
└── Inline Policy: SecretsManagerAccess
    ├── secretsmanager:GetSecretValue
    ├── secretsmanager:DescribeSecret
    ├── kms:Decrypt
    └── Resource: arn:aws:secretsmanager:us-east-1:425687053209:secret:clubapp/dev/*
```

**Task Role: ecsTaskRole**

```
Role Name: ecsTaskRole
Trust Relationship: ecs-tasks.amazonaws.com

Permissions:
├── S3 Access:
│   ├── s3:GetObject
│   ├── s3:PutObject
│   ├── s3:DeleteObject
│   └── Resource: arn:aws:s3:::clubapp-dev-*/*
│
├── Secrets Manager:
│   ├── secretsmanager:GetSecretValue
│   └── Resource: arn:aws:secretsmanager:us-east-1:425687053209:secret:clubapp/dev/*
│
├── DynamoDB:
│   ├── dynamodb:Query
│   ├── dynamodb:Scan
│   ├── dynamodb:GetItem
│   ├── dynamodb:PutItem
│   ├── dynamodb:UpdateItem
│   ├── dynamodb:DeleteItem
│   └── Resource: arn:aws:dynamodb:us-east-1:425687053209:table/clubapp-dev-*
│
├── RDS (read-only):
│   ├── rds:DescribeDBInstances
│   ├── rds:DescribeDBClusters
│   └── Resource: arn:aws:rds:us-east-1:425687053209:db/clubapp-dev-postgres
│
├── KMS Decryption:
│   ├── kms:Decrypt
│   ├── kms:DescribeKey
│   └── Resource: arn:aws:kms:us-east-1:425687053209:key/*
│
└── SNS (for notifications):
    ├── sns:Publish
    └── Resource: arn:aws:sns:us-east-1:425687053209:clubapp-dev-*
```

**ECS Service: clubapp-dev-svc**

```
Service Name: clubapp-dev-svc
Cluster: clubapp-dev-ecs
Launch Type: FARGATE
Platform Version: LATEST

Deployment:
├── Task Definition: clubapp-backend-task:latest
├── Desired Count: 1
├── Minimum Healthy Percent: 100% (for rolling updates)
├── Maximum Percent: 200%
├── Deployment Configuration: Rolling update
└── Grace Period: 60 seconds (for health checks)

Load Balancing:
├── Load Balancer: clubapp-dev-alb
├── Target Group: clubapp-dev-tg
├── Container Name: web
├── Container Port: 3000
├── Health Check Path: /health
└── Load Balancer Port: 443 (HTTPS via ALB)

Networking:
├── VPC: clubapp-dev-vpc
├── Subnets: priv-a (10.0.10.0/24), priv-b (10.0.11.0/24)
├── Security Groups: clubapp-dev-ecs-sg
│   └── Inbound: Port 3000 from ALB security group
├── Assign Public IP: DISABLED (no direct internet access)
└── ENI Count: 1 per task

Auto Scaling:
├── Min Capacity: 1 task
├── Max Capacity: 4 tasks
├── Target CPU: 70%
├── Target Memory: 75%
├── Scale-up Cooldown: 60 seconds
├── Scale-down Cooldown: 300 seconds
└── Metrics: ECS:CPUUtilization, ECS:MemoryUtilization

Placement Constraints: None (spread across AZs)

Tags:
├── Environment: dev
├── Project: clubapp
└── Purpose: backend-api
```

### 6. Application Load Balancer Configuration

**Load Balancer: clubapp-dev-alb**

```
Name: clubapp-dev-alb
Scheme: Internet-facing
Type: Application Load Balancer
IP Address Type: ipv4
VPC: clubapp-dev-vpc
Subnets: pub-a (10.0.1.0/24), pub-b (10.0.2.0/24) [public subnets]
Security Groups: clubapp-dev-alb-sg

Listeners:
├── Port 80 (HTTP)
│   ├── Protocol: HTTP
│   ├── Forward to Target Group: No
│   └── Default Action: Redirect to HTTPS (443)
│
└── Port 443 (HTTPS)
    ├── Protocol: HTTPS
    ├── SSL Certificate: ACM certificate (api.desh.co)
    ├── Security Policy: ELBSecurityPolicy-TLS-1-2-2017-01
    └── Forward to Target Group: clubapp-dev-tg
```

**Target Group: clubapp-dev-tg**

```
Name: clubapp-dev-tg
Protocol: HTTP
Port: 3000
VPC: clubapp-dev-vpc
Target Type: IP (for Fargate tasks)

Health Check Configuration:
├── Protocol: HTTP
├── Path: /health
├── Port: traffic port (3000)
├── Matcher: 200
├── Interval: 30 seconds
├── Timeout: 5 seconds
├── Healthy Threshold: 2 consecutive successes
├── Unhealthy Threshold: 3 consecutive failures
└── Deregistration Delay: 30 seconds

Load Balancing Algorithm: Round robin
Stickiness: Disabled (optional: enable for sessions)

Attributes:
├── deregistration_delay.timeout_seconds: 30
├── deregistration_delay.connection_termination.enabled: false
├── preserve_client_ip.enabled: false
├── proxy_protocol_v2.enabled: false
├── slow_start.duration_seconds: 0
└── load_balancing.cross_zone.enabled: true
```

**Security Group: clubapp-dev-alb-sg**

```
Inbound Rules:
├── HTTP (80) from 0.0.0.0/0
│   └── Purpose: Redirect to HTTPS
├── HTTPS (443) from 0.0.0.0/0
│   └── Purpose: Accept HTTPS traffic
└── No other inbound rules

Outbound Rules:
└── All traffic allowed (default)

Source/Destination CIDRs:
├── 0.0.0.0/0 (anywhere on internet)
└── No IP whitelist (open to all)
```

**Security Group: clubapp-dev-ecs-sg**

```
Inbound Rules:
└── Port 3000 (TCP) from clubapp-dev-alb-sg security group
    └── Purpose: Allow ALB to forward traffic to ECS tasks

Outbound Rules:
├── Port 5432 (TCP) to clubapp-dev-rds-sg
│   └── Purpose: RDS PostgreSQL connection
├── Port 6379 (TCP) to clubapp-dev-redis-sg
│   └── Purpose: ElastiCache Redis connection
├── Port 443 (TCP) to 0.0.0.0/0
│   └── Purpose: HTTPS for external APIs (Stripe, SendGrid, etc.)
├── Port 53 (UDP) to 0.0.0.0/0
│   └── Purpose: DNS queries
└── No direct internet access (via NAT gateway)
```

### 7. Container Registry (ECR)

**Repository: clubapp-backend**

```
URI: 425687053209.dkr.ecr.us-east-1.amazonaws.com/clubapp-backend
Region: us-east-1

Image Tagging:
├── latest (always points to most recent build)
├── ${GIT_SHA} (immutable commit hash)
└── v1.0.0 (semantic versioning tags)

Image Scanning:
├── Scan on Push: Enabled
├── Vulnerability Scan Results: Link to Amazon Inspector
└── Remediation: Manual (review and rebuild)

Lifecycle Policy:
├── Keep latest 10 images
├── Delete untagged images after 7 days
└── Prune old images:
    {
      "rules": [
        {
          "rulePriority": 1,
          "description": "Keep last 10 images",
          "selection": {
            "tagStatus": "any",
            "countType": "imageCountMoreThan",
            "countNumber": 10
          },
          "action": {
            "type": "expire"
          }
        }
      ]
    }

Registry Permissions:
├── Push: GitHub Actions (via OIDC role)
├── Pull: ECS tasks (via execution role)
└── Delete: Terraform/manual cleanup only
```

---

## AWS SERVICE INTERCONNECTIONS

### Data Flow Diagram

```
User Requests
    ↓
Route 53 (DNS)
    ↓
CloudFront (CDN) [for /assets/*]  →  S3 (Bucket)
    ↓
ALB (Application Load Balancer)
    ├─→ Port 80 (HTTP)  → Redirect to 443
    └─→ Port 443 (HTTPS) → Forward to Target Group
         ↓
    ECS Fargate Task (NestJS Backend)
         ├─→ PostgreSQL RDS [Database]
         ├─→ ElastiCache Redis [Cache & Sessions]
         ├─→ S3 [File uploads & receipts]
         ├─→ DynamoDB [Presence counts]
         ├─→ Secrets Manager [DB credentials]
         ├─→ SNS [Notifications]
         ├─→ SES [Email]
         ├─→ Stripe API [Payments]
         └─→ CloudWatch Logs [Logging]
```

### Secret Flow

```
Deployment Time:
1. GitHub Actions triggered (on push to main)
2. Assume GitHub OIDC role (github-oidc-deployment-role)
3. Build Docker image
4. Push to ECR
5. Update ECS task definition
6. Update ECS service (force new deployment)

Runtime:
1. ECS Fargate task starts
2. Task assumes ecsTaskExecutionRole
3. Execution role retrieves secrets from Secrets Manager
4. Secrets passed as environment variables to container
5. NestJS application uses secrets to connect to services

Rotation (Database Credentials):
1. Secrets Manager Lambda triggers (every 30 days)
2. Lambda generates new temporary credentials
3. Credentials tested with RDS
4. Old credentials invalidated
5. All running tasks continue with old credentials (grace period)
6. New deployments use new credentials
7. Audit trail in CloudTrail
```

---

## COST OPTIMIZATION STRATEGIES

### Current Estimated Monthly Costs

```
Service | Estimated Cost | Notes
--------|----------------|-------
RDS Multi-AZ | $80-100 | db.t4g.medium with 100GB storage
ElastiCache | $30-40 | cache.t4g.micro with 2 nodes
S3 Storage | $5-10 | < 100GB of storage
S3 Requests | $1-2 | Low request volume
ECS Fargate | $20-30 | 1 task @ 1vCPU, 2GB memory
ALB | $15-20 | Minimal request count
CloudFront | $1-5 | Low bandwidth from assets
Route 53 | $0.50 | Minimal queries
Secrets Manager | $0.40 | Single secret
CloudWatch | $5-10 | Logs and metrics
NAT Gateway | $30-40 | 2 NAT gateways (1 per AZ)
────────────────────────────────
TOTAL | ~$190-260 | Rough estimate
```

### Cost Reduction Opportunities

```
HIGH IMPACT (40-50% savings):
├── Switch RDS to Single-AZ for dev environment
│   └── Saves: $40/month (but loses HA)
├── Use RDS Reserved Instances (1-year)
│   └── Saves: 30-50% on compute
├── Use RDS database proxy (connection pooling)
│   └── Cost: Minimal, but improves efficiency
└── Switch to t3 instances instead of t4g
    └── Saves: ~10-15%

MEDIUM IMPACT (10-20% savings):
├── Enable S3 Intelligent Tiering
│   └── Auto-archives old files
├── Use VPC Endpoints instead of NAT
│   └── Saves: $30+ on NAT gateway costs
├── Consolidate log retention (30→7 days)
│   └── Saves: $2-5/month
└── Use Spot Instances for ECS tasks
    └── Saves: 60-70% but less reliable

LOW IMPACT (< 5% savings):
├── Reduce CloudWatch metrics granularity
├── Archive old CloudWatch logs to Glacier
├── Optimize S3 bucket structure
└── Use lifecycle policies more aggressively
```

---

## DISASTER RECOVERY & BACKUP STRATEGY

### Backup Configuration

```
RDS Backups:
├── Automated: Daily (7-day retention)
├── Manual: Before major changes
├── Backup Type: Full + incremental
├── Point-in-time Recovery: Yes (last 7 days)
├── Backup Encryption: Yes (KMS)
└── Backup Location: AWS managed (cross-region capable)

S3 Backups:
├── Versioning: Enabled
├── MFA Delete: Not enabled (risks data loss)
├── Cross-region Replication: Optional (not configured)
├── Lifecycle: Archive old versions to Glacier
└── Backup: Manual export via AWS CLI

ElastiCache Backups:
├── Snapshots: Manual + scheduled daily
├── Snapshot Retention: 5 days
├── Snapshot Location: S3
└── Point-in-time: Via replication

DynamoDB Backups:
├── Point-in-time Recovery: Enabled (35-day window)
├── On-demand Backups: Manual as needed
└── Backup Encryption: Yes (KMS)
```

### Recovery Procedures

```
RDS Failure (Automatic):
├── Detection: < 5 minutes
├── Failover: Automatic to standby replica
├── Downtime: < 2 minutes
└── Manual Intervention: None required

RDS Failure (Full loss):
├── Detection: Manual alert
├── Recovery: Restore from backup
├── Time to Restore: 10-30 minutes
├── Data Loss: Up to 24 hours (last backup)
└── Procedure:
    1. Create new RDS instance from backup
    2. Update DNS (Secrets Manager)
    3. Verify application connectivity
    4. Test data integrity
    5. Route traffic back

S3 Failure:
├── Cause: Accidental deletion/modification
├── Recovery: Restore from version history
├── Time: < 5 minutes (point-in-time)
└── Procedure:
    1. Identify last good version
    2. Copy objects from version history
    3. Verify restoration
    4. Update CloudFront cache

ElastiCache Failure (Automatic):
├── Detection: < 5 minutes
├── Failover: Automatic to replica
├── Downtime: < 1 minute
├── Data Loss: None (data replicated)
└── Manual Intervention: None required
```

---

## SECURITY AUDIT CHECKLIST

- [ ] All VPC security groups reviewed (principle of least privilege)
- [ ] IAM policies reviewed (no wildcards except necessary)
- [ ] S3 bucket policies reviewed (no public access)
- [ ] Secrets Manager secrets reviewed (encrypted at rest)
- [ ] Database encryption verified (KMS enabled)
- [ ] Transport encryption verified (HTTPS/TLS)
- [ ] CloudTrail enabled for audit logging
- [ ] VPC Flow Logs enabled for network analysis
- [ ] MFA enabled on AWS root account
- [ ] IAM password policy enforced
- [ ] Unused IAM access keys deleted
- [ ] Cross-account access reviewed (if applicable)
- [ ] Resource-based policies reviewed
- [ ] AWS Config compliance rules enabled
- [ ] GuardDuty threat detection enabled
- [ ] Security groups reviewed for open ports
- [ ] Backup encryption verified
- [ ] Application logging reviewed (no sensitive data)
- [ ] Third-party API credentials in Secrets Manager
- [ ] Rate limiting configured on ALB/WAF

---

## MONITORING & ALERTING SETUP

### CloudWatch Alarms

```yaml
Alarms:
  - Name: ECS-High-CPU
    Metric: CPUUtilization
    Threshold: 80%
    Duration: 5 minutes
    Action: SNS + Auto-scale

  - Name: ALB-Unhealthy-Targets
    Metric: UnhealthyHostCount
    Threshold: > 0
    Duration: 2 minutes
    Action: SNS + PagerDuty

  - Name: RDS-Low-Storage
    Metric: FreeStorageSpace
    Threshold: < 10%
    Duration: 10 minutes
    Action: SNS

  - Name: Redis-High-Eviction
    Metric: Evictions
    Threshold: > 0
    Duration: 5 minutes
    Action: SNS + Investigate

  - Name: ALB-HTTP-5XX-Errors
    Metric: HTTPCode_Target_5XX
    Threshold: > 10 in 5 min
    Action: SNS + PagerDuty
```

### Dashboard Configuration

```
Dashboard: clubapp-dev-overview
├── ECS Metrics:
│   ├── Running Tasks vs Desired
│   ├── CPU Utilization
│   ├── Memory Utilization
│   └── Failed Deployments
├── RDS Metrics:
│   ├── Database Connections
│   ├── Query Performance
│   ├── Storage Utilization
│   └── Replica Lag
├── ALB Metrics:
│   ├── Request Count
│   ├── Healthy/Unhealthy Hosts
│   ├── Response Time
│   └── HTTP Status Codes
├── ElastiCache Metrics:
│   ├── Cache Hit Rate
│   ├── Evictions
│   ├── CPU Utilization
│   └── Memory Utilization
└── Application Metrics:
   ├── Error Rate
   ├── API Response Time
   └── Active Connections
```

---

## REFERENCES & USEFUL COMMANDS

### AWS CLI Commands

```bash
# List all VPCs
aws ec2 describe-vpcs

# Describe RDS instance
aws rds describe-db-instances --db-instance-identifier clubapp-dev-postgres

# Describe ElastiCache cluster
aws elasticache describe-cache-clusters --cache-cluster-id clubapp-dev-redis

# Describe ECS service
aws ecs describe-services --cluster clubapp-dev-ecs --services clubapp-dev-svc

# Get task logs
aws logs tail /ecs/clubapp-backend --follow

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 425687053209.dkr.ecr.us-east-1.amazonaws.com

# Retrieve secret
aws secretsmanager get-secret-value --secret-id clubapp/dev/rds

# List all S3 buckets
aws s3 ls

# Describe ALB
aws elbv2 describe-load-balancers --names clubapp-dev-alb

# Get Route 53 records
aws route53 list-resource-record-sets --hosted-zone-id /hostedzone/Z...
```

### AWS Management Console Shortcuts

```
Dashboard: https://console.aws.amazon.com/console/home?region=us-east-1
RDS: https://console.aws.amazon.com/rds/home?region=us-east-1
ECS: https://console.aws.amazon.com/ecs/v2/clusters
ECR: https://console.aws.amazon.com/ecr/repositories
ElastiCache: https://console.aws.amazon.com/elasticache/home?region=us-east-1
S3: https://s3.console.aws.amazon.com/s3/home
Route 53: https://console.aws.amazon.com/route53/home
Secrets Manager: https://console.aws.amazon.com/secretsmanager/home?region=us-east-1
CloudWatch: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1
CloudTrail: https://console.aws.amazon.com/cloudtrail/home?region=us-east-1
```

---

## EMERGENCY PROCEDURES

### Service Down - Quick Diagnosis

```
1. Check AWS Health Dashboard (personal health dashboard)
   - Any known AWS incidents?

2. Check ECS Service Status
   aws ecs describe-services --cluster clubapp-dev-ecs --services clubapp-dev-svc
   - Desired count matches running count?
   - Any deployment errors?

3. Check CloudWatch Logs
   aws logs tail /ecs/clubapp-backend --follow
   - Application error messages?
   - Connection errors?

4. Check CloudWatch Alarms
   - CPU/Memory overutilization?
   - Unhealthy targets?
   - RDS/Redis issues?

5. Check Security Groups
   - ECS security group allows inbound from ALB on port 3000?
   - ALB security group allows inbound from 0.0.0.0/0 on 80, 443?

6. Check RDS/Redis Connectivity
   - Database accepting connections?
   - Credentials correct?
   - Network ACLs/security groups?

7. Manual Service Restart
   aws ecs update-service \
     --cluster clubapp-dev-ecs \
     --service clubapp-dev-svc \
     --force-new-deployment
```

---

**Maintained By:** Development Team  
**Last Review:** October 30, 2025  
**Next Review:** Quarterly or after major changes
