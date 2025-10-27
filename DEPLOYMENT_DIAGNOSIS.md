# 🔍 Backend Deployment Diagnosis

## Current Status
- ✅ Docker image built and pushed to ECR
- ✅ VPC endpoints created
- ✅ Security group configured
- ✅ Task Definition is correct (includes /health endpoint)
- ❌ Container stuck in PENDING state - not transitioning to RUNNING

---

## Analysis: Why Container Isn't Starting

### ✅ What's Correct:
1. **Health Endpoint** - `/health` controller exists and is registered in AppModule
2. **Task Definition** - Properly configured with all environment variables
3. **Health Check** - Configured correctly (30s interval, 60s startup grace period)
4. **Port** - Listening on 3000
5. **Logging** - CloudWatch Logs configuration is correct

### 🔴 Possible Issues (in order of likelihood):

#### Issue 1: Missing Environment Variables (MOST LIKELY)
The task definition only has 3 env vars:
- `NODE_ENV=production`
- `LOG_LEVEL=info`
- `PORT=3000`

**But your app might need:**
- `DATABASE_URL` - Prisma database connection
- `JWT_SECRET` - JWT token signing secret
- `REDIS_URL` - Redis connection (if using caching)
- `AWS_REGION` - AWS region for S3
- Other service credentials

**Check**: Does your `.env` file have additional variables your app needs?

#### Issue 2: Database Connection Failure
The PrismaService is a global provider. If database connection fails, entire app crashes.

**Check**: Is RDS running? Is database accessible from ECS VPC?

#### Issue 3: Container Image Issues
The Docker image might be missing required dependencies.

**Check**: Does the Dockerfile install all npm dependencies?

#### Issue 4: Node.js Startup Error
The app might have TypeScript or Node errors preventing startup.

**Check**: Did the Docker build complete without errors?

---

## Debugging Steps

### Step 1: Create Log Group (Manual)
The log group doesn't exist yet because the container never started. Create it:

```bash
aws logs create-log-group \
  --log-group-name /ecs/clubapp-backend \
  --region us-east-1
```

### Step 2: Check Task Logs Once Available
Once a task runs:

```bash
aws logs tail /ecs/clubapp-backend --follow
```

### Step 3: Check Container Exit Reason
```bash
aws ecs describe-tasks \
  --cluster clubapp-dev-ecs \
  --tasks arn:aws:ecs:us-east-1:425687053209:task/clubapp-dev-ecs/TASK_ID \
  --region us-east-1 \
  --query 'tasks[0].containers[0].[lastStatus,reason,exitCode]'
```

### Step 4: Get Latest Task
```bash
aws ecs list-tasks \
  --cluster clubapp-dev-ecs \
  --service-name clubapp-dev-svc \
  --region us-east-1 \
  --query 'taskArns[0]' \
  --output text
```

---

## ✅ What to Fix

### Option 1: Add Missing Environment Variables (Recommended)
Update the task definition to include all env vars your app needs:

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
    "value": "YOUR_DATABASE_URL_HERE"
  },
  {
    "name": "JWT_SECRET",
    "value": "YOUR_JWT_SECRET_HERE"
  }
]
```

### Option 2: Use AWS Secrets Manager
Instead of plain env vars, use AWS Secrets Manager for sensitive data:

```json
"secrets": [
  {
    "name": "DATABASE_URL",
    "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT:secret:database-url"
  },
  {
    "name": "JWT_SECRET",
    "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT:secret:jwt-secret"
  }
]
```

---

## 📋 Questions to Answer

1. **Does your app need a database?** If yes, what's the connection string?
2. **Does your app need Redis?** If yes, what's the Redis URL?
3. **Does your app need any API keys or secrets?** If yes, what are they?
4. **Does the Dockerfile have all dependencies installed?**
5. **Did the Docker build complete successfully?**

---

## Next Steps

1. **Check your `.env` file** - See what environment variables your app expects
2. **Update task definition** with those variables
3. **Register new task definition** revision
4. **Force ECS service deployment**
5. **Monitor CloudWatch logs** for startup errors

---

## Command to Force New Deployment After Updating Env Vars

```bash
# After updating task-definition.json with missing env vars:

# 1. Register new task definition
aws ecs register-task-definition \
  --cli-input-json file://backend/task-definition.json \
  --region us-east-1

# 2. Force service deployment
aws ecs update-service \
  --cluster clubapp-dev-ecs \
  --service clubapp-dev-svc \
  --force-new-deployment \
  --region us-east-1

# 3. Wait and check
sleep 30
aws ecs describe-services \
  --cluster clubapp-dev-ecs \
  --services clubapp-dev-svc \
  --region us-east-1 \
  --query 'services[0].[status,desiredCount,runningCount]'
```

---

## 🎯 Most Likely Solution

**Add these to task-definition.json:**
```json
"environment": [
  {
    "name": "DATABASE_URL",
    "value": "YOUR_POSTGRES_CONNECTION_STRING"
  },
  {
    "name": "JWT_SECRET",
    "value": "your-secret-key-here"
  }
]
```

The app is probably failing on startup because it can't connect to the database or a critical service.
