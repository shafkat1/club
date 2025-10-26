# 🔐 GITHUB OIDC & DEPLOYMENT ROLES SETUP

This guide explains how to set up GitHub OIDC with separate IAM roles for Terraform and Deployment.

---

## 📋 OVERVIEW

You need **2 separate IAM roles**:

1. **`github-oidc-terraform-role`** - For infrastructure (Terraform)
2. **`github-oidc-deployment-role`** - For backend/web/mobile deployments

---

## 🔧 STEP 1: CREATE GITHUB OIDC PROVIDER (If Not Done)

```bash
# Create the OIDC provider
aws iam create-open-id-connect-provider \
  --url "https://token.actions.githubusercontent.com" \
  --client-id-list "sts.amazonaws.com" \
  --thumbprint-list "6938fd4d98bab03faadb97b34396831e3780aea1" \
  --region us-east-1

# Note the ARN that's returned (e.g., arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com)
```

---

## 🏗️ STEP 2: CREATE TERRAFORM ROLE (Already Done - Verify)

```bash
# Verify it exists
aws iam get-role --role-name github-oidc-terraform-role --region us-east-1

# If it exists, update trust policy
aws iam update-assume-role-policy \
  --role-name github-oidc-terraform-role \
  --policy-document file://terraform-trust-policy.json
```

**File: `terraform-trust-policy.json`**
```json
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
```

---

## 🚀 STEP 3: CREATE DEPLOYMENT ROLE (NEW)

### 3a. Create Trust Policy

Create file: `deployment-trust-policy.json`

```json
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
```

### 3b. Create the Role

```bash
aws iam create-role \
  --role-name github-oidc-deployment-role \
  --assume-role-policy-document file://deployment-trust-policy.json \
  --region us-east-1

echo "Role ARN: $(aws iam get-role --role-name github-oidc-deployment-role --query 'Role.Arn' --output text)"
```

---

## 📋 STEP 4: CREATE DEPLOYMENT PERMISSIONS POLICY

Create file: `deployment-policy.json`

```json
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
      "Action": [
        "iam:PassRole"
      ],
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
```

### Attach Policy to Role

```bash
aws iam put-role-policy \
  --role-name github-oidc-deployment-role \
  --policy-name deployment-policy \
  --policy-document file://deployment-policy.json \
  --region us-east-1
```

---

## ✅ STEP 5: UPDATE GITHUB SECRETS

Add these new secrets to GitHub (Settings > Secrets):

### Current Secrets (Keep These)
```
AWS_ROLE_TO_ASSUME = arn:aws:iam::425687053209:role/github-oidc-terraform-role
```

### New Secrets (Add These)
```
AWS_DEPLOYMENT_ROLE_TO_ASSUME = arn:aws:iam::425687053209:role/github-oidc-deployment-role
CLOUDFRONT_DISTRIBUTION_ID = E... (from Terraform output)
NEXT_PUBLIC_API_URL = https://api.desh.co (or your backend URL)
EXPO_TOKEN = (from Expo CLI)
EAS_PROJECT_ID = (from Expo)
```

---

## 🔄 STEP 6: UPDATE GITHUB WORKFLOWS

### Update Backend Deployment Workflow

**File: `.github/workflows/backend-deploy.yml`**

Change:
```yaml
- name: Configure AWS credentials via OIDC
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: ${{ secrets.AWS_ROLE_TO_ASSUME }}
    aws-region: ${{ env.AWS_REGION }}
```

To:
```yaml
- name: Configure AWS credentials via OIDC
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: ${{ secrets.AWS_DEPLOYMENT_ROLE_TO_ASSUME }}
    aws-region: ${{ env.AWS_REGION }}
```

### Update Web Deployment Workflow

**File: `.github/workflows/web-deploy.yml`**

Change:
```yaml
- name: Configure AWS credentials via OIDC
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: ${{ secrets.AWS_ROLE_TO_ASSUME }}
    aws-region: ${{ env.AWS_REGION }}
```

