# 🔍 Deployment Debug Analysis

## Current Situation

**Service Status**: ACTIVE but 0 running tasks
**Task Status**: PENDING (not transitioning to RUNNING)
**Health Check**: Waiting to pass

## Root Cause Analysis

### ✅ What's Working:
1. Docker image successfully built and pushed to ECR
2. Image pulled successfully from ECR 
3. VPC endpoints created and accessible
4. CloudWatch Logs endpoint available
5. `/health` endpoint properly configured in NestJS

### 🔴 What's Failing:
The NestJS application is **crashing on startup** before the health check can pass.

### 📋 Likely Causes (in order of probability):

#### 1. **Missing Database Configuration** (MOST LIKELY)
The `VenuesModule` depends on `PrismaService` which requires:
- `DATABASE_URL` environment variable
- RDS database must be accessible from ECS task

**Symptoms**: App crashes with Prisma connection error

**Fix**: Add to task definition:
```json
{
  "name": "DATABASE_URL",
  "value": "postgresql://user:password@rds-endpoint:5432/database"
}
```

#### 2. **Missing Redis Configuration** (LIKELY)
`RedisService` requires:
- `REDIS_URL` or `REDIS_HOST`/`REDIS_PORT` environment variables
- Redis must be accessible from ECS task

**Symptoms**: App crashes with Redis connection timeout

**Fix**: Add to task definition:
```json
{
  "name": "REDIS_URL",
  "value": "redis://redis-endpoint:6379"
}
```

#### 3. **Missing JWT Secret** (POSSIBLE)
`JwtModule` fallback uses `process.env.JWT_SECRET || 'dev-secret'`

**Symptoms**: Minimal risk, uses dev secret if not set

**Fix**: Add to task definition:
```json
{
  "name": "JWT_SECRET",
  "value": "your-production-jwt-secret"
}
```

#### 4. **Prisma Database Migrations** (POSSIBLE)
Database schema may not exist or be outdated

**Symptoms**: Prisma client can't connect to database

**Fix**: Run migrations before deploying (see section below)

---

## 🔧 Solution Steps

### Step 1: Get Database Connection Details

From your AWS Console or .env file, get:
- Database host/endpoint
- Database name
- Database username
- Database password

### Step 2: Get Redis Connection Details

From your AWS Console, get:
- Redis endpoint
- Redis port (usually 6379)

### Step 3: Update Task Definition

Add these environment variables to the task definition:

```bash
# Get current task definition
aws ecs describe-task-definition \
  --task-definition clubapp-backend-task:12 \
  --region us-east-1 \
  --query 'taskDefinition' \
  --output json > task-def.json

# Edit task-def.json and update the environment section:
# In containerDefinitions[0].environment, add:
{
  "name": "DATABASE_URL",
  "value": "postgresql://user:password@your-rds-endpoint:5432/clubapp"
},
{
  "name": "REDIS_URL", 
  "value": "redis://your-redis-endpoint:6379"
},
{
  "name": "JWT_SECRET",
  "value": "your-jwt-secret-key"
}

# Register updated task definition
aws ecs register-task-definition \
  --cli-input-json file://task-def.json \
  --region us-east-1
```

### Step 4: Force Deployment

```bash
aws ecs update-service \
  --cluster clubapp-dev-ecs \
  --service clubapp-dev-svc \
  --force-new-deployment \
  --region us-east-1
```

### Step 5: Monitor Logs

Once the task starts, check logs:
```bash
aws logs tail /ecs/clubapp-backend --follow
```

---

## 🎯 Task Definition Environment Template

Add these to `backend/task-definition.json`:

```json
"environment": [
  {
    "name": "NODE_ENV",
    "value": "production"
  },
  {
    "name": "LOG_LEVEL",
    "value": "info"
  },
  {
    "name": "PORT",
    "value": "3000"
  },
  {
    "name": "DATABASE_URL",
    "value": "postgresql://user:password@rds-endpoint:5432/clubapp"
  },
  {
    "name": "REDIS_URL",
    "value": "redis://redis-endpoint:6379"
  },
  {
    "name": "JWT_SECRET",
    "value": "your-production-secret-key"
  },
  {
    "name": "CORS_ORIGIN",
    "value": "https://yourdomain.com"
  }
]
```

---

## 📊 Debugging Checklist

- [ ] DATABASE_URL configured and pointing to accessible RDS
- [ ] REDIS_URL configured and pointing to accessible Redis
- [ ] JWT_SECRET set to production value
- [ ] Database exists and has schema
- [ ] Prisma migrations applied
- [ ] Task definition updated with env vars
- [ ] New task definition registered
- [ ] Service deployment forced
- [ ] CloudWatch logs checked for errors

---

## 🚀 Success Indicators

Once fixed, you should see in CloudWatch logs:
```
🚀 Server running on http://localhost:3000
📚 API docs: http://localhost:3000/api/docs
```

And service status will show:
```
Status: ACTIVE
Desired Count: 1
Running Count: 1  ✅
```

---

## What to Do Now

1. **Identify your database and Redis connection strings**
2. **Update task definition with these values**
3. **Register the new task definition**
4. **Force service deployment**
5. **Check CloudWatch logs for startup output**

Need help with any of these steps?
