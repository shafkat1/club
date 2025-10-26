# 🚀 DESH APP - COMPLETE DEPLOYMENT GUIDE

This guide provides step-by-step instructions for deploying the entire Desh app stack to production.

---

## 📋 TABLE OF CONTENTS

1. [Prerequisites](#prerequisites)
2. [Infrastructure Deployment](#infrastructure-deployment)
3. [Backend Deployment](#backend-deployment)
4. [Web Portal Deployment](#web-portal-deployment)
5. [Mobile App Deployment](#mobile-app-deployment)
6. [Monitoring & Scaling](#monitoring--scaling)
7. [Troubleshooting](#troubleshooting)

---

## ✅ PREREQUISITES

### Required Services
- ✅ AWS Account with appropriate permissions
- ✅ GitHub repository access
- ✅ Docker Hub account (optional, or use ECR)
- ✅ Expo CLI account for mobile builds
- ✅ Stripe account for payments
- ✅ Twilio account for SMS

### Required Secrets in GitHub
Add these to your GitHub repository settings (Settings > Secrets > Actions):

```
AWS_ROLE_TO_ASSUME           # IAM role ARN for OIDC
AWS_ACCESS_KEY_ID           # AWS access key
AWS_SECRET_ACCESS_KEY       # AWS secret key
AWS_DEFAULT_REGION          # e.g., us-east-1
EAS_PROJECT_ID              # Expo project ID
EXPO_TOKEN                  # Expo CLI token
CLOUDFRONT_DISTRIBUTION_ID  # CloudFront distribution ID
NEXT_PUBLIC_API_URL         # Backend API URL
STRIPE_API_KEY              # Stripe API key
STRIPE_WEBHOOK_SECRET       # Stripe webhook secret
TWILIO_ACCOUNT_SID          # Twilio account SID
TWILIO_AUTH_TOKEN           # Twilio auth token
JWT_SECRET                  # JWT signing secret
```

---

## 🏗️ INFRASTRUCTURE DEPLOYMENT

### Step 1: Initialize Terraform

```bash
cd infra/terraform

# Initialize Terraform
terraform init

# Validate configuration
terraform validate

# Create workspace (if needed)
terraform workspace new dev
terraform workspace select dev
```

### Step 2: Plan Infrastructure

```bash
terraform plan \
  -var "project=clubapp" \
  -var "environment=dev" \
  -var "aws_region=us-east-1" \
  -var "domain_name=desh.co" \
  -var "enable_domain=true" \
  -out tfplan
```

### Step 3: Apply Infrastructure

```bash
# Review the plan first
terraform apply tfplan

# Or directly apply
terraform apply -auto-approve \
  -var "project=clubapp" \
  -var "environment=dev" \
  -var "aws_region=us-east-1"
```

### Step 4: Retrieve Outputs

```bash
# Get important outputs
terraform output -json > outputs.json

# Key outputs:
# - rds_endpoint: PostgreSQL connection string
# - redis_endpoint: ElastiCache endpoint
# - alb_dns_name: Application Load Balancer DNS
# - s3_assets_bucket: S3 bucket name
# - cloudfront_domain: CloudFront domain
```

---

## 🔧 BACKEND DEPLOYMENT

### Step 1: Create ECR Repository

```bash
aws ecr create-repository \
  --repository-name clubapp-backend \
  --region us-east-1
```

### Step 2: Update Environment Variables

Add to Secrets Manager or ECS task definition:
```
DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/clubapp
REDIS_URL=redis://redis-endpoint:6379
JWT_SECRET=your-jwt-secret
STRIPE_API_KEY=sk_live_...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=token...
```

### Step 3: Build & Push Docker Image

```bash
# Build locally first
cd backend

# Update task definition with actual ECR URI
# Format: ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/clubapp-backend

docker build -t clubapp-backend:latest .
docker tag clubapp-backend:latest \
  ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/clubapp-backend:latest
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/clubapp-backend:latest
```

### Step 4: Create ECS Service

```bash
# Register task definition
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster clubapp-dev-cluster \
  --service-name clubapp-backend-service \
  --task-definition clubapp-backend-task:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=backend,containerPort=3000
```

### Step 5: Verify Deployment

```bash
# Check service status
aws ecs describe-services \
  --cluster clubapp-dev-cluster \
  --services clubapp-backend-service

# Check logs
aws logs tail /ecs/clubapp-backend --follow
```

### Automated Backend Deployment

The GitHub Actions workflow `.github/workflows/backend-deploy.yml` automatically:
1. Builds Docker image on push to `backend/**`
2. Pushes to ECR
3. Updates ECS task definition
4. Deploys to ECS with zero-downtime rolling update

Trigger: Push changes to `backend/` folder on `main` branch

---

## 🌐 WEB PORTAL DEPLOYMENT

### Step 1: Create S3 Bucket for Web Assets

```bash
# Already created by Terraform, but verify:
aws s3 ls | grep clubapp-web-assets
```

### Step 2: Add Web Secrets to GitHub

```
NEXT_PUBLIC_API_URL=https://api.desh.co
CLOUDFRONT_DISTRIBUTION_ID=E...
```

### Step 3: Configure Build Script

In `web/package.json`, ensure this script exists:
```json
{
  "scripts": {
    "build": "next build && next export -o out"
  }
}
```

### Step 4: Deploy Manually (First Time)

```bash
cd web

# Build
npm run build

# Upload to S3
aws s3 sync out/ s3://clubapp-dev-web-assets/web/ \
  --delete \
  --cache-control "max-age=0,no-cache,no-store,must-revalidate" \
  --include "*.html"

aws s3 sync out/ s3://clubapp-dev-web-assets/web/ \
  --delete \
  --cache-control "max-age=31536000,immutable" \
  --exclude "*.html"

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id $CLOUDFRONT_DIST_ID \
  --paths "/*"
```

### Automated Web Deployment

The GitHub Actions workflow `.github/workflows/web-deploy.yml` automatically:
1. Builds Next.js app on push to `web/**`
2. Uploads to S3 with proper cache headers
3. Invalidates CloudFront cache
4. Handles CSS/JS versioning

Trigger: Push changes to `web/` folder on `main` branch

---

## 📱 MOBILE APP DEPLOYMENT

### Step 1: Set Up Expo Account

```bash
npm install -g eas-cli
eas login
eas project:create
```

### Step 2: Configure Expo Project

In `mobile/app.json`:
```json
{
  "expo": {
    "plugins": [
      ["@react-native-camera/camera"],
      ["expo-location"],
      ["expo-notifications"]
    ]
  }
}
```

### Step 3: Create Build Profiles

Create `eas.json`:
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {}
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccount": "path/to/service-account.json",
        "track": "internal"
      },
      "ios": {
        "appleId": "your-apple-id",
        "ascAppId": "your-app-id"
      }
    }
  }
}
```

### Step 4: Build for Preview

```bash
cd mobile

# Android Preview
eas build --platform android --profile preview

# iOS Preview
eas build --platform ios --profile preview
```

### Step 5: Build for Production

```bash
# Android Production
eas build --platform android --profile production

# iOS Production
eas build --platform ios --profile production
```

### Step 6: Submit to App Stores

```bash
# Apple App Store
eas submit --platform ios --non-interactive

# Google Play Store
eas submit --platform android --non-interactive
```

### Automated Mobile Builds

The GitHub Actions workflow `.github/workflows/mobile-build.yml` automatically:
1. Builds preview APK/IPA on push to `mobile/**`
2. Can manually trigger production builds
3. Automatically submits to app stores (on production)
4. Uploads build artifacts

Trigger: 
- **Push** to `mobile/` = Preview build
- **Manual** workflow dispatch = Choose preview or production

---

## 📊 MONITORING & SCALING

### CloudWatch Monitoring

```bash
# View backend logs
aws logs tail /ecs/clubapp-backend --follow

# View API errors
aws logs filter-log-events \
  --log-group-name /ecs/clubapp-backend \
  --filter-pattern "ERROR"
```

### Set Up Auto-Scaling

```bash
# Create auto-scaling policy
aws autoscaling put-scaling-policy \
  --policy-name backend-scaling \
  --policy-type TargetTrackingScaling \
  --target-tracking-configuration file://scaling-policy.json
```

### Database Monitoring

```bash
# Check RDS metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name CPUUtilization \
  --dimensions Name=DBInstanceIdentifier,Value=clubapp-db \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 300 \
  --statistics Average
```

### Redis Monitoring

```bash
# Check ElastiCache metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ElastiCache \
  --metric-name CPUUtilization \
  --dimensions Name=CacheClusterId,Value=clubapp-redis
```

---

## 🔍 TROUBLESHOOTING

### Backend Not Starting

```bash
# Check container logs
aws logs tail /ecs/clubapp-backend --follow --filter-pattern "ERROR"

# Check task status
aws ecs describe-tasks \
  --cluster clubapp-dev-cluster \
  --tasks $(aws ecs list-tasks --cluster clubapp-dev-cluster --query taskArns[0] --output text)
```

### Web Portal Not Loading

```bash
# Check S3 bucket
aws s3 ls s3://clubapp-dev-web-assets/web/

# Check CloudFront cache
aws cloudfront list-invalidations --distribution-id $DIST_ID

# Verify DNS
nslookup desh.co
```

### Mobile App Build Fails

```bash
# Check Expo logs
eas build --platform android --profile production --logs

# Verify Expo token
echo $EXPO_TOKEN
```

### Database Connection Issues

```bash
# Test RDS connection
aws rds describe-db-instances \
  --db-instance-identifier clubapp-db

# Check security groups
aws ec2 describe-security-groups \
  --group-names clubapp-db-sg
```

---

## 🛡️ POST-DEPLOYMENT CHECKLIST

- [ ] Backend responding at `/health`
- [ ] Web portal loading at domain
- [ ] Mobile app connecting to backend
- [ ] Database migrations completed
- [ ] SSL certificates active
- [ ] Monitoring & alerts configured
- [ ] Auto-scaling policies active
- [ ] Backup schedules configured
- [ ] CloudWatch logs aggregating
- [ ] Error tracking (Sentry) working

---

## 🚀 QUICK START DEPLOYMENT

For rapid deployment, run this script:

```bash
#!/bin/bash

# Set variables
AWS_REGION="us-east-1"
PROJECT="clubapp"
ENV="dev"

# 1. Deploy infrastructure
cd infra/terraform
terraform init
terraform apply -auto-approve \
  -var "project=$PROJECT" \
  -var "environment=$ENV" \
  -var "aws_region=$AWS_REGION"

# 2. Build and push backend
cd ../../backend
docker build -t $PROJECT-backend:latest .
docker push ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT-backend:latest

# 3. Deploy backend to ECS
aws ecs update-service \
  --cluster $PROJECT-$ENV-cluster \
  --service $PROJECT-backend-service \
  --force-new-deployment

# 4. Build and deploy web
cd ../web
npm run build
aws s3 sync out/ s3://$PROJECT-$ENV-web-assets/web/ --delete

# 5. Build mobile (preview)
cd ../mobile
eas build --platform android --profile preview
eas build --platform ios --profile preview

echo "✅ Deployment complete!"
```

---

## 📞 SUPPORT

For deployment issues:
1. Check CloudWatch logs: `aws logs tail /ecs/clubapp-backend --follow`
2. Verify Terraform state: `terraform state list`
3. Check GitHub Actions: `github.com/shafkat1/club/actions`
4. Review Expo build logs: `eas build --list`

---

**Last Updated**: December 2024  
**Status**: Production Ready 🚀
