# CREATE DEPLOYMENT ROLE - FINAL GUIDE

## Status
✅ AWS Credentials Working
✅ AWS Account: 425687053209
✅ User: shafkat
✅ Ready to create deployment role

---

## Step-by-Step: Create Deployment Role

###  Step 1: Verify AWS CLI Works

Run this to confirm:
```powershell
aws sts get-caller-identity
```

You should see:
```json
{
    "UserId": "...",
    "Account": "425687053209",
    "Arn": "arn:aws:iam::425687053209:user/shafkat"
}
```

✅ If this works, proceed to Step 2

---

### Step 2: Create Policy Files

Run this command from `C:\ai4\club`:

```powershell
# Create trust policy
@'
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
'@ | Out-File -FilePath trust-policy.json -Encoding UTF8

Write-Host "Trust policy file created"
```

---

### Step 3: Create Deployment Policy File

```powershell
@'
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
'@ | Out-File -FilePath deployment-policy.json -Encoding UTF8

Write-Host "Deployment policy file created"
```

---

### Step 4: Create the IAM Role

```powershell
aws iam create-role `
  --role-name github-oidc-deployment-role `
  --assume-role-policy-document file://trust-policy.json `
  --region us-east-1

Write-Host "Role created!"
```

If you see no output, the role was created successfully!

---

### Step 5: Attach the Deployment Policy

```powershell
aws iam put-role-policy `
  --role-name github-oidc-deployment-role `
  --policy-name deployment-policy `
  --policy-document file://deployment-policy.json `
  --region us-east-1

Write-Host "Policy attached!"
```

---

### Step 6: Get the Role ARN

```powershell
$roleArn = aws iam get-role `
  --role-name github-oidc-deployment-role `
  --query 'Role.Arn' `
  --output text `
  --region us-east-1

Write-Host "Role ARN: $roleArn"
```

**Copy this ARN - you'll need it next!**

Example output:
```
arn:aws:iam::425687053209:role/github-oidc-deployment-role
```

---

## Step 7: Add to GitHub Secrets

1. Go to: **https://github.com/shafkat1/club/settings/secrets/actions**
2. Click: **New repository secret**
3. Fill in:
   - **Name:** `AWS_DEPLOYMENT_ROLE_TO_ASSUME`
   - **Value:** Paste the ARN from Step 6
4. Click: **Add secret**

---

## Verify Everything Works

Run these to verify:

```powershell
# Test 1: Role exists
aws iam get-role --role-name github-oidc-deployment-role --region us-east-1

# Test 2: Policy is attached
aws iam list-role-policies --role-name github-oidc-deployment-role --region us-east-1
```

Both should return successfully!

---

## Alternative: Use the Script

You can also run the automatic script:

```powershell
cd C:\ai4\club
powershell -ExecutionPolicy Bypass -File create-role-simple.ps1
```

This does all steps 2-6 automatically.

---

**Once the GitHub Secret is added, your deployment pipelines will be ready to go!** 🚀
