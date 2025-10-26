# AWS Credentials Setup Guide

Your AWS CLI is not configured. Follow these steps to set it up and create the deployment role.

## Step 1: Get Your AWS Credentials

You need your AWS Access Key ID and Secret Access Key. These should be in your AWS console or email.

Go to: **AWS Console > IAM > Users > Your User > Security Credentials**

Copy:
- Access Key ID: `AKIA...`
- Secret Access Key: `wJal...`

## Step 2: Configure AWS CLI

Run this command and enter your credentials:

```powershell
aws configure --region us-east-1
```

When prompted:
```
AWS Access Key ID [None]: PASTE_YOUR_ACCESS_KEY_ID
AWS Secret Access Key [None]: PASTE_YOUR_SECRET_ACCESS_KEY
Default region name [None]: us-east-1
Default output format [None]: json
```

## Step 3: Verify Configuration

```powershell
aws sts get-caller-identity
```

Should show your AWS Account ID: `425687053209`

## Step 4: Create the Deployment Role

Once AWS CLI is configured, the policy files are ready. Run:

```powershell
# Create the role
aws iam create-role `
  --role-name github-oidc-deployment-role `
  --assume-role-policy-document file://deployment-trust-policy.json `
  --region us-east-1

# Attach the policy
aws iam put-role-policy `
  --role-name github-oidc-deployment-role `
  --policy-name deployment-policy `
  --policy-document file://deployment-policy.json `
  --region us-east-1

# Get the role ARN (copy this value!)
aws iam get-role `
  --role-name github-oidc-deployment-role `
  --query 'Role.Arn' `
  --output text `
  --region us-east-1
```

## Step 5: Add to GitHub Secrets

1. Go to: **https://github.com/shafkat1/club/settings/secrets/actions**
2. Click: **New repository secret**
3. Name: `AWS_DEPLOYMENT_ROLE_TO_ASSUME`
4. Value: Paste the role ARN from Step 4
5. Click: **Add secret**

## Done! ✅

Once the secret is added:
- All workflows will have AWS access
- Backend can deploy to ECS
- Web portal can upload to S3
- Mobile can build via Expo
