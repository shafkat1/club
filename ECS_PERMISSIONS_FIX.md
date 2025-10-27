# ✅ ECS Permissions Fix for GitHub Actions Role

## Problem
GitHub Actions workflow was failing with:
```
AccessDeniedException: User is not authorized to perform: ecs:RegisterTaskDefinition
```

The `github-actions-apprunner` role was missing ECS permissions needed for deployments.

## Solution
Updated the `github-actions-apprunner-inline` policy to include:

### Added ECS Permissions
```json
{
  "Effect": "Allow",
  "Action": [
    "ecs:RegisterTaskDefinition",
    "ecs:UpdateService",
    "ecs:DescribeServices",
    "ecs:DescribeTaskDefinition",
    "ecs:DescribeTasks",
    "ecs:ListTasks"
  ],
  "Resource": "*"
}
```

## What This Enables

| Permission | Purpose |
|-----------|---------|
| `ecs:RegisterTaskDefinition` | Register new ECS task definitions |
| `ecs:UpdateService` | Update ECS services with new task definitions |
| `ecs:DescribeServices` | Get service details |
| `ecs:DescribeTaskDefinition` | Get task definition information |
| `ecs:DescribeTasks` | Get task status and details |
| `ecs:ListTasks` | List running tasks |

## Role Permissions Summary
The `github-actions-apprunner` role now has permissions for:

✅ **ECR Operations** - Push/pull Docker images
✅ **ECS Operations** - Register task definitions and update services
✅ **App Runner** - Create and update services
✅ **IAM PassRole** - Assume execution roles
✅ **CloudFormation** - Create/update stacks
✅ **S3, DynamoDB, Lambda, API Gateway, CloudFront** - Full access for various deployments

## How to Use

1. **Push your Docker image to ECR** (handled by docker build step)
2. **GitHub Actions assumes the role** (via OIDC trust policy)
3. **Workflow registers new task definition** with `aws ecs register-task-definition`
4. **Workflow updates ECS service** to use new task definition
5. **ECS pulls image and deploys** to your cluster

## Testing the Fix

Your GitHub Actions workflow should now successfully:
- ✅ Register task definitions
- ✅ Update ECS services
- ✅ Deploy backend to ECS

## Command Used
```bash
aws iam put-role-policy \
  --role-name github-actions-apprunner \
  --policy-name github-actions-apprunner-inline \
  --policy-document file://github-actions-apprunner-policy.json
```
