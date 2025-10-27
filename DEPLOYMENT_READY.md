# ✅ Backend Deployment Ready!

## What Was Fixed

### 1. ✅ AWS Trust Policy
- **Status**: Fixed
- **Issue**: Policy contained prohibited `Resource` field
- **Solution**: Updated trust policy for GitHub OIDC authentication
- **Result**: GitHub Actions can now assume `github-actions-apprunner` role

### 2. ✅ ECS Permissions
- **Status**: Fixed
- **Issue**: Role lacked `ecs:RegisterTaskDefinition` permission
- **Solution**: Added ECS statement to role policy with permissions:
  - `ecs:RegisterTaskDefinition`
  - `ecs:UpdateService`
  - `ecs:DescribeServices`
  - `ecs:DescribeTaskDefinition`
  - `ecs:DescribeTasks`
  - `ecs:ListTasks`
- **Result**: GitHub Actions can now deploy to ECS

### 3. ✅ Cluster & Service Names
- **Status**: Fixed
- **Issue**: Workflow referenced non-existent cluster/service names
- **Solution**: Created correct GitHub Actions workflow with actual AWS resources:
  - `ECS_CLUSTER: clubapp-dev-ecs` (was: `clubapp-dev-cluster`)
  - `ECS_SERVICE: clubapp-dev-svc` (was: `clubapp-backend-service`)
  - `ECS_TASK_DEFINITION: clubapp-backend-task` ✅

## Current Infrastructure

```
AWS Account: 425687053209
Region: us-east-1

✅ ECR Repository:     clubapp-backend
✅ ECS Cluster:        clubapp-dev-ecs
✅ ECS Service:        clubapp-dev-svc
✅ Task Definition:    clubapp-backend-task (revision 2)
✅ Task Role:          ecsTaskRole
✅ Execution Role:     ecsTaskExecutionRole
✅ Log Group:          /ecs/clubapp-backend
```

## Deployment Workflow

Created: `.github/workflows/deploy-backend.yml`

### Triggers
- Pushes to `main` branch
- Only if files in `backend/**` or workflow file changes

### Steps
1. **Checkout** - Get latest code
2. **AWS Auth** - Assume `github-actions-apprunner` role via OIDC
3. **ECR Login** - Get credentials for image push
4. **Build & Push** - Build Docker image and push to ECR with both:
   - `latest` tag
   - Commit SHA tag
5. **Register Task** - Register new ECS task definition
6. **Update Service** - Update ECS service to use new task definition
7. **Wait** - Wait for service to reach stable state (up to 10 min)
8. **Status** - Display final service status

## How to Deploy

### Option 1: Automatic (Recommended)
```bash
# Just push changes to backend
git add backend/
git commit -m "Update backend"
git push origin main
# GitHub Actions will automatically deploy!
```

### Option 2: Manual (Testing)
```bash
# From backend directory
cd backend

# Build image
docker build -t 425687053209.dkr.ecr.us-east-1.amazonaws.com/clubapp-backend:latest .

# Login to ECR (requires AWS credentials)
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 425687053209.dkr.ecr.us-east-1.amazonaws.com

# Push image
docker push 425687053209.dkr.ecr.us-east-1.amazonaws.com/clubapp-backend:latest

# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json --region us-east-1

# Update service
aws ecs update-service \
  --cluster clubapp-dev-ecs \
  --service clubapp-dev-svc \
  --task-definition clubapp-backend-task \
  --region us-east-1

# Wait for deployment
aws ecs wait services-stable \
  --cluster clubapp-dev-ecs \
  --services clubapp-dev-svc \
  --region us-east-1
```

## Verify Deployment

```bash
# Check service status
aws ecs describe-services \
  --cluster clubapp-dev-ecs \
  --services clubapp-dev-svc \
  --region us-east-1 \
  --query 'services[0].[status,desiredCount,runningCount]' \
  --output table

# Check running tasks
aws ecs list-tasks \
  --cluster clubapp-dev-ecs \
  --service-name clubapp-dev-svc \
  --region us-east-1

# Check logs
aws logs tail /ecs/clubapp-backend --follow
```

## Environment Variables (Workflow)
```yaml
AWS_REGION: us-east-1
ECR_REGISTRY: 425687053209.dkr.ecr.us-east-1.amazonaws.com
ECR_REPOSITORY: clubapp-backend
ECS_SERVICE: clubapp-dev-svc
ECS_CLUSTER: clubapp-dev-ecs
ECS_TASK_DEFINITION: clubapp-backend-task
```

## Backend Health Check

The task definition includes a health check:
```bash
curl -f http://localhost:3000/health || exit 1
```

Make sure your backend exposes a `/health` endpoint that returns 2xx status.

## Troubleshooting

### Task fails to start
1. Check CloudWatch logs: `/ecs/clubapp-backend`
2. Verify image exists in ECR
3. Check task execution role has proper permissions

### Service doesn't update
1. Verify task definition registered successfully
2. Check service IAM permissions
3. Run: `aws ecs describe-services --cluster clubapp-dev-ecs --services clubapp-dev-svc --region us-east-1`

### Image pull fails
1. Verify ECR repository exists
2. Check ecsTaskExecutionRole has `ecr:GetDownloadUrlForLayer` and `ecr:BatchGetImage`
3. Verify image is pushed: `aws ecr list-images --repository-name clubapp-backend --region us-east-1`

## Next Steps

1. ✅ Push backend changes to trigger deployment
2. ✅ Monitor GitHub Actions workflow
3. ✅ Check CloudWatch logs for any issues
4. ✅ Verify service is running: `aws ecs describe-services ...`
5. ✅ Test API endpoint

You're all set! 🚀
