# 🔧 Manual VPC Endpoint Setup Guide

## Problem
ECS tasks cannot reach ECR because the VPC has no internet connectivity and no VPC endpoints.

## Solution
Create 3 VPC Endpoints to allow ECR access from within the VPC.

---

## Step 1: Create ECR API Endpoint

### Via AWS CLI:
```bash
aws ec2 create-vpc-endpoint \
  --vpc-id vpc-0bb1a8bb \
  --service-name com.amazonaws.us-east-1.ecr.api \
  --vpc-endpoint-type Interface \
  --subnet-ids subnet-092a57b2e8874db10 subnet-02a56a1d839f819ba \
  --security-group-ids sg-0512c36f727263750 \
  --region us-east-1
```

### Via AWS Console:
1. Go to **VPC > Endpoints**
2. Click **Create endpoint**
3. Fill in:
   - **Service name**: `com.amazonaws.us-east-1.ecr.api`
   - **VPC**: `vpc-0bb1a8bb`
   - **Subnets**: `subnet-092a57b2e8874db10`, `subnet-02a56a1d839f819ba`
   - **Security groups**: `sg-0512c36f727263750`
4. Click **Create**

---

## Step 2: Create ECR DKR Endpoint

### Via AWS CLI:
```bash
aws ec2 create-vpc-endpoint \
  --vpc-id vpc-0bb1a8bb \
  --service-name com.amazonaws.us-east-1.ecr.dkr \
  --vpc-endpoint-type Interface \
  --subnet-ids subnet-092a57b2e8874db10 subnet-02a56a1d839f819ba \
  --security-group-ids sg-0512c36f727263750 \
  --region us-east-1
```

### Via AWS Console:
1. Go to **VPC > Endpoints**
2. Click **Create endpoint**
3. Fill in:
   - **Service name**: `com.amazonaws.us-east-1.ecr.dkr`
   - **VPC**: `vpc-0bb1a8bb`
   - **Subnets**: `subnet-092a57b2e8874db10`, `subnet-02a56a1d839f819ba`
   - **Security groups**: `sg-0512c36f727263750`
4. Click **Create**

---

## Step 3: Create S3 Endpoint

### Via AWS CLI:
```bash
aws ec2 create-vpc-endpoint \
  --vpc-id vpc-0bb1a8bb \
  --service-name com.amazonaws.us-east-1.s3 \
  --vpc-endpoint-type Gateway \
  --region us-east-1
```

### Via AWS Console:
1. Go to **VPC > Endpoints**
2. Click **Create endpoint**
3. Fill in:
   - **Service name**: `com.amazonaws.us-east-1.s3`
   - **VPC**: `vpc-0bb1a8bb`
   - **Endpoint type**: Gateway
4. Click **Create**

---

## Step 4: Force ECS Service Deployment

After endpoints are created, force a new deployment:

```bash
aws ecs update-service \
  --cluster clubapp-dev-ecs \
  --service clubapp-dev-svc \
  --force-new-deployment \
  --region us-east-1
```

---

## ✅ Verify Success

After 2-3 minutes, check:

```bash
aws ecs describe-services \
  --cluster clubapp-dev-ecs \
  --services clubapp-dev-svc \
  --region us-east-1 \
  --query 'services[0].[status,desiredCount,runningCount]'
```

**Expected result:**
```
ACTIVE | 1 | 1
```

---

## Network Details

```
VPC ID: vpc-0bb1a8bb
Subnets:
  - subnet-092a57b2e8874db10
  - subnet-02a56a1d839f819ba
Security Group: sg-0512c36f727263750
Region: us-east-1
```

---

## What These Endpoints Do

| Endpoint | Purpose |
|----------|---------|
| **ecr.api** | Authenticates to ECR |
| **ecr.dkr** | Pulls Docker images from ECR |
| **s3** | Accesses S3 for image layers |

Without these, tasks in private subnets cannot access ECR!

---

## After Endpoints Are Created

Your tasks will:
1. ✅ Authenticate to ECR (via ecr.api endpoint)
2. ✅ Pull Docker images (via ecr.dkr endpoint)
3. ✅ Start your backend application
4. ✅ Pass health checks
5. ✅ Service shows running

**Important**: Endpoints take 1-2 minutes to become active. Wait before forcing deployment.

