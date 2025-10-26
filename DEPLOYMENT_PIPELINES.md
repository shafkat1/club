# 🚀 DEPLOYMENT PIPELINES - COMPLETE OVERVIEW

This document outlines all automated deployment pipelines for the Desh app.

---

## 📊 PIPELINE ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                      GITHUB PUSH EVENT                           │
└─────────────────────────────────────────────────────────────────┘
                               │
                    ┌──────────┼──────────┐
                    │          │          │
         ┌──────────▼─────┐ ┌─▼──────────────┐ ┌──────────▼──────┐
         │ backend/**     │ │ web/**         │ │ mobile/**       │
         │ PUSH EVENT     │ │ PUSH EVENT     │ │ PUSH EVENT      │
         └──────────┬─────┘ └────┬───────────┘ └────────┬─────────┘
                    │            │                     │
         ┌──────────▼─────┐ ┌───▼────────────┐ ┌──────▼──────────┐
         │  BACKEND        │ │  WEB           │ │  MOBILE        │
         │  DEPLOYMENT     │ │  DEPLOYMENT    │ │  BUILDS        │
         │                 │ │                │ │                │
         │ 1. Build image  │ │ 1. Build app   │ │ 1. Build APK   │
         │ 2. Push to ECR  │ │ 2. Upload S3   │ │ 2. Build IPA   │
         │ 3. Deploy ECS   │ │ 3. Invalidate  │ │ 3. Upload      │
         │ 4. Health check │ │    CloudFront  │ │    artifacts   │
         └─────────────────┘ └────────────────┘ │ 4. Submit      │
                                                 │    stores      │
                                        └────────▼──────────────┘
                                             ▼
                              ┌─────────────────────────────────┐
                              │ PRODUCTION DEPLOYMENT COMPLETE  │
                              └─────────────────────────────────┘
```

---

## 🔧 PIPELINE 1: BACKEND DEPLOYMENT

**File**: `.github/workflows/backend-deploy.yml`  
**Trigger**: Push to `backend/**` on `main` branch  
**Duration**: ~15-20 minutes

### Workflow Steps

```yaml
1. Checkout Code
   └─ Clone repository

2. Configure AWS Credentials (OIDC)
   └─ Assume GitHub OIDC role
   └─ Get temporary AWS credentials

3. Login to ECR
   └─ Authenticate with Amazon ECR

4. Build Docker Image
   └─ Build Dockerfile
   └─ Tag with git SHA
   └─ Tag as latest

5. Push to ECR
   └─ Push tagged image
   └─ Push latest image

6. Update Task Definition
   └─ Inject new image URI
   └─ Keep environment vars

7. Deploy to ECS
   └─ Register task definition
   └─ Update service
   └─ Wait for stability

8. Notify
   └─ Echo deployment details
```

### Deployment Process

```
Push to backend/ on main
      ↓
Trigger GitHub Actions
      ↓
Build Docker image
      ↓
Push to ECR (Elastic Container Registry)
      ↓
Update ECS task definition
      ↓
Deploy to ECS Fargate
      ↓
Health check monitoring
      ↓
Zero-downtime rolling update ✅
```

### Required Secrets
```
AWS_ROLE_TO_ASSUME   # GitHub OIDC role ARN
```

### Environment Variables
```
AWS_REGION              = us-east-1
ECR_REPOSITORY          = clubapp-backend
ECS_SERVICE            = clubapp-backend-service
ECS_CLUSTER            = clubapp-dev-cluster
ECS_TASK_DEFINITION    = clubapp-backend-task
```

### Verification
```bash
# Check deployment status
aws ecs describe-services \
  --cluster clubapp-dev-cluster \
  --services clubapp-backend-service

# View logs
aws logs tail /ecs/clubapp-backend --follow

# Test API
curl https://api.desh.co/health
```

---

## 🌐 PIPELINE 2: WEB PORTAL DEPLOYMENT

**File**: `.github/workflows/web-deploy.yml`  
**Trigger**: Push to `web/**` on `main` branch  
**Duration**: ~10-12 minutes

### Workflow Steps

```yaml
1. Checkout Code
   └─ Clone repository

2. Setup Node.js
   └─ Node 18
   └─ Install dependencies (cached)

3. Install Dependencies
   └─ npm ci (clean install)

4. Build Next.js App
   └─ Next.js static export
   └─ Generate out/ folder

5. Configure AWS Credentials
   └─ Assume GitHub OIDC role

6. Upload to S3
   └─ Upload non-HTML (cache: 1 year)
   └─ Upload HTML (cache: no-cache)

7. Invalidate CloudFront
   └─ Clear cache
   └─ Refresh CDN globally

8. Upload Coverage (optional)
   └─ Upload test coverage reports

9. Notify
   └─ Echo deployment details
```

### Deployment Process

```
Push to web/ on main
      ↓
Trigger GitHub Actions
      ↓
Install dependencies
      ↓
Build Next.js app
      ↓
Upload to S3
      ↓
Invalidate CloudFront cache
      ↓
Content available globally ✅
```

### Required Secrets
```
AWS_ROLE_TO_ASSUME              # GitHub OIDC role ARN
CLOUDFRONT_DISTRIBUTION_ID      # CloudFront distribution ID
NEXT_PUBLIC_API_URL             # Backend API URL
```

### Environment Variables
```
AWS_REGION                  = us-east-1
S3_BUCKET                  = clubapp-dev-web-assets
CLOUDFRONT_DISTRIBUTION_ID = ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }}
NEXT_PUBLIC_API_URL        = ${{ secrets.NEXT_PUBLIC_API_URL }}
```

### Cache Strategy
```
Static Assets (CSS, JS, Images)
├─ Cache-Control: max-age=31536000,immutable (1 year)
└─ Changes: Automatic with build hash

HTML Files
├─ Cache-Control: max-age=0,no-cache,no-store,must-revalidate
└─ Always fresh from CDN
```

### Verification
```bash
# Check S3 bucket
aws s3 ls s3://clubapp-dev-web-assets/web/

# Verify CloudFront
curl -I https://desh.co

# Check invalidations
aws cloudfront list-invalidations \
  --distribution-id $DIST_ID
```

---

## 📱 PIPELINE 3: MOBILE APP BUILDS

**File**: `.github/workflows/mobile-build.yml`  
**Trigger**: 
- Auto: Push to `mobile/**` on `main` (preview)
- Manual: Workflow dispatch (choose preview or production)

**Duration**: ~30-45 minutes (first time), ~15-20 minutes (subsequent)

### Workflow Steps

```yaml
1. Checkout Code
   └─ Clone repository

2. Setup Node.js
   └─ Node 18
   └─ Install dependencies (cached)

3. Setup Expo CLI
   └─ Install eas-cli globally

4. Install Dependencies
   └─ npm ci (clean install)

5. Lint Code
   └─ Check for syntax errors
   └─ (continues on failure)

6. Build Preview Android
   └─ Build APK for testing
   └─ Upload to EAS

7. Build Preview iOS
   └─ Build IPA for testing
   └─ Upload to EAS

[IF PRODUCTION BUILD]

8. Build Production Android
   └─ Build app-bundle for Play Store
   └─ Sign with production cert

9. Build Production iOS
   └─ Build IPA for App Store
   └─ Sign with production cert

10. Submit to Stores
    └─ Submit to Google Play (optional)
    └─ Submit to Apple App Store (optional)

11. Upload Artifacts
    └─ Store build files
    └─ Available for download
```

### Build Types

#### Preview Builds (Auto on Push)
```
Trigger: Push to mobile/**
├─ Android: APK (testable via link)
├─ iOS: IPA (simulator or device)
└─ Automatic (no manual intervention)
```

#### Production Builds (Manual)
```
Trigger: Workflow dispatch with "production"
├─ Android: app-bundle (Play Store ready)
├─ iOS: IPA (App Store ready)
└─ Manual approval required
```

### Required Secrets
```
EXPO_TOKEN          # Expo CLI authentication token
EAS_PROJECT_ID      # Expo EAS project ID
```

### Build Profiles (eas.json)

```json
{
  "build": {
    "preview": {
      "android": { "buildType": "apk" },
      "ios": { "simulator": true }
    },
    "production": {
      "android": { "buildType": "app-bundle" },
      "ios": {}
    }
  },
  "submit": {
    "production": {
      "android": { "track": "internal" },
      "ios": {}
    }
  }
}
```

### Verification
```bash
# List recent builds
eas build --list

# View build logs
eas build --platform android --list

# Download APK/IPA
# Available in GitHub Actions artifacts
```

---

## 📊 PIPELINE STATUS & MONITORING

### View All Workflows

Visit: `https://github.com/shafkat1/club/actions`

### Quick Status Check

```bash
# Get latest workflow runs
gh run list --repo shafkat1/club

# View specific workflow
gh run list --repo shafkat1/club --workflow backend-deploy.yml

# Get run details
gh run view <run-id> --repo shafkat1/club
```

### GitHub Actions Logs

**Backend Deployment**
```
https://github.com/shafkat1/club/actions/workflows/backend-deploy.yml
```

**Web Portal Deployment**
```
https://github.com/shafkat1/club/actions/workflows/web-deploy.yml
```

**Mobile App Builds**
```
https://github.com/shafkat1/club/actions/workflows/mobile-build.yml
```

---

## 🔐 SECRETS CONFIGURATION

### Add Secrets to GitHub

1. Go to: **Settings > Secrets and variables > Actions**
2. Click **New repository secret**
3. Add each secret:

```
AWS_ROLE_TO_ASSUME
├─ Value: arn:aws:iam::ACCOUNT_ID:role/github-oidc-terraform-role

CLOUDFRONT_DISTRIBUTION_ID
├─ Value: E1234567890ABC

NEXT_PUBLIC_API_URL
├─ Value: https://api.desh.co

EXPO_TOKEN
├─ Value: (get from expo cli)

EAS_PROJECT_ID
├─ Value: (get from eas project)
```

### Accessing Secrets

Secrets are automatically injected into workflows:

```yaml
- name: Deploy
  env:
    MY_SECRET: ${{ secrets.MY_SECRET }}
```

---

## 🚀 MANUAL DEPLOYMENT (FALLBACK)

If GitHub Actions fails, deploy manually:

### Backend
```bash
cd backend
docker build -t clubapp-backend:latest .
docker tag clubapp-backend:latest \
  ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/clubapp-backend:latest
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/clubapp-backend:latest

aws ecs update-service \
  --cluster clubapp-dev-cluster \
  --service clubapp-backend-service \
  --force-new-deployment
```

### Web Portal
```bash
cd web
npm run build
aws s3 sync out/ s3://clubapp-dev-web-assets/web/ --delete
aws cloudfront create-invalidation \
  --distribution-id $CLOUDFRONT_DIST_ID \
  --paths "/*"
```

### Mobile App
```bash
cd mobile
eas build --platform android --profile preview
eas build --platform ios --profile preview
```

---

## ⚠️ TROUBLESHOOTING

### GitHub Actions Not Triggering
```
1. Check workflow file syntax
2. Verify branch name (must be 'main')
3. Check path filters (backend/**, web/**, mobile/**)
4. View Actions tab for error logs
```

### Backend Deployment Fails
```bash
# Check ECS service
aws ecs describe-services --cluster clubapp-dev-cluster \
  --services clubapp-backend-service

# View task logs
aws logs tail /ecs/clubapp-backend --follow

# Check ECR image exists
aws ecr describe-images --repository-name clubapp-backend
```

### Web Portal Doesn't Update
```bash
# Verify S3 upload
aws s3 ls s3://clubapp-dev-web-assets/web/

# Check CloudFront cache
aws cloudfront list-invalidations --distribution-id $DIST_ID

# Manually clear cache
aws cloudfront create-invalidation \
  --distribution-id $DIST_ID \
  --paths "/*"
```

### Mobile Build Fails
```bash
# Check Expo token validity
eas whoami

# View build logs
eas build --platform android --list
eas build --platform android --get-link <build-id>

# Check eas.json syntax
cat mobile/eas.json | jq .
```

---

## 📋 DEPLOYMENT CHECKLIST

Before each deployment:

- [ ] All tests pass locally
- [ ] Code reviewed and approved
- [ ] Commit message is clear
- [ ] No secrets in code
- [ ] Environment variables updated
- [ ] Database migrations ready
- [ ] API compatibility verified
- [ ] Mobile screenshots updated

After deployment:

- [ ] Monitor GitHub Actions logs
- [ ] Verify in staging/production
- [ ] Check error tracking (Sentry)
- [ ] Monitor CloudWatch logs
- [ ] Verify health checks
- [ ] Test user flows
- [ ] Monitor performance metrics

---

## 📊 DEPLOYMENT METRICS

### Average Deployment Times

| Component | Time | Notes |
|-----------|------|-------|
| **Backend** | 15-20 min | Includes build, push, ECS update |
| **Web Portal** | 10-12 min | Build + S3 sync + CDN invalidation |
| **Mobile** | 30-45 min | First time; ~15-20 min cached |

### Success Rates

```
Expected: 95%+ first-time success
Failures typically due to:
├─ Network timeouts
├─ Invalid credentials
├─ ECR push limits
├─ Resource quotas
└─ GitHub Actions runner issues
```

---

## 🎯 NEXT STEPS

1. ✅ Add all required secrets to GitHub
2. ✅ Test infrastructure via Terraform
3. ✅ Trigger backend deployment
4. ✅ Verify web portal loads
5. ✅ Build mobile preview
6. ✅ Test end-to-end flow
7. ✅ Monitor logs and metrics

---

**Last Updated**: December 2024  
**Status**: All Pipelines Ready 🚀  
**Maintenance**: Monitor GitHub Actions for failures
