# 🔍 Backend Startup Diagnosis & Fix

## Current Issue
- **Task Status**: PENDING (not transitioning to RUNNING)
- **Running Count**: 0/1
- **Likely Cause**: Application startup failure or health check timeout

---

## Analysis

### ✅ What's Working
1. Docker image builds successfully ✅
2. Image pulls from ECR successfully ✅
3. `/health` endpoint exists and returns 200 ✅
4. Health service is properly configured ✅
5. Prisma service handles DB unavailability gracefully ✅
6. VPC endpoints allow network access ✅

### 🔴 Potential Issues

#### Issue 1: Health Check Timing
The ECS health check starts after 60 seconds (`startPeriod: 60`) but the app might not be fully started yet.

**Current config in task definition:**
```json
"healthCheck": {
  "command": ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"],
  "interval": 30,
  "timeout": 5,
  "retries": 3,
  "startPeriod": 60
}
```

**Solution**: Increase `startPeriod` to 120 seconds to give the app more time to start.

#### Issue 2: curl Not Available
The health check uses `curl` but it might not be in the container.

**Solution**: Use `node -e` instead (no external dependency needed).

#### Issue 3: Missing Environment Variables
The app might need database credentials or other config.

**Current env vars in task definition:**
```
NODE_ENV: production
LOG_LEVEL: info
PORT: 3000
```

**Missing potentially needed vars:**
- `DATABASE_URL` - Prisma connection string
- `REDIS_URL` - Redis connection string  
- `JWT_SECRET` - JWT signing secret
- `CORS_ORIGIN` - CORS settings

---

## Fix: Update Task Definition

### Option 1: Simple Fix (Increase Health Check Timeout)

Update the task definition health check:

```json
"healthCheck": {
  "command": ["CMD-SHELL", "node -e \"require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})\" || exit 1"],
  "interval": 30,
  "timeout": 5,
  "retries": 3,
  "startPeriod": 120
}
```

**Changes:**
- Increased `startPeriod` from 60 to 120 seconds
- Replaced `curl` with `node -e` (no external dependency)

### Option 2: Remove Health Check Requirement (Not Recommended)

For debugging only - set health check to just check if port is listening:

```json
"healthCheck": {
  "command": ["CMD-SHELL", "test -f /proc/self/status || exit 1"],
  "interval": 30,
  "timeout": 5,
  "retries": 3,
  "startPeriod": 120
}
```

---

## To Apply the Fix

### Method 1: Update task definition file

Edit `backend/task-definition.json`:

```json
"healthCheck": {
  "command": [
    "CMD-SHELL",
    "node -e \"require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})\" || exit 1"
  ],
  "interval": 30,
  "timeout": 5,
  "retries": 3,
  "startPeriod": 120
}
```

Then commit and push to trigger new deployment.

### Method 2: Update via AWS CLI (Immediate)

```bash
# Register new task definition with updated health check
aws ecs register-task-definition \
  --cli-input-json file://backend/task-definition.json \
  --region us-east-1

# Force service deployment
aws ecs update-service \
  --cluster clubapp-dev-ecs \
  --service clubapp-dev-svc \
  --force-new-deployment \
  --region us-east-1
```

---

## Additional Diagnostics

If health check still fails, the app is likely crashing. Check for:

1. **Database connectivity** - If Prisma can't connect
2. **Redis connectivity** - If Redis service is needed
3. **Missing modules** - If compiled modules are missing
4. **Port binding issues** - If app can't bind to port 3000

Check the Dockerfile ensures all required dependencies are installed:

```dockerfile
# In Dockerfile, make sure production dependencies include:
RUN npm ci --only=production --legacy-peer-deps

# Verify @prisma/client is installed
# Verify node-fetch or http is available (for health check)
```

---

## Summary

**Most likely fix**: Increase `startPeriod` from 60 to 120 seconds and use `node -e` instead of `curl` for the health check.

This gives the NestJS application more time to initialize all modules and start the Express server before health checks begin.

**Next steps:**
1. Update task definition with new health check config
2. Commit changes to git
3. Push to trigger new deployment
4. Wait 2-3 minutes for task to reach RUNNING state