# Environment Variables Setup Guide

This guide walks through setting up all environment variables for the Club app stack.

**Table of Contents:**
1. [Quick Setup](#quick-setup)
2. [Backend Setup](#backend-setup)
3. [Mobile Setup](#mobile-setup)
4. [Web Portal Setup](#web-portal-setup)
5. [Getting Third-Party Credentials](#getting-third-party-credentials)
6. [Verification Checklist](#verification-checklist)

---

## Quick Setup

### Files to Create/Update

```bash
# Backend
cp backend/.env.example backend/.env

# Mobile
cp mobile/.env.example mobile/.env

# Web
cp web/.env.example web/.env.local

# Terraform
cp infra/terraform/terraform.tfvars.example infra/terraform/terraform.tfvars
```

---

## Backend Setup

### Step 1: Initialize from template

```bash
cp backend/.env.example backend/.env
```

### Step 2: Get infrastructure values from Terraform

Run these commands in `infra/terraform/`:

```bash
# Get RDS endpoint
terraform output rds_endpoint

# Get Redis endpoint
terraform output redis_primary_endpoint

# Get S3 bucket name
terraform output s3_assets_bucket

# Get CloudFront domain
terraform output cloudfront_assets_domain
```

### Step 3: Update backend/.env

Replace these values:

```bash
# RDS Postgres
DATABASE_HOST=<from terraform output rds_endpoint>
DATABASE_PORT=5432
DATABASE_NAME=clubapp
DATABASE_USER=app

# Get password from Secrets Manager
aws secretsmanager get-secret-value \
  --secret-id clubapp-dev/rds/postgres/connection \
  --region us-east-1 \
  --query 'SecretString' | jq -r '.password'

# Then set in .env:
DATABASE_PASSWORD=<paste-password>
DATABASE_URL=postgresql://app:PASSWORD@HOST:5432/clubapp?sslmode=require

# Redis
REDIS_HOST=<from terraform output redis_primary_endpoint>
REDIS_PORT=6379
REDIS_URL=rediss://<redis-host>:6379/0

# S3
S3_ASSETS_BUCKET=<from terraform output s3_assets_bucket>
S3_ASSET_CDN_URL=https://<from terraform output cloudfront_assets_domain>

# Or after domain setup:
# S3_ASSET_CDN_URL=https://assets.desh.co
```

### Step 4: Generate Secrets

```bash
# Generate JWT secrets (need two)
openssl rand -base64 32
openssl rand -base64 32

# Paste into backend/.env:
JWT_SECRET=<first-secret>
JWT_REFRESH_SECRET=<second-secret>
API_SECRET_KEY=<another-secret>
```

### Step 5: Add Third-Party Credentials

See [Getting Third-Party Credentials](#getting-third-party-credentials) for:
- Stripe keys
- Twilio credentials
- SendGrid API key
- Social auth credentials (Google, Facebook, etc.)
- Sentry DSN

### Step 6: Verify backend/.env

```bash
cd backend
# Verify no placeholder values remain
grep -E "xxxx|placeholder|your_" .env || echo "✅ All values filled"
```

---

## Mobile Setup

### Step 1: Initialize from template

```bash
cp mobile/.env.example mobile/.env
```

### Step 2: Get infrastructure values

From Terraform outputs:

```bash
# CloudFront domain (for assets)
terraform output cloudfront_assets_domain

# ALB DNS (for API)
terraform output alb_dns_name
```

### Step 3: Update mobile/.env

```bash
# During development
EXPO_PUBLIC_API_URL=http://<from terraform output alb_dns_name>
EXPO_PUBLIC_ASSETS_URL=https://<from terraform output cloudfront_assets_domain>

# After domain setup
# EXPO_PUBLIC_API_URL=https://api.desh.co
# EXPO_PUBLIC_ASSETS_URL=https://assets.desh.co
```

### Step 4: Add Maps & Payments

See section below for:
- Google Maps API key
- Mapbox access token
- Stripe publishable key
- Sentry DSN

### Step 5: Add Push Notifications

```bash
# Get Expo Project ID
cd mobile
npx eas whoami
# Note your account, then get project ID from eas.json

EXPO_PUBLIC_EXPO_PROJECT_ID=<your-project-id>

# For Android: Get FCM Sender ID from Firebase Console
EXPO_PUBLIC_FCM_SENDER_ID=<from-firebase>
```

### Step 6: Verify mobile/.env

```bash
cd mobile
grep -E "xxxx|placeholder|your_" .env || echo "✅ All values filled"
```

---

## Web Portal Setup

### Step 1: Initialize from template

```bash
cp web/.env.example web/.env.local
```

### Step 2: Get infrastructure values

Same as mobile setup:

```bash
# API and assets endpoints
NEXT_PUBLIC_API_URL=http://<from terraform output alb_dns_name>
NEXT_PUBLIC_ASSETS_URL=https://<from terraform output cloudfront_assets_domain>
```

### Step 3: Add Google Maps & Mapbox

See section below for keys.

### Step 4: Add Server-Side Secrets

```bash
# These are NOT NEXT_PUBLIC_ (kept secret)
# Copy from backend/.env:
API_SECRET_KEY=<same as backend>
STRIPE_SECRET_KEY=<same as backend>
SENDGRID_API_KEY=<same as backend>
```

### Step 5: Verify web/.env.local

```bash
cd web
grep -E "xxxx|placeholder|your_" .env.local || echo "✅ All values filled"
```

---

## Getting Third-Party Credentials

### Google Maps API Key

1. Go to: https://console.cloud.google.com/
2. Create new project (e.g., "Club App")
3. Enable APIs:
   - Maps JavaScript API
   - Places API
   - Geolocation API
4. Create API key:
   - Go to Credentials
   - Click "Create Credentials" → "API Key"
   - Restrict key to:
     - Android apps (mobile)
     - iOS apps (mobile)
     - HTTP referrers (web)
5. Add to all `.env` files:
   ```
   GOOGLE_MAPS_API_KEY=AIzaSyxxxxxx
   ```

### Mapbox Access Token

1. Go to: https://account.mapbox.com/
2. Create account (or login)
3. Under "Tokens", click "Create a token"
4. Scopes needed:
   - `public:read` (for maps)
   - `styles:read`
5. Add to all `.env` files:
   ```
   MAPBOX_ACCESS_TOKEN=pk.eyJ1...
   ```

### Stripe Keys

1. Go to: https://dashboard.stripe.com/
2. Go to Developers → API Keys
3. Copy:
   - **Publishable key** (pk_live_xxxx) → Add to frontend `.env` files
   - **Secret key** (sk_live_xxxx) → Add to backend + web `.env` files
4. Create webhook endpoint:
   - Go to Webhooks
   - Add endpoint: `https://api.desh.co/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `charge.refunded`
   - Copy webhook secret → Add to backend `.env`

### Twilio Setup

1. Go to: https://www.twilio.com/console
2. Create account
3. Get credentials:
   - Account SID
   - Auth Token
   - Phone number (for SMS)
4. Create Verify service:
   - Go to Verify → Services
   - Create new service
   - Copy Service SID
5. Add to backend `.env`:
   ```
   TWILIO_ACCOUNT_SID=ACxxxxxx
   TWILIO_AUTH_TOKEN=xxxxx
   TWILIO_PHONE_NUMBER=+1234567890
   TWILIO_VERIFY_SERVICE_SID=VAxxxxxx
   ```

### SendGrid API Key

1. Go to: https://sendgrid.com/
2. Create account / login
3. Go to Settings → API Keys
4. Create API key with "Mail Send" permissions
5. Add to backend + web `.env`:
   ```
   SENDGRID_API_KEY=SG.xxxxx
   SENDGRID_FROM_EMAIL=noreply@desh.co
   ```

### Social Authentication Setup

#### Google OAuth

1. Go to: https://console.cloud.google.com/
2. Credentials → Create OAuth 2.0 Client ID (Web)
3. Authorized redirect URIs:
   - `https://api.desh.co/auth/google/callback`
   - `http://localhost:3000/auth/google/callback` (development)
4. Add to backend `.env`:
   ```
   GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=xxxxx
   ```

#### Facebook OAuth

1. Go to: https://developers.facebook.com/
2. Create app → Business
3. Add product → Facebook Login
4. Settings → Basic: Copy App ID & App Secret
5. Settings → Facebook Login: Add Redirect URIs
   - `https://api.desh.co/auth/facebook/callback`
   - `http://localhost:3000/auth/facebook/callback` (development)
6. Add to backend `.env`:
   ```
   FACEBOOK_APP_ID=xxxxx
   FACEBOOK_APP_SECRET=xxxxx
   ```

#### Apple Sign-In

1. Go to: https://developer.apple.com/
2. Certificates, Identifiers & Profiles
3. Create Service ID for your app
4. Configure redirect URIs
5. Create private key
6. Add to backend `.env`:
   ```
   APPLE_CLIENT_ID=com.clubapp.service
   APPLE_CLIENT_SECRET=<private-key-content>
   ```

#### TikTok, Snapchat, X (Twitter), Instagram

Follow similar OAuth flow on each platform's developer console:
- TikTok: https://developers.tiktok.com/
- Snapchat: https://dev.snapchat.com/
- X: https://developer.twitter.com/
- Instagram: https://developers.facebook.com/ (under Meta)

Add credentials to backend `.env` following the same pattern as above.

### Sentry Setup

1. Go to: https://sentry.io/
2. Create account → Create organization
3. Create project (React/React Native for mobile, Next.js for web, Node.js for backend)
4. Copy DSN for each project
5. Add to respective `.env` files:
   ```
   SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
   ```

---

## Verification Checklist

### Before deploying backend:

```bash
cd backend
✅ .env file created
✅ DATABASE_HOST set to RDS endpoint
✅ REDIS_HOST set to Redis endpoint
✅ S3_ASSETS_BUCKET set
✅ JWT_SECRET filled (not xxx)
✅ STRIPE_SECRET_KEY filled
✅ TWILIO credentials filled
✅ SENDGRID_API_KEY filled
✅ All social auth credentials filled
✅ SENTRY_DSN filled
✅ No placeholder values remain
  grep -E "xxxx|placeholder|your_" .env | wc -l  # Should return 0
```

### Before building mobile:

```bash
cd mobile
✅ .env file created
✅ EXPO_PUBLIC_API_URL set
✅ EXPO_PUBLIC_ASSETS_URL set
✅ GOOGLE_MAPS_API_KEY filled
✅ MAPBOX_ACCESS_TOKEN filled
✅ STRIPE_PUBLISHABLE_KEY filled
✅ No placeholder values remain
```

### Before deploying web:

```bash
cd web
✅ .env.local file created
✅ NEXT_PUBLIC_API_URL set
✅ NEXT_PUBLIC_ASSETS_URL set
✅ Server-side secrets filled (API_SECRET_KEY, STRIPE_SECRET_KEY, etc.)
✅ No placeholder values remain
```

### Before applying Terraform:

```bash
cd infra/terraform
✅ terraform.tfvars created or -var flags prepared
✅ project = "clubapp"
✅ environment = "dev"
✅ domain_name = "desh.co"
✅ enable_domain = false (initially)
```

---

## Next Steps

1. **Backend**: `npm install && npm run start:dev`
2. **Mobile**: `expo start`
3. **Web**: `npm run dev`
4. **Terraform**: `terraform apply`

All environment variables are now configured! 🎉

---

## Troubleshooting

### "Missing environment variable X"
- Check that the `.env` file exists in the right directory
- Ensure no typos in variable names
- For Next.js, restart the dev server after updating `.env.local`
- For Expo, clear cache: `expo start -c`

### "API connection refused"
- Verify `API_URL` matches your deployed endpoint
- Check ALB is running: `terraform output alb_dns_name`
- Ensure security groups allow traffic

### "Third-party auth failing"
- Double-check redirect URIs match exactly (including trailing slash)
- Verify credentials haven't expired or been regenerated
- Check console logs for specific OAuth errors

### "Database connection timeout"
- Ensure security group allows inbound 5432 from ECS
- Verify RDS is in the same VPC
- Check credentials in Secrets Manager

---

**Last Updated**: 2025-10-26  
**Status**: ✅ Complete Setup Guide
