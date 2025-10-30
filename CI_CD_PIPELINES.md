# CI/CD PIPELINES - Club App

**Updated:** October 30, 2025  
**Status:** ✅ All pipelines configured and operational  
**AWS Account:** 425687053209 (us-east-1)  
**Integration Status:** ✅ Frontend implementation fully integrated with existing pipelines

---

## IMPORTANT NOTE

✅ **We are leveraging the existing Club App pipelines** - no new pipelines were created. The frontend implementation is fully compatible with the current CI/CD setup.

**Existing Pipelines in Use:**
- `.github/workflows/web-deploy.yml` - Automatically deploys web frontend
- `.github/workflows/deploy-backend.yml` - Automatically deploys NestJS backend
- `.github/workflows/terraform.yml` - Automatically applies infrastructure changes

---

## QUICK START - DEPLOYMENT

### For Frontend Changes (With New API Integration)

```bash
# 1. Make changes to /web directory (including new api-client.ts files)
git add web/
git commit -m "Update frontend with new NestJS API integration"

# 2. Push to main branch
git push origin main

# 3. Existing pipeline automatically:
#    ✅ Runs: web-deploy.yml
#    ✅ Installs dependencies (npm install --legacy-peer-deps)
#    ✅ Builds Next.js (npm run build:export)
#    ✅ Uses NEXT_PUBLIC_API_URL from GitHub Secrets
#    ✅ Uploads to S3 (clubapp-dev-assets/web/)
#    ✅ Invalidates CloudFront cache
#    ✅ Deploys live!

# 4. Monitor deployment
# Go to: https://github.com/shafkat1/club/actions
```

---

## FRONTEND DEPLOYMENT PIPELINE

### File Location
`.github/workflows/web-deploy.yml` ✅ **EXISTING - No changes needed**

### How It Works with New Frontend

```
Your new frontend files:
├─ /web/utils/api-client.ts          ← Direct NestJS API client
├─ /web/utils/error-handler.ts       ← Unified error handling
├─ /web/store/authStore.ts           ← Zustand auth state
└─ [existing components]

When you push to /web/:
    ↓
Pipeline triggers: web-deploy.yml
    ↓
Build Phase:
├─ npm install --legacy-peer-deps    (installs all deps including zustand, axios)
├─ npm run build:export               (builds Next.js static export)
├─ Reads NEXT_PUBLIC_API_URL from secrets
│   (value: https://api.desh.co/api for prod, http://localhost:3000 for dev)
└─ apiClient automatically uses this URL ✅

Deploy Phase:
├─ Assumes AWS IAM role (OIDC - secure)
├─ Uploads /web/out/ to S3
├─ Sets cache headers (1 year for static, no-cache for HTML)
├─ Invalidates CloudFront distribution
└─ Live! ✅

Result:
- apiClient.ts automatically configured with correct API URL
- Token refresh handled automatically
- Direct NestJS endpoint calls working
```

### Environment Variables (Line 17)

```yaml
NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL || 'http://localhost:3000' }}
```

✅ **This is compatible with our new api-client.ts implementation**

### GitHub Secrets to Configure

**Required:**
```
NEXT_PUBLIC_API_URL = https://api.desh.co/api (production)
                    or http://localhost:3000/api (development)
```

**Optional:**
```
CLOUDFRONT_DISTRIBUTION_ID = E1234ABCD5678 (from AWS CloudFront console)
                             (if empty, pipeline skips CF invalidation)
```

---

## BACKEND DEPLOYMENT PIPELINE

### File Location
`.github/workflows/deploy-backend.yml` ✅ **EXISTING - No changes needed**

**No changes required** - existing pipeline continues to work as designed.

---

## INFRASTRUCTURE (TERRAFORM) PIPELINE

### File Location
`.github/workflows/terraform.yml` ✅ **EXISTING - No changes needed**

**No changes required** - existing pipeline continues to work as designed.

---

## GITHUB SECRETS & VARIABLES NEEDED

### Configure Secrets

Go to: **Repository Settings → Secrets and Variables → Actions → Secrets**

```
AWS_ROLE_TO_ASSUME
├─ Value: arn:aws:iam::425687053209:role/github-actions-apprunner
└─ Used by: All pipelines (already configured)

NEXT_PUBLIC_API_URL
├─ Dev: http://localhost:3000/api
├─ Prod: https://api.desh.co/api
└─ ⚠️ IMPORTANT: Update this for production deployment

CLOUDFRONT_DISTRIBUTION_ID
├─ Get from: https://console.aws.amazon.com/cloudfront/
└─ Optional (pipeline works without it, just skips CF invalidation)
```

---

## HOW NEW FRONTEND INTEGRATES

### The api-client.ts Integration

