# 🚨 CRITICAL DEPLOYMENT ISSUES FOUND

## Status: DEPLOYMENT BLOCKED

Your backend is not running due to **two critical issues**:

---

## 🔴 Issue #1: Wrong Container Image (CRITICAL)

### Problem
The ECS service is configured to use **nginx:stable** instead of your backend application!

```
CannotPullContainerError: pull image manifest has been retried 7 time(s): 
failed to resolve ref public.ecr.aws/docker/library/nginx:stable
```

### Why This Happens
The service `clubapp-dev-svc` has an **old previous deployment** still active that references nginx.

### Solution
**Need to update service to use latest task definition with correct image:**
```bash
aws ecs update-service \
  --cluster clubapp-dev-ecs \
  --service clubapp-dev-svc \
  --task-definition clubapp-backend-task:7 \
  --force-new-deployment \
  --region us-east-1
```

---

## 🔴 Issue #2: Task Role Trust Relationship (CRITICAL)

### Problem
ECS cannot assume the task role:

```
ECS was unable to assume the role 'arn:aws:iam::425687053209:role/ecsTaskRole' 
that was provided for this task. Please verify that the role being passed has 
the proper trust relationship and permissions
```

### Why This Happens
The `ecsTaskRole` trust policy doesn't allow ECS to assume it.

### Solution

**Check if ecsTaskRole has proper trust relationship:**
```bash
aws iam get-role --role-name ecsTaskRole --query 'Role.AssumeRolePolicyDocument'
```

**If not, create or update the trust relationship:**
```bash
cat > /tmp/ecsTaskRole-trust.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

aws iam update-assume-role-policy-document \
  --role-name ecsTaskRole \
  --policy-document file:///tmp/ecsTaskRole-trust.json
```

---

## 📊 Current Service Status

```
Service: clubapp-dev-svc
Status: ACTIVE
Desired Count: 1
Running Count: 0 ❌ (not running)

Active Deployment:
  Task Definition: clubapp-backend-task:8 (NGINX - WRONG!)
  Desired: 0
  Running: 0
  Status: IN_PROGRESS (rollback in progress)

Primary Deployment:
  Task Definition: clubapp-backend-task:7 (CORRECT!)
  Desired: 1
  Running: 0
  Status: IN_PROGRESS

Errors:
  - Cannot pull nginx:stable (old deployment)
  - Cannot assume ecsTaskRole (trust policy issue)
```

---

## ✅ Immediate Action Required

### Step 1: Fix Task Role Trust Relationship (URGENT)

```bash
# Check current trust policy
aws iam get-role --role-name ecsTaskRole

# Create correct trust policy
cat > ecsTaskRole-trust.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Update the role
aws iam update-assume-role-policy-document \
  --role-name ecsTaskRole \
  --policy-document file://ecsTaskRole-trust.json
```

### Step 2: Force Update Service (URGENT)

```bash
aws ecs update-service \
  --cluster clubapp-dev-ecs \
  --service clubapp-dev-svc \
  --task-definition clubapp-backend-task:7 \
  --force-new-deployment \
  --region us-east-1
```

### Step 3: Verify Deployment

```bash
# Check service status
aws ecs describe-services \
  --cluster clubapp-dev-ecs \
  --services clubapp-dev-svc \
  --region us-east-1 \
  --query 'services[0].[status,desiredCount,runningCount]'

# Watch for changes
watch 'aws ecs describe-services --cluster clubapp-dev-ecs --services clubapp-dev-svc --region us-east-1 --query "services[0].[status,desiredCount,runningCount]"'
```

---

## 📋 Checklist to Fix

- [ ] Fix `ecsTaskRole` trust policy
- [ ] Force update service to use task definition 7
- [ ] Wait for tasks to start
- [ ] Verify backend is running

---

## 🎯 Expected Result After Fix

```
Service Status: ACTIVE
Desired Count: 1
Running Count: 1 ✅

Task Definition: clubapp-backend-task:7
Container: web
Image: 425687053209.dkr.ecr.us-east-1.amazonaws.com/clubapp-backend:latest
Port: 3000

Health Check: PASSING ✅
```

---

## 🔍 Why This Happened

1. **Old Service Configuration**: The service was created earlier with nginx as a test/placeholder
2. **Multiple Deployments**: There are now two deployments running:
   - Primary (revision 7): Your correct backend - PENDING
   - Active (revision 8): Old nginx - ROLLING BACK
3. **Task Role Issue**: The `ecsTaskRole` doesn't have the proper trust relationship to be assumed by ECS

---

## ⚠️ Important Notes

- The task definition (revision 7) is **CORRECT** ✅
- The container image is **CORRECT** ✅  
- The service configuration is **PARTIALLY WRONG** ❌
- The IAM trust relationship is **BROKEN** ❌

Once you fix these two issues, deployment will complete successfully!

---

## 🆘 If You Need Help

Run these diagnostic commands:

```bash
# Check service events (shows errors)
aws ecs describe-services --cluster clubapp-dev-ecs --services clubapp-dev-svc --region us-east-1 | jq '.services[0].events | head -5'

# Check task role
aws iam get-role --role-name ecsTaskRole

# Check task role trust
aws iam get-role --role-name ecsTaskRole --query 'Role.AssumeRolePolicyDocument'

# List task definitions
aws ecs list-task-definitions --family-prefix clubapp-backend --region us-east-1
```

**Status**: 🔴 **CRITICAL** - Fix required before deployment will work
