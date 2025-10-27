# 🔴 Deployment Issue Diagnosis & Fix

## Root Cause Found! 🎯

The NestJS backend application is **crashing on startup** because:

**PrismaService tries to connect to the database during module initialization**
- If the connection fails, the app calls `process.exit(1)` 
- The task dies before the `/health` endpoint can respond
- ECS marks the health check as failed

## Why The Connection Fails

The **task definition is missing the `DATABASE_URL` environment variable**.

### Current Task Definition (INCOMPLETE)
```json
"environment": [
  { "name": "NODE_ENV", "value": "production" },
  { "name": "LOG_LEVEL", "value": "info" },
  { "name": "PORT", "value": "3000" }
]
```

### What's Missing
- ❌ `DATABASE_URL` - PostgreSQL connection string (CRITICAL!)
- ❌ Any other secrets/configs the app needs

---

## Solution: Add DATABASE_URL to Task Definition

### Step 1: Update task-definition.json

Edit `backend/task-definition.json` and add the DATABASE_URL:

```json
"environment": [
  { "name": "NODE_ENV", "value": "production" },
  { "name": "LOG_LEVEL", "value": "info" },
  { "name": "PORT", "value": "3000" },
  { "name": "DATABASE_URL", "value": "YOUR_DATABASE_CONNECTION_STRING_HERE" }
]
```

### Step 2: Get Your Database Connection String

**If using AWS RDS:**
```
postgresql://username:password@your-db-endpoint.amazonaws.com:5432/clubapp_db
```

**Find your RDS endpoint:**
```bash
aws rds describe-db-instances \
  --query 'DBInstances[0].[DBInstanceIdentifier,Endpoint.Address,DBName,MasterUsername]'
```

### Step 3: Update the Task Definition in AWS

```bash
# Register updated task definition
aws ecs register-task-definition \
  --cli-input-json file://backend/task-definition.json \
  --region us-east-1
```

### Step 4: Force ECS Service Deployment

```bash
aws ecs update-service \
  --cluster clubapp-dev-ecs \
  --service clubapp-dev-svc \
  --force-new-deployment \
  --region us-east-1
```

---

## Why This Will Work

1. **PrismaService connects successfully** to the database
2. **App initializes all modules** (HealthModule, VenuesModule, etc.)
3. **Server listens on port 3000**
4. **Health check endpoint responds** with 200 status
5. **ECS marks task as RUNNING** ✅

---

## Database Requirements

Your database needs:
- ✅ PostgreSQL running
- ✅ Database created (e.g., `clubapp_db`)
- ✅ User with access to the database
- ✅ Network connectivity from ECS subnet

### If database doesn't exist yet:

```bash
# Connect to your RDS instance
psql -h your-db-endpoint.amazonaws.com -U postgres

# Create database and user
CREATE DATABASE clubapp_db;
CREATE USER clubapp_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE clubapp_db TO clubapp_user;

# Run migrations (if you have any)
# npx prisma migrate deploy
```

---

## Environment Variables Your App Might Need

Check if your app needs any of these:

```json
"environment": [
  { "name": "NODE_ENV", "value": "production" },
  { "name": "LOG_LEVEL", "value": "info" },
  { "name": "PORT", "value": "3000" },
  { "name": "DATABASE_URL", "value": "postgresql://user:pass@host:5432/db" },
  { "name": "REDIS_URL", "value": "redis://redis-host:6379" },
  { "name": "JWT_SECRET", "value": "your-jwt-secret" },
  { "name": "CORS_ORIGIN", "value": "https://your-frontend-url" },
  { "name": "AWS_REGION", "value": "us-east-1" }
]
```

---

## How to Find Missing Environment Variables

Check your backend code for what's needed:

```bash
# Search for env vars used
grep -r "process.env" backend/src/ | head -20
```

Common ones in NestJS apps:
- `DATABASE_URL` - Database connection (REQUIRED)
- `JWT_SECRET` - JWT signing key
- `REDIS_URL` - Redis connection
- `AWS_` - AWS service credentials
- `CORS_ORIGIN` - Frontend URL for CORS

---

## Testing the Fix

Once you update the task definition and deploy:

1. **Check service status:**
```bash
aws ecs describe-services \
  --cluster clubapp-dev-ecs \
  --services clubapp-dev-svc \
  --region us-east-1 \
  --query 'services[0].[status,runningCount]'
```

2. **Check CloudWatch logs:**
```bash
aws logs tail /ecs/clubapp-backend --follow
```

**Expected log output:**
```
✅ Database connected
🚀 Server running on http://localhost:3000
📚 API docs: http://localhost:3000/api/docs
```

3. **Health check passes:**
```
[PASS] health check: HTTP 200 from localhost:3000/health
```

---

## Summary

| Issue | Cause | Fix |
|-------|-------|-----|
| Task won't start | No DATABASE_URL | Add DATABASE_URL to task definition environment |
| App crashes on init | Prisma can't connect | Ensure database exists and connection works |
| Health check fails | App exited before responding | Both of above |

**Next Action**: Add DATABASE_URL to task-definition.json and redeploy!
