# 🚨 Action Plan: Resolve 403 ECR Authentication Error

## Current Status
Your GitHub Actions workflow failed at the Docker push step with a **403 Forbidden** error from ECR.

## What We Know ✅
1. ✅ Workflow environment variables are correct (uses `clubapp-dev-ecs` and `clubapp-dev-svc`)
2. ✅ Trust policy is valid (GitHub OIDC can authenticate)
3. ✅ ECS permissions are added (can register task definitions)
4. ✅ Task definition is correct (container named `web`)
5. ✅ Role policy includes ECR permissions

## Why the 403 Error Occurred

The most likely causes:

### Cause 1: Expired Credentials (Most Likely)
- GitHub OIDC generates temporary credentials that expire
- If the workflow took too long or timed out, credentials may have expired
- The `AWS_SESSION_TOKEN` shown in logs indicates temporary credentials

### Cause 2: ECR Repository Issue
- ECR repository may not exist or permissions are restricted
- Docker daemon may not be authenticated to ECR

### Cause 3: Role Assumption Failed
- GitHub OIDC token validation failed
- Trust policy validation failed

## ✅ Recommended Solutions (In Order)

### Solution 1: Manually Trigger Workflow (Fastest)
This will use fresh GitHub OIDC credentials:

1. Go to **GitHub.com > Your Repo > Actions**
2. Select **"Deploy Backend to ECS"** workflow
3. Click **"Run workflow"** button (top right)
4. Select **main** branch
5. Click **"Run workflow"**

### Solution 2: Push a Test Commit
If manual trigger doesn't work:

```bash
git commit --allow-empty -m "test: trigger workflow"
git push origin main
```

### Solution 3: Verify ECR Repository Exists
Check if the ECR repository is created:

```bash
aws ecr describe-repositories \
  --repository-names clubapp-backend \
  --region us-east-1
```

If it doesn't exist, create it:
```bash
aws ecr create-repository \
  --repository-name clubapp-backend \
  --region us-east-1
```

### Solution 4: Verify IAM Role Permissions
Ensure the role still has all required permissions:

```bash
aws iam get-role-policy \
  --role-name github-actions-apprunner \
  --policy-name github-actions-apprunner-inline
```

Should output a policy with these ECR actions:
```
- ecr:GetAuthorizationToken
- ecr:PutImage
- ecr:InitiateLayerUpload
- ecr:UploadLayerPart
- ecr:CompleteLayerUpload
- ecr:GetDownloadUrlForLayer
- ecr:BatchGetImage
- ecr:BatchCheckLayerAvailability
- ecr:DescribeImages
- ecr:DescribeRepositories
```

## Step-by-Step Recovery Plan

### Step 1: Try Manual Workflow Trigger
```
GitHub > Actions > Deploy Backend to ECS > Run workflow > main > Run
```

Wait 2-3 minutes and check if it succeeds.

### Step 2: If Still Failing, Check ECR Repository
```bash
# Verify repository exists
aws ecr describe-repositories --repository-names clubapp-backend --region us-east-1

# If not found, create it
aws ecr create-repository --repository-name clubapp-backend --region us-east-1
```

### Step 3: Verify IAM Role
```bash
# Check trust policy
aws iam get-role --role-name github-actions-apprunner

# Check permissions
aws iam get-role-policy --role-name github-actions-apprunner --policy-name github-actions-apprunner-inline
```

### Step 4: Check CloudWatch Logs
```bash
# View latest logs
aws logs tail /ecs/clubapp-backend --follow
```

### Step 5: Try Manual Docker Push (Local Testing)
If you want to test locally:

```bash
# Update AWS credentials
aws configure --region us-east-1

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login \
  --username AWS \
  --password-stdin 425687053209.dkr.ecr.us-east-1.amazonaws.com

# Build and push
cd backend
docker build -t 425687053209.dkr.ecr.us-east-1.amazonaws.com/clubapp-backend:latest .
docker push 425687053209.dkr.ecr.us-east-1.amazonaws.com/clubapp-backend:latest
```

## Expected Success Indicators

After fix, you should see:
✅ "Step: Build, tag, and push image to Amazon ECR" - **PASS**
✅ "Step: Register task definition" - **PASS**
✅ "Step: Update ECS service" - **PASS**
✅ Service showing Running Count = 1

## Configuration Summary

| Component | Value | Status |
|-----------|-------|--------|
| AWS Account | 425687053209 | ✅ |
| Region | us-east-1 | ✅ |
| ECR Repository | clubapp-backend | ⚠️ Verify |
| ECS Cluster | clubapp-dev-ecs | ✅ |
| ECS Service | clubapp-dev-svc | ✅ |
| Task Definition | clubapp-backend-task | ✅ |
| GitHub OIDC Role | github-actions-apprunner | ✅ |
| Trust Policy | Valid | ✅ |
| ECR Permissions | Added | ✅ |
| Task Container Name | web | ✅ |

## Quick Reference Commands

```bash
# Check all prerequisites
aws ecr describe-repositories --repository-names clubapp-backend --region us-east-1

# Verify role
aws iam get-role --role-name github-actions-apprunner

# View latest logs
aws logs tail /ecs/clubapp-backend --follow

# Check service status
aws ecs describe-services --cluster clubapp-dev-ecs --services clubapp-dev-svc --region us-east-1

# List recent images
aws ecr list-images --repository-name clubapp-backend --region us-east-1
```

## Immediate Action Required

**Try this first:**

1. Open GitHub > Actions > Deploy Backend to ECS
2. Click the **"Run workflow"** button on the right
3. Select **main** branch  
4. Click **"Run workflow"**
5. Watch the logs for any errors

This will create a new workflow run with fresh credentials. If it succeeds, the issue was expired credentials.

---

If this doesn't work, run the verification commands above and let me know what you find.
