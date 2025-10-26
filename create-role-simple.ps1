#!/usr/bin/env pwsh

$ErrorActionPreference = "Stop"

$roleName = "github-oidc-deployment-role"
$policyName = "deployment-policy"
$region = "us-east-1"
$workdir = "C:\ai4\club"

cd $workdir

Write-Host "=" * 50
Write-Host "Creating GitHub OIDC Deployment Role" -ForegroundColor Cyan
Write-Host "=" * 50
Write-Host ""

# Step 1: Create trust policy file
Write-Host "Step 1: Creating trust policy file..."
$trustPolicy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::425687053209:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": "repo:shafkat1/club:ref:refs/heads/main"
        }
      }
    }
  ]
}
"@

Set-Content -Path "trust-policy.json" -Value $trustPolicy -Encoding UTF8
Write-Host "  Created trust-policy.json" -ForegroundColor Green

# Step 2: Create deployment policy file
Write-Host "Step 2: Creating deployment policy file..."
$deploymentPolicy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ECRAccess",
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:CreateRepository",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload",
        "ecr:DescribeRepositories",
        "ecr:ListImages"
      ],
      "Resource": "*"
    },
    {
      "Sid": "ECSDeployment",
      "Effect": "Allow",
      "Action": [
        "ecs:UpdateService",
        "ecs:DescribeServices",
        "ecs:DescribeTaskDefinition",
        "ecs:DescribeTasks",
        "ecs:ListTasks",
        "ecs:RegisterTaskDefinition"
      ],
      "Resource": "*"
    },
    {
      "Sid": "S3WebDeployment",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::clubapp-dev-web-assets",
        "arn:aws:s3:::clubapp-dev-web-assets/*"
      ]
    },
    {
      "Sid": "CloudFrontInvalidation",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:ListInvalidations",
        "cloudfront:GetDistribution"
      ],
      "Resource": "*"
    },
    {
      "Sid": "IAMPassRole",
      "Effect": "Allow",
      "Action": ["iam:PassRole"],
      "Resource": [
        "arn:aws:iam::425687053209:role/ecsTaskExecutionRole",
        "arn:aws:iam::425687053209:role/ecsTaskRole"
      ]
    },
    {
      "Sid": "CloudWatchLogs",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:us-east-1:425687053209:log-group:/ecs/*"
    }
  ]
}
"@

Set-Content -Path "deployment-policy.json" -Value $deploymentPolicy -Encoding UTF8
Write-Host "  Created deployment-policy.json" -ForegroundColor Green

# Step 3: Create the role
Write-Host "Step 3: Creating IAM role '$roleName'..."
try {
  $result = aws iam create-role `
    --role-name $roleName `
    --assume-role-policy-document file://trust-policy.json `
    --region $region `
    2>&1

  if ($LASTEXITCODE -eq 0) {
    Write-Host "  Role created successfully!" -ForegroundColor Green
  } else {
    Write-Host "  ERROR: $result" -ForegroundColor Red
    exit 1
  }
} catch {
  Write-Host "  Exception: $_" -ForegroundColor Red
  exit 1
}

# Step 4: Attach the policy
Write-Host "Step 4: Attaching deployment policy..."
try {
  $result = aws iam put-role-policy `
    --role-name $roleName `
    --policy-name $policyName `
    --policy-document file://deployment-policy.json `
    --region $region `
    2>&1

  if ($LASTEXITCODE -eq 0) {
    Write-Host "  Policy attached successfully!" -ForegroundColor Green
  } else {
    Write-Host "  ERROR: $result" -ForegroundColor Red
    exit 1
  }
} catch {
  Write-Host "  Exception: $_" -ForegroundColor Red
  exit 1
}

# Step 5: Get the role ARN
Write-Host "Step 5: Retrieving role ARN..."
try {
  $roleArn = aws iam get-role `
    --role-name $roleName `
    --query 'Role.Arn' `
    --output text `
    --region $region `
    2>&1

  if ($LASTEXITCODE -eq 0) {
    Write-Host "  Role ARN retrieved successfully!" -ForegroundColor Green
  } else {
    Write-Host "  ERROR: $roleArn" -ForegroundColor Red
    exit 1
  }
} catch {
  Write-Host "  Exception: $_" -ForegroundColor Red
  exit 1
}

# Display results
Write-Host ""
Write-Host "=" * 50 -ForegroundColor Green
Write-Host "DEPLOYMENT ROLE CREATED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Green
Write-Host ""
Write-Host "Role Name: $roleName" -ForegroundColor Cyan
Write-Host "Role ARN:  $roleArn" -ForegroundColor Yellow
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Go to: https://github.com/shafkat1/club/settings/secrets/actions"
Write-Host "2. Click: New repository secret"
Write-Host "3. Add Secret:"
Write-Host "   Name:  AWS_DEPLOYMENT_ROLE_TO_ASSUME"
Write-Host "   Value: $roleArn"
Write-Host ""