To:
```yaml
- name: Configure AWS credentials via OIDC
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: ${{ secrets.AWS_DEPLOYMENT_ROLE_TO_ASSUME }}
    aws-region: ${{ env.AWS_REGION }}
```

---

## 🧪 STEP 7: TEST THE SETUP

### Test Terraform Role
```bash
# This should work (Terraform permissions)
aws sts assume-role-with-web-identity \
  --role-arn arn:aws:iam::425687053209:role/github-oidc-terraform-role \
  --role-session-name test-session \
  --web-identity-token $(gh auth token)
```

### Test Deployment Role
```bash
# This should work (ECR/ECS/S3 permissions)
aws sts assume-role-with-web-identity \
  --role-arn arn:aws:iam::425687053209:role/github-oidc-deployment-role \
  --role-session-name test-session \
  --web-identity-token $(gh auth token)
```

---

## 📊 ROLE MATRIX

| Role | Terraform | ECR | ECS | S3 | CloudFront |
|------|-----------|-----|-----|-----|-----------|
| `github-oidc-terraform-role` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `github-oidc-deployment-role` | ❌ | ✅ | ✅ | ✅ | ✅ |

---

## 🚀 QUICK SETUP SCRIPT

```bash
#!/bin/bash

ACCOUNT_ID="425687053209"
REGION="us-east-1"

echo "Creating deployment role..."

# Create trust policy
cat > deployment-trust-policy.json << 'EOF'
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
EOF

# Create deployment policy
cat > deployment-policy.json << 'EOF'
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
      "Action": [
        "iam:PassRole"
      ],
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
EOF

# Create role
aws iam create-role \
  --role-name github-oidc-deployment-role \
  --assume-role-policy-document file://deployment-trust-policy.json \
  --region $REGION

# Attach policy
aws iam put-role-policy \
  --role-name github-oidc-deployment-role \
  --policy-name deployment-policy \
  --policy-document file://deployment-policy.json \
  --region $REGION

echo "✅ Deployment role created successfully!"
echo "Role ARN: arn:aws:iam::$ACCOUNT_ID:role/github-oidc-deployment-role"
```

---

## 🛡️ SECURITY BEST PRACTICES

✅ **Do:**
- Use separate roles for different purposes
- Limit permissions to only what's needed
- Regularly audit IAM policies
- Use resource-based conditions
- Rotate secrets regularly

❌ **Don't:**
- Use the same role for Terraform and deployments
- Grant overly broad permissions (e.g., `*:*`)
- Commit secrets to GitHub
- Share AWS credentials
- Use long-lived credentials

---

## 🔍 TROUBLESHOOTING

### Error: "not authorized to perform: ecr:GetAuthorizationToken"

**Cause**: Using wrong role (terraform role instead of deployment role)

**Fix**: 
```bash
# Update GitHub secret AWS_DEPLOYMENT_ROLE_TO_ASSUME
# Update workflow to use new secret
```

### Error: "User is not authorized to perform: ecs:UpdateService"

**Cause**: Deployment role missing ECS permissions

**Fix**:
```bash
# Re-run setup script to attach correct policy
aws iam put-role-policy \
  --role-name github-oidc-deployment-role \
  --policy-name deployment-policy \
  --policy-document file://deployment-policy.json
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] OIDC provider created in AWS
- [ ] `github-oidc-terraform-role` exists with Terraform policy
- [ ] `github-oidc-deployment-role` exists with deployment policy
- [ ] GitHub secrets added:
  - [ ] `AWS_ROLE_TO_ASSUME` (Terraform role)
  - [ ] `AWS_DEPLOYMENT_ROLE_TO_ASSUME` (Deployment role)
  - [ ] `CLOUDFRONT_DISTRIBUTION_ID`
  - [ ] `NEXT_PUBLIC_API_URL`
  - [ ] `EXPO_TOKEN`
  - [ ] `EAS_PROJECT_ID`
- [ ] Workflows updated to use `AWS_DEPLOYMENT_ROLE_TO_ASSUME`
- [ ] Test deployment workflow runs successfully

---

**Last Updated**: December 2024  
**Status**: Ready for Production 🚀
