# GitHub Secrets Setup Guide

This guide explains how to configure all required secrets for the deployment pipelines to work.

## Required Secrets

### 1. AWS OIDC Role (Required for all deployments)
**Secret Name:** `AWS_DEPLOYMENT_ROLE_TO_ASSUME`

This is the IAM role ARN created for GitHub Actions OIDC authentication.

**Value:** `arn:aws:iam::425687053209:role/github-oidc-deployment-role`

**How to set it up:**
1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `AWS_DEPLOYMENT_ROLE_TO_ASSUME`
5. Value: `arn:aws:iam::425687053209:role/github-oidc-deployment-role`
6. Click "Add secret"

### 2. CloudFront Distribution ID (Required for web deployment)
**Secret Name:** `CLOUDFRONT_DISTRIBUTION_ID`

This is the CloudFront distribution ID where the web portal static files are served.

**Value:** Get from Terraform outputs:
```bash
cd infra/terraform
terraform output cloudfront_distribution_id
```

**Output from current deployment:**
```
E1XXXXXXXXXX (check your Terraform state for actual value)
```

**How to set it up:**
1. Go to GitHub Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `CLOUDFRONT_DISTRIBUTION_ID`
4. Value: `<paste-the-distribution-id-from-terraform>`
5. Click "Add secret"

### 3. Backend API URL (Required for web deployment)
**Secret Name:** `NEXT_PUBLIC_API_URL`

This is the URL of the backend API that the web portal and mobile app will connect to.

**Value:** `https://api.desh.co/api` (or your ALB DNS if domain isn't configured)

**From Terraform outputs (ALB DNS):**
```bash
cd infra/terraform
terraform output alb_dns_name
# Output: clubapp-dev-alb-505439685.us-east-1.elb.amazonaws.com
```

**How to set it up:**
1. Go to GitHub Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `NEXT_PUBLIC_API_URL`
4. Value: `https://clubapp-dev-alb-505439685.us-east-1.elb.amazonaws.com/api` (or your domain URL)
5. Click "Add secret"

## Setting Up All Secrets at Once

Visit: https://github.com/YOUR_REPO/settings/secrets/actions

And add these three secrets:

| Secret Name | Value | Notes |
|---|---|---|
| `AWS_DEPLOYMENT_ROLE_TO_ASSUME` | `arn:aws:iam::425687053209:role/github-oidc-deployment-role` | IAM role for AWS OIDC |
| `CLOUDFRONT_DISTRIBUTION_ID` | Get from `terraform output cloudfront_distribution_id` | CloudFront distribution ID |
| `NEXT_PUBLIC_API_URL` | `https://api.desh.co/api` or ALB DNS URL | Backend API endpoint |

## Verification

After adding the secrets, you can verify they're set correctly by:

1. Running a test deployment workflow
2. Checking the GitHub Actions logs - you should NOT see the actual secret values
3. Verifying the deployment succeeded

## Troubleshooting

### If deployment still fails:
1. Check GitHub Actions logs for the specific error
2. Verify all three secrets are present in Settings → Secrets
3. Ensure the IAM role ARN is correct
4. Confirm the CloudFront distribution ID exists in AWS
5. Test the API URL is accessible

### Getting Terraform outputs:
```bash
# Get all outputs
cd infra/terraform
terraform output -json

# Get specific output
terraform output cloudfront_distribution_id
terraform output alb_dns_name
terraform output s3_assets_bucket
```

## Next Steps

Once secrets are configured:
1. The web deployment pipeline will automatically deploy on commits to `main`
2. The mobile app will build and push to Expo EAS
3. The backend will deploy to ECS Fargate

You can monitor progress at: https://github.com/YOUR_REPO/actions
