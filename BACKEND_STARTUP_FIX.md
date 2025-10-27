# 🔧 Backend Startup Issue - Database Connection Fix

## Problem Identified

The backend task is failing to start because:

1. **Prisma Service** requires a database connection on module initialization
2. **Task definition** is missing the `DATABASE_URL` environment variable
3. **Application exits** with code 1 if database connection fails
4. **Health check fails** because the container never reaches a healthy state

## Root Cause

In `backend/src/common/services/prisma.service.ts`:

```typescript
async onModuleInit() {
  try {
    await this.$connect();  // ← Tries to connect to DATABASE_URL
    this.logger.log('✅ Database connected');
  } catch (error) {
    this.logger.error('❌ Database connection failed', error);
    process.exit(1);  // ← Exits if connection fails
  }
}
```

## Solution

Add database environment variables to the ECS task definition. You need:

### Option 1: RDS (Recommended for Production)

If you have an RDS database:

```json
{
  "name": "DATABASE_URL",
  "value": "postgresql://username:password@rds-endpoint:5432/database_name"
}
```

**Format**: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`

Example:
```
postgresql://admin:mypassword123@mydb.c123456.us-east-1.rds.amazonaws.com:5432/clubapp_db
```

### Option 2: Local/Docker Database

If using a containerized database, you'd need to either:
- Add a second container to the task definition
- Use RDS instead (recommended)

## How to Update the Task Definition

### Via AWS Console:

1. Go to **ECS > Task Definitions > clubapp-backend-task**
2. Click **Create new revision**
3. Find the container definition "web"
4. Scroll to **Environment variables**
5. Add:
   - **Key**: `DATABASE_URL`
   - **Value**: `postgresql://user:pass@host:5432/db`
6. Click **Create**
7. Go back to the service and update it to use the new task definition

### Via AWS CLI:

First, save the current task definition:
```bash
aws ecs describe-task-definition \
  --task-definition clubapp-backend-task:12 \
  --region us-east-1 \
  --query 'taskDefinition' > task-def.json
```

Edit the JSON to add DATABASE_URL to containerDefinitions[0].environment:

```json
{
  "name": "DATABASE_URL",
  "value": "postgresql://user:pass@host:5432/db"
}
```

Then register the new version:
```bash
aws ecs register-task-definition \
  --cli-input-json file://task-def.json \
  --region us-east-1
```

Finally, update the service:
```bash
aws ecs update-service \
  --cluster clubapp-dev-ecs \
  --service clubapp-dev-svc \
  --task-definition clubapp-backend-task \
  --force-new-deployment \
  --region us-east-1
```

## What You Need to Provide

To fix this, I need to know:

1. **Do you have an RDS database?**
   - If YES: What is the RDS endpoint, username, password, and database name?
   - If NO: What database are you using? (PostgreSQL, MySQL, etc.)

2. **What other environment variables does your backend need?**
   - Redis connection string?
   - API keys?
   - Third-party service credentials?

## After Fixing Database Connection

Once DATABASE_URL is added:

1. ✅ Prisma will connect to database on startup
2. ✅ Container will initialize properly
3. ✅ Health check `/health` endpoint will respond
4. ✅ Task will transition to RUNNING
5. ✅ Service will show running count = 1
6. ✅ Backend deployment complete!

## Current Status

| Component | Status |
|-----------|--------|
| Docker image | ✅ Pulls successfully |
| VPC connectivity | ✅ Can reach ECR/CloudWatch |
| Security groups | ✅ Configured |
| Health endpoint | ✅ Exists at `/health` |
| Database URL | ❌ **MISSING** - This is the blocker |
| Application startup | ❌ Fails due to missing DATABASE_URL |

## Quick Checklist

- [ ] Identify your database (RDS, self-hosted, etc.)
- [ ] Get database connection string
- [ ] Update task definition with DATABASE_URL
- [ ] Force service deployment
- [ ] Verify running count = 1
- [ ] Test `/health` endpoint

**Once you provide your database details, I can help you update the task definition and complete the deployment!**
