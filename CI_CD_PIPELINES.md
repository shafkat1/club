# CI/CD PIPELINES - Club App

**Updated:** October 30, 2025  
**Status:** ✅ All pipelines configured and operational  
**AWS Account:** 425687053209 (us-east-1)

---

## TABLE OF CONTENTS

1. [Overview](#overview)
2. [Frontend Deployment Pipeline](#frontend-deployment-pipeline)
3. [Backend Deployment Pipeline](#backend-deployment-pipeline)
4. [Infrastructure (Terraform) Pipeline](#infrastructure-terraform-pipeline)
5. [GitHub Secrets & Variables](#github-secrets--variables)
6. [Deployment Status Dashboard](#deployment-status-dashboard)
7. [Troubleshooting](#troubleshooting)

---

## OVERVIEW

### Pipeline Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Developer Pushes Code to Main Branch                    │
└──────────────────┬──────────────────────────────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
        ↓          ↓          ↓
   ┌────────┐  ┌────────┐  ┌──────────┐
   │Frontend│  │Backend │  │Terraform │
   │Pipeline│  │Pipeline│  │Pipeline  │
   └────────┘  └────────┘  └──────────┘
        │          │          │
        ↓          ↓          ↓
    S3 + CF    ECR + ECS   AWS Resources
```

### Triggering Conditions

| Pipeline | Trigger | Paths |
|----------|---------|-------|
| **Frontend** | Push to main | `web/**`, `.github/workflows/web-deploy.yml` |
| **Backend** | Push to main | `backend/**`, `.github/workflows/deploy-backend.yml` |
| **Terraform** | Push/PR to main | `infra/terraform/**`, `.github/workflows/terraform.yml` |
| **Mobile** | Manual / Scheduled | `mobile/**` |

---

## FRONTEND DEPLOYMENT PIPELINE

### File Location
`.github/workflows/web-deploy.yml`

### Trigger
```yaml
on:
  push:
    branches: [main]
    paths:
      - 'web/**'
      - '.github/workflows/web-deploy.yml'
  workflow_dispatch:  # Manual trigger
```

### Deployment Flow

```
1. Checkout Code (v4)
   ↓
2. Setup Node.js 18 + npm cache
   ↓
3. Install Dependencies (--legacy-peer-deps)
   ↓
4. Build Next.js App
   ├─ Exports to static files (out/)
   └─ Sets NEXT_PUBLIC_API_URL
   ↓
5. Assume AWS IAM Role (OIDC)
   └─ Role: github-actions-apprunner
   ↓
6. Upload to S3
   ├─ Static assets: max-age=1 year (immutable)
   ├─ HTML files: no-cache, must-revalidate
   └─ Bucket: clubapp-dev-assets/web/
   ↓
7. Invalidate CloudFront
   └─ Distribution: ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }}
   ↓
8. Upload Coverage Reports (if available)
   └─ S3: clubapp-dev-assets/coverage/web/
```

### Environment Variables

```yaml
AWS_REGION: us-east-1
S3_BUCKET: clubapp-dev-assets
AWS_ROLE_TO_ASSUME: arn:aws:iam::425687053209:role/github-actions-apprunner
NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
CLOUDFRONT_DISTRIBUTION_ID: ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }}
```

### GitHub Secrets Required

```
NEXT_PUBLIC_API_URL = https://api.desh.co/api
CLOUDFRONT_DISTRIBUTION_ID = E1234ABCD5678 (from AWS CloudFront)
```

### Build Command

```bash
npm install --legacy-peer-deps
npm run build:export
# Outputs to: web/out/
```

### NEW: Frontend Changes Integration

The frontend now includes:

✅ **Direct NestJS API Integration**
- `/web/utils/api-client.ts` - Direct API calls
- No Supabase code
- Automatic token refresh

✅ **Environment Configuration**
- Uses `NEXT_PUBLIC_API_URL` from secrets
- Defaults to `http://localhost:3000` for local dev
- Production: `https://api.desh.co/api`

✅ **Build Output**
- Static HTML/CSS/JS
- Next.js export format
- Cloudflare Workers compatible

### Deployment Success Output

```
✅ Web portal deployed successfully!
S3 Bucket: clubapp-dev-assets
Distribution: E1234ABCD5678 (CloudFront ID)
URL: https://assets.desh.co/web/
```

---

## BACKEND DEPLOYMENT PIPELINE

### File Location
`.github/workflows/deploy-backend.yml`

### Trigger
```yaml
on:
  push:
    branches: [main]
    paths:
      - 'backend/**'
      - '.github/workflows/deploy-backend.yml'
  workflow_dispatch:  # Manual trigger
```

### Deployment Flow

```
1. Checkout Code
   ↓
2. Assume AWS IAM Role (OIDC)
   └─ Role: github-actions-apprunner
   ↓
3. Login to Amazon ECR
   └─ Registry: 425687053209.dkr.ecr.us-east-1.amazonaws.com
   ↓
4. Build Docker Image
   ├─ Dockerfile: backend/Dockerfile
   ├─ Base: node:18-alpine
   ├─ Tag: ${{ github.sha }} (commit hash)
   └─ Also tag: latest
   ↓
5. Push to ECR
   ├─ Tag 1: 425687053209.dkr.ecr.us-east-1.amazonaws.com/clubapp-backend:{SHA}
   └─ Tag 2: 425687053209.dkr.ecr.us-east-1.amazonaws.com/clubapp-backend:latest
   ↓
6. Register ECS Task Definition
   ├─ File: backend/task-definition.json
   ├─ Update image to: latest
   └─ Get: taskDefinitionArn
   ↓
7. Update ECS Service
   ├─ Cluster: clubapp-dev-ecs
   ├─ Service: clubapp-dev-svc
   ├─ Force new deployment
   └─ Task definition: clubapp-backend-task
   ↓
8. Wait for Service to Stabilize
   └─ Max wait: 10 minutes
   ↓
9. Get Service Status
   ├─ Desired count
   ├─ Running count
   ├─ Deployments
   └─ Recent tasks
```

### Environment Variables

```yaml
AWS_REGION: us-east-1
AWS_ACCOUNT_ID: 425687053209
ECR_REGISTRY: 425687053209.dkr.ecr.us-east-1.amazonaws.com
ECR_REPOSITORY: clubapp-backend
ECS_SERVICE: clubapp-dev-svc
ECS_CLUSTER: clubapp-dev-ecs
ECS_TASK_DEFINITION: clubapp-backend-task
AWS_ROLE_TO_ASSUME: arn:aws:iam::425687053209:role/github-actions-apprunner
```

### Docker Build

```dockerfile
# backend/Dockerfile
FROM node:18-alpine as builder
# Build stage...

FROM node:18-alpine
# Production stage...
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
```

### ECS Task Definition

```json
{
  "family": "clubapp-backend-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [{
    "name": "web",
    "image": "425687053209.dkr.ecr.us-east-1.amazonaws.com/clubapp-backend:latest",
    "portMappings": [{ "containerPort": 3000 }],
    "environment": [
      { "name": "NODE_ENV", "value": "production" },
      { "name": "DATABASE_URL", "value": "..." }
    ]
  }]
}
```

### Deployment Success Output

```
✅ Backend deployment completed successfully!

Deployment Summary:
  Cluster: clubapp-dev-ecs
  Service: clubapp-dev-svc
  Image: 425687053209.dkr.ecr.us-east-1.amazonaws.com/clubapp-backend:{SHA}
  Commit: {SHA}

View deployment: https://console.aws.amazon.com/ecs/v2/clusters/clubapp-dev-ecs/services/clubapp-dev-svc
```

### Troubleshooting Commands

```bash
# View CloudWatch logs
aws logs tail /ecs/clubapp-backend --follow

# Check service status
aws ecs describe-services \
  --cluster clubapp-dev-ecs \
  --services clubapp-dev-svc \
  --region us-east-1

# Check running tasks
aws ecs list-tasks \
  --cluster clubapp-dev-ecs \
  --service-name clubapp-dev-svc \
  --region us-east-1

# View task logs
aws ecs describe-tasks \
  --cluster clubapp-dev-ecs \
  --tasks {TASK_ARN} \
  --region us-east-1
```

---

## INFRASTRUCTURE (TERRAFORM) PIPELINE

### File Location
`.github/workflows/terraform.yml`

### Triggers
```yaml
on:
  workflow_dispatch:          # Manual trigger
  push:
    branches: [main]
    paths: ['infra/terraform/**']
  pull_request:
    branches: [main]
    paths: ['infra/terraform/**']
```

### Deployment Flow

```
PLAN Job (Runs on push and PR)
├─ Checkout code
├─ Configure AWS credentials (OIDC)
├─ Setup Terraform 1.8.5
├─ Terraform Init
├─ Terraform Plan
│  └─ Generates tfplan artifact
└─ Upload tfplan

APPLY Job (Runs only on main push)
├─ Checkout code
├─ Configure AWS credentials (OIDC)
├─ Setup Terraform 1.8.5
├─ Terraform Init
├─ Download tfplan
├─ Terraform Apply
│  └─ Creates/updates AWS resources
└─ Output: VPC, RDS, ElastiCache, etc.
```

### Variables & Secrets

```yaml
# Repository Variables (Settings → Variables)
PROJECT: clubapp
AWS_REGION: us-east-1

# Repository Secrets (Settings → Secrets)
AWS_ROLE_TO_ASSUME: arn:aws:iam::425687053209:role/{role-name}
```

### Terraform Variables

```hcl
terraform plan \
  -var "project=clubapp" \
  -var "environment=dev" \
  -var "aws_region=us-east-1" \
  -var "enable_domain=false" \
  -out tfplan
```

### Terraform Resources Created

- VPC with public/private subnets
- RDS PostgreSQL 16.4 (Multi-AZ)
- ElastiCache Redis 7.1 (Multi-AZ)
- DynamoDB tables
- S3 buckets (assets, receipts, logs, tfstate)
- ECS Fargate cluster
- ALB + security groups
- CloudFront distribution
- Route 53 (when enabled)
- ACM certificates
- IAM roles & policies
- KMS encryption keys
- Secrets Manager

---

## GITHUB SECRETS & VARIABLES

### Configure Secrets

Go to: **Repository Settings → Secrets and Variables → Actions**

#### Required Secrets

```
AWS_ROLE_TO_ASSUME
├─ Value: arn:aws:iam::425687053209:role/github-actions-apprunner
└─ Used by: All pipelines

NEXT_PUBLIC_API_URL
├─ Dev: http://localhost:3000/api
├─ Prod: https://api.desh.co/api
└─ Used by: Web pipeline

CLOUDFRONT_DISTRIBUTION_ID
├─ Value: E1234ABCD5678 (from AWS CloudFront console)
└─ Used by: Web pipeline for cache invalidation
```

#### Optional Secrets

```
GITHUB_TOKEN
├─ Automatically available
└─ Used by: All pipelines for checkout

AWS_REGION
├─ Default: us-east-1
└─ Can be overridden per workflow
```

### Repository Variables

```yaml
# Settings → Variables and Secrets → Actions → Variables

PROJECT: clubapp
AWS_REGION: us-east-1
ENVIRONMENT: dev
```

---

## DEPLOYMENT STATUS DASHBOARD

### GitHub Actions Dashboard
**URL:** https://github.com/shafkat1/club/actions

Shows all workflow runs with:
- ✅ Success (green)
- ❌ Failure (red)
- ⏳ In Progress (yellow)

### AWS Deployment Dashboards

**Frontend (S3/CloudFront)**
- URL: https://console.aws.amazon.com/s3/buckets/clubapp-dev-assets
- CloudFront: https://console.aws.amazon.com/cloudfront/

**Backend (ECS)**
- URL: https://console.aws.amazon.com/ecs/v2/clusters/clubapp-dev-ecs
- CloudWatch: https://console.aws.amazon.com/logs/

**Infrastructure (Terraform)**
- S3 State: s3://clubapp-dev-tfstate/
- AWS Resources: https://console.aws.amazon.com/

---

## DEPLOYMENT WORKFLOW

### Development → Production

```
Developer writes code
    ↓
Git push to main
    ↓
GitHub Actions triggers
    ├─ Terraform Plan (on any change)
    ├─ Frontend Build & Deploy (on web/** change)
    └─ Backend Build & Deploy (on backend/** change)
    ↓
Tests run (if configured)
    ↓
Build artifacts created
    ↓
Deploy to AWS
    ├─ Frontend → S3 + CloudFront
    ├─ Backend → ECR + ECS
    └─ Infrastructure → Terraform Apply
    ↓
Deployment Success/Failure Notification
```

### Rollback Strategy

**Frontend:**
```bash
# Revert to previous S3 version
aws s3 sync s3://clubapp-dev-assets/web/ web/out/
# Re-invalidate CloudFront
aws cloudfront create-invalidation --distribution-id E1234ABCD5678 --paths "/*"
```

**Backend:**
```bash
# Update ECS service with previous task definition
aws ecs update-service \
  --cluster clubapp-dev-ecs \
  --service clubapp-dev-svc \
  --task-definition clubapp-backend-task:PREVIOUS_REVISION
```

---

## TROUBLESHOOTING

### Issue: Pipeline Fails on OIDC

**Error:** `NotAssumeRoleUnauthorizedOperation`

**Solution:**
1. Check role exists: `aws iam get-role --role-name github-actions-apprunner`
2. Verify trust policy includes GitHub OIDC provider
3. Check repository settings for correct role ARN

### Issue: Frontend Deploy Fails - S3 Upload

**Error:** `AccessDenied`

**Solution:**
1. Verify IAM role has S3 permissions
2. Check S3 bucket exists: `aws s3 ls clubapp-dev-assets`
3. Verify bucket policy allows deployment role

### Issue: Backend Deploy Fails - ECR Login

**Error:** `AccessDeniedException`

**Solution:**
1. Verify ECR repository exists: `aws ecr describe-repositories --repository-names clubapp-backend`
2. Check role has ECR permissions
3. Verify region is correct (us-east-1)

### Issue: Terraform Apply Fails

**Error:** `Error acquiring the state lock`

**Solution:**
```bash
# Check lock status
aws dynamodb scan --table-name clubapp-dev-tfstate-lock

# Force unlock (if necessary)
terraform force-unlock {LOCK_ID}
```

### Issue: CloudFront Cache Not Invalidating

**Error:** `CLOUDFRONT_DISTRIBUTION_ID not configured`

**Solution:**
1. Get Distribution ID from AWS console
2. Add as secret: `CLOUDFRONT_DISTRIBUTION_ID`
3. Re-run pipeline

---

## MONITORING & ALERTS

### CloudWatch Metrics

Monitor via: https://console.aws.amazon.com/cloudwatch/

**Frontend:**
- S3 metrics: Requests, bytes uploaded
- CloudFront: Cache hit ratio, requests

**Backend:**
- ECS: CPU, memory, task count
- RDS: CPU, connections, disk usage
- ElastiCache: CPU, memory, hits

### Logs

**Frontend:**
```bash
aws s3 ls s3://clubapp-dev-assets/logs/
```

**Backend:**
```bash
aws logs tail /ecs/clubapp-backend --follow
```

---

## SECURITY CONSIDERATIONS

✅ **OIDC Authentication**
- No permanent AWS credentials in GitHub
- Short-lived temporary credentials
- Minimal permission scope

✅ **Secrets Management**
- Environment variables encrypted
- Secrets not logged
- Access restricted to repository members

✅ **Code Review**
- Terraform changes require plan approval
- Manual workflow dispatch available
- Git history maintained

⚠️ **Best Practices**
- Rotate AWS credentials regularly
- Review IAM permissions quarterly
- Monitor CloudTrail for deployment changes
- Enable MFA for sensitive operations

---

## DEPLOYMENT CHECKLIST

Before Production Deployment:

- [ ] All tests passing locally
- [ ] Code reviewed and approved
- [ ] Secrets configured in GitHub
- [ ] AWS role permissions verified
- [ ] CloudFront distribution active
- [ ] Database backups enabled
- [ ] Health checks configured
- [ ] Monitoring dashboards created
- [ ] Rollback plan documented
- [ ] Team notified of deployment

---

**Last Updated:** October 30, 2025  
**Status:** ✅ Operational  
**Support:** Check logs at https://github.com/shafkat1/club/actions
