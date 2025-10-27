# 🔧 ECR Authentication 403 Error Fix

## Problem
Docker push to ECR failed with:
```
error parsing HTTP 403 response body: unexpected end of JSON input: ""
```

This is a **403 Forbidden** error, meaning authentication credentials are either:
- ❌ Expired
- ❌ Invalid  
- ❌ Missing required permissions

## Root Causes

### 1. Expired AWS Credentials
If using temporary credentials (`AWS_SESSION_TOKEN`), they expire after 1 hour.

### 2. Invalid ECR Login Token
The ECR authentication token from `docker login` may be invalid or expired.

### 3. Missing ECR Permissions
The `github-actions-apprunner` role may lack ECR push permissions.

## Solutions

### Solution 1: Update Local AWS Credentials (If Testing Locally)

```bash
# Re-authenticate with AWS
aws configure --region us-east-1

# Get new ECR login credentials
aws ecr get-login-password --region us-east-1 | docker login \
  --username AWS \
  --password-stdin 425687053209.dkr.ecr.us-east-1.amazonaws.com

# Try pushing again
docker push 425687053209.dkr.ecr.us-east-1.amazonaws.com/clubapp-backend:latest
```

### Solution 2: Verify GitHub Actions Credentials

The workflow uses GitHub OIDC to assume the `github-actions-apprunner` role. Verify:

1. **Trust relationship is valid**:
```bash
aws iam get-role --role-name github-actions-apprunner
```

2. **Role has ECR permissions**:
```bash
aws iam get-role-policy --role-name github-actions-apprunner --policy-name github-actions-apprunner-inline
```

Should include:
```json
{
  "Effect": "Allow",
  "Action": [
    "ecr:GetAuthorizationToken",
    "ecr:PutImage",
    "ecr:InitiateLayerUpload",
    "ecr:UploadLayerPart",
    "ecr:CompleteLayerUpload",
    ...
  ],
  "Resource": "*"
}
```

### Solution 3: Force a New Workflow Run

If credentials in the GitHub Actions runner are stale:

1. Go to **GitHub > Actions > Deploy Backend to ECS**
2. Click **"Run workflow"**
3. Select **main** branch
4. Click **"Run workflow"** button

This will use fresh credentials from GitHub OIDC.

### Solution 4: Verify ECR Repository Exists

```bash
aws ecr describe-repositories \
  --repository-names clubapp-backend \
  --region us-east-1
```

Should return repository details. If not found, create it:
```bash
aws ecr create-repository \
  --repository-name clubapp-backend \
  --region us-east-1
```

## What We've Already Fixed

✅ **Trust Policy** - GitHub OIDC can authenticate
✅ **ECS Permissions** - Role can register task definitions and update services
✅ **Container Names** - Task definition container renamed to `web`
✅ **Workflow Config** - Using correct cluster/service names

## Verification Checklist

- [ ] AWS credentials are not expired (check `aws sts get-caller-identity`)
- [ ] GitHub OIDC trust relationship is valid
- [ ] `github-actions-apprunner` role has ECR permissions
- [ ] ECR repository `clubapp-backend` exists
- [ ] Workflow environment variables are correct (should use `clubapp-dev-svc` and `clubapp-dev-ecs`)
- [ ] Latest code is pushed to GitHub main branch

## Quick Fix for GitHub Actions

If the error happens in GitHub Actions, it's likely the OIDC session expired or failed. To fix:

1. **Manually trigger the workflow**:
   - Go to **GitHub Actions**
   - Select **"Deploy Backend to ECS"** workflow
   - Click **"Run workflow"** dropdown
   - Click **"Run workflow"**

2. **Or push a dummy commit**:
   ```bash
   git commit --allow-empty -m "trigger: Force workflow run"
   git push origin main
   ```

3. **Monitor the logs** for any authentication errors

## Expected Behavior After Fix

```
Step: Login to Amazon ECR ✅
Step: Build, tag, and push image to Amazon ECR ✅
  docker push ... DONE ✅
Step: Register task definition ✅
Step: Update ECS service ✅
Step: Wait for service to be stable ✅
```

## Debug Commands

If workflow still fails, check:

```bash
# Check role trust policy
aws iam get-role --role-name github-actions-apprunner \
  --query 'Role.AssumeRolePolicyDocument'

# Check role permissions
aws iam get-role-policy --role-name github-actions-apprunner \
  --policy-name github-actions-apprunner-inline

# Check ECR repository
aws ecr describe-repositories --repository-names clubapp-backend --region us-east-1

# List ECR images
aws ecr list-images --repository-name clubapp-backend --region us-east-1
```

## Next Steps

1. **For Local Testing**:
   - Update AWS credentials
   - Re-login to ECR
   - Try pushing manually

2. **For GitHub Actions**:
   - Verify OIDC trust is still valid
   - Manually trigger workflow
   - Check CloudWatch logs for errors

3. **If Still Failing**:
   - Check AWS account for any credential issues
   - Verify IAM role policies are intact
   - Check GitHub Actions logs for detailed error messages