**File:** `/web/utils/api-client.ts` (created in Phase 1)

```typescript
// Automatically uses NEXT_PUBLIC_API_URL from environment
const baseURL = process.env.NEXT_PUBLIC_API_URL || '/api'

// Example:
// Production: https://api.desh.co/api
// Development: http://localhost:3000/api
// Local: /api (relative)
```

### During Pipeline Build

```bash
# Step 1: npm run build:export
# Next.js build process runs

# Step 2: Environment variable is read
process.env.NEXT_PUBLIC_API_URL = (from GitHub Secrets)

# Step 3: api-client.ts gets correct endpoint
// → Production uses: https://api.desh.co/api
// → Dev uses: http://localhost:3000/api

# Step 4: Static files generated with embedded API URL
# → Output: /web/out/ (ready for S3)
```

### Result

✅ Frontend deployed with **correct API endpoint automatically configured**  
✅ Token refresh works automatically  
✅ Direct NestJS calls working  
✅ No manual configuration needed after deployment

---

## DEPLOYMENT STATUS DASHBOARD

### GitHub Actions Dashboard
**URL:** https://github.com/shafkat1/club/actions

Shows all workflow runs with:
- ✅ Success (green)
- ❌ Failure (red)  
- ⏳ In Progress (yellow)

**Recent successful deployments visible in your screenshot** (119 workflow runs total)

---

## MONITORING DEPLOYMENTS

### GitHub Actions Log
After pushing to main, monitor at:
```
https://github.com/shafkat1/club/actions → Click on "Deploy Web Portal"
```

### AWS CloudWatch
```bash
# Frontend S3/CloudFront status
aws s3 ls s3://clubapp-dev-assets/web/

# CloudFront distribution
aws cloudfront list-distributions | grep assets.desh.co
```

### AWS Console
- **Frontend:** https://console.aws.amazon.com/s3/buckets/clubapp-dev-assets
- **Backend:** https://console.aws.amazon.com/ecs/v2/clusters/clubapp-dev-ecs

---

## TROUBLESHOOTING

### Issue: Build fails with `npm ERR!`

**Solution:**
```bash
# Test locally first
cd web
npm install --legacy-peer-deps
npm run build:export

# If that works, push to main
# Pipeline will use same commands
```

### Issue: CloudFront cache not invalidating

**Error:** `CLOUDFRONT_DISTRIBUTION_ID not configured`

**Solution:**
1. Get Distribution ID: https://console.aws.amazon.com/cloudfront/
2. Add to GitHub Secrets: `CLOUDFRONT_DISTRIBUTION_ID = E1234ABCD5678`
3. Re-run pipeline

### Issue: API calls returning 404

**Check:**
```bash
# Verify NEXT_PUBLIC_API_URL is set correctly
# Go to GitHub Secrets → Check NEXT_PUBLIC_API_URL value

# It should be:
# Production: https://api.desh.co/api
# Development: http://localhost:3000/api
```

### Issue: Pipeline fails on AWS credentials

**Error:** `NotAssumeRoleUnauthorizedOperation`

**Solution:**
```bash
# Check role exists and has OIDC trust policy
aws iam get-role --role-name github-actions-apprunner

# Verify trust policy includes GitHub OIDC
aws iam get-role-policy --role-name github-actions-apprunner --policy-name trust-policy
```

---

## DEPLOYMENT SUCCESS INDICATORS

After deploying, you should see:

✅ GitHub Actions: Green checkmark on "Deploy Web Portal" workflow  
✅ S3: Files appearing in `s3://clubapp-dev-assets/web/`  
✅ CloudFront: Cache invalidation logs (if configured)  
✅ Browser: Frontend loads from `https://assets.desh.co/web/`  
✅ API Calls: `api-client.ts` automatically uses correct endpoint from `NEXT_PUBLIC_API_URL`

---

## SUMMARY

### What We're Using:
✅ Existing `web-deploy.yml` pipeline  
✅ Existing `deploy-backend.yml` pipeline  
✅ Existing `terraform.yml` pipeline  
✅ Existing AWS OIDC authentication

### What's New:
✅ Frontend implementation includes api-client.ts  
✅ All files compatible with existing pipeline  
✅ Pipeline automatically injects `NEXT_PUBLIC_API_URL`  
✅ Direct NestJS integration works out of the box

### To Deploy:
1. Ensure `NEXT_PUBLIC_API_URL` is set in GitHub Secrets
2. Push changes to `/web/`
3. Existing pipeline automatically deploys
4. Monitor at: https://github.com/shafkat1/club/actions

---

**Status:** 🟢 Frontend fully integrated with existing pipelines  
**Last Updated:** October 30, 2025  
**No pipeline changes required** - using existing infrastructure as-is
