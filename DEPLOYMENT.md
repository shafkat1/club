# Deployment Guide

This guide walks through setting up the entire infrastructure for the Club app.

## Prerequisites
- AWS account with admin/PowerUser credentials
- Terraform >= 1.8.5
- GitHub repository: `https://github.com/shafkat1/club`
- Domain: `desh.co` (in GoDaddy, transfer in progress or completed)

## Step 1: Bootstrap Terraform State (One-time)

Create the S3 bucket and DynamoDB table to store Terraform state.

### Option A: Using AWS CLI (Recommended)
```bash
# Set your AWS profile if needed
export AWS_PROFILE=your-profile

# Create S3 bucket
aws s3api create-bucket \
  --bucket clubapp-dev-tfstate \
  --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket clubapp-dev-tfstate \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket clubapp-dev-tfstate \
  --server-side-encryption-configuration '{
    "Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}}]
  }'

# Create DynamoDB lock table
aws dynamodb create-table \
  --table-name clubapp-dev-tfstate-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### Option B: Using Terraform (Advanced)
Manually create a temporary `bootstrap.tf` with S3/DynamoDB resources, run `terraform init && terraform apply`, then delete the file.

---

## Step 2: Initialize Terraform

```bash
cd infra/terraform

# Initialize (pulls providers and connects to S3 backend)
terraform init

# Verify (should show no errors)
terraform validate
```

---

## Step 3a: Plan (Development without Custom Domain)

Before transferring DNS to Route 53, apply with `enable_domain=false`:

```bash
terraform plan \
  -var "project=clubapp" \
  -var "environment=dev" \
  -var "aws_region=us-east-1" \
  -var "domain_name=desh.co" \
  -var "enable_domain=false" \
  -out tfplan-dev
```

Review the plan. Expected resources:
- VPC, subnets, IGW, NAT
- RDS PostgreSQL (multi-AZ)
- DynamoDB tables
- ElastiCache Redis
- S3 buckets (assets, receipts, logs)
- ACM certificates (for both assets.desh.co and api.desh.co)
- ECS cluster, ALB, CloudFront
- IAM roles, Secrets Manager, KMS

---

## Step 3b: Apply Infrastructure

```bash
terraform apply tfplan-dev
```

Wait ~10 minutes for RDS multi-AZ and ElastiCache to be ready.

---

## Step 4: Retrieve ACM Validation CNAMEs for GoDaddy

```bash
terraform output -json acm_validation_cnames | jq .
```

Output will look like:
```json
{
  "assets": {
    "domain": "assets.desh.co",
    "name": "_abc123def456.assets.desh.co",
    "value": "_xyz789abc.acm-validations.aws."
  },
  "api": {
    "domain": "api.desh.co",
    "name": "_lmn456opq789.api.desh.co",
    "value": "_rst012uvw.acm-validations.aws."
  }
}
```

### Add to GoDaddy DNS

Go to GoDaddy → desh.co → DNS → Add 2 CNAME records:

1. **Assets cert validation**
   - Type: CNAME
   - Host: `_abc123def456.assets.desh.co` (the **name** from output)
   - Points to: `_xyz789abc.acm-validations.aws.` (the **value** from output, with or without trailing dot)

2. **API cert validation**
   - Type: CNAME
   - Host: `_lmn456opq789.api.desh.co` (the **name** from output)
   - Points to: `_rst012uvw.acm-validations.aws.` (the **value** from output)

Save. Certificates validate automatically within ~5 minutes.

---

## Step 5: Set Up GitHub OIDC for CI/CD

Run the setup script:

```bash
bash infra/scripts/setup-github-oidc.sh shafkat1/club us-east-1
```

This creates an IAM role and outputs the role ARN. Follow the on-screen instructions:

1. Go to: `https://github.com/shafkat1/club/settings/environments`
2. Create environment: `development`
3. Add secret: `AWS_ROLE_TO_ASSUME` = (the role ARN from script output)
4. Optional variables:
   - `PROJECT` = `clubapp`
   - `AWS_REGION` = `us-east-1`

---

## Step 6: Configure Terraform Backend Variables (GitHub Repo)

In your repo, add to `.github/variables/development.env` or set via GitHub Actions secrets:

```
PROJECT=clubapp
ENVIRONMENT=dev
AWS_REGION=us-east-1
DOMAIN_NAME=desh.co
```

---

## Step 7: Verify Endpoints

Get the ALB DNS and CloudFront domain:

```bash
terraform output -json | jq '{alb_dns: .alb_dns_name, cloudfront: .cloudfront_assets_domain}'
```

Test endpoints:

```bash
# API health check (should return 200)
curl http://$(terraform output -raw alb_dns_name)/health

# CloudFront assets
curl https://$(terraform output -raw cloudfront_assets_domain)
```

---

## Step 8: When Domain Transfer Completes

After `desh.co` transfer finishes in Route 53:

### Option A: Keep GoDaddy DNS (Recommended during dev)
- Add DNS records to GoDaddy DNS:
  - CNAME: `assets` → CloudFront domain
  - CNAME: `api` → ALB DNS
  - CNAME: ACM validation records (already added)
- No Terraform changes needed.

### Option B: Switch to Route 53 DNS
- Run `terraform apply` with `enable_domain=true`:
  ```bash
  terraform apply \
    -var "enable_domain=true" \
    -var "domain_name=desh.co" \
    ...
  ```
- This creates the Route 53 hosted zone and DNS records.
- In Route 53, confirm nameservers and update GoDaddy if desired.

---

## Step 9: Configure Secrets Manager for App

Your app should read DB credentials from Secrets Manager:

```bash
aws secretsmanager get-secret-value \
  --secret-id clubapp-dev/rds/postgres/connection \
  --region us-east-1 \
  --query 'SecretString' | jq .
```

Output is a JSON object with:
- `host`, `port`, `username`, `password`, `dbname`
- Credentials auto-rotate every 30 days.

---

## Step 10: Deploy NestJS Backend

Update `backend/.env`:

```env
DATABASE_URL=postgresql://${username}:${password}@${host}:${port}/${dbname}
REDIS_URL=redis://${redis_primary_endpoint}:6379
S3_BUCKET=clubapp-dev-assets
S3_REGION=us-east-1
```

Build and push Docker image to ECR, then update ECS service task definition.

---

## Monitoring and Outputs

Check key outputs:

```bash
terraform output
```

Key values:
- `rds_endpoint`: PostgreSQL host
- `redis_primary_endpoint`: Redis endpoint
- `alb_dns_name`: API ALB (for `api.desh.co` alias)
- `cloudfront_assets_domain`: CDN (for `assets.desh.co` alias)
- `db_secret_arn`: Secrets Manager path for DB creds
- `route53_name_servers`: AWS nameservers (if `enable_domain=true`)
- `acm_validation_cnames`: ACM DNS validation records for GoDaddy

---

## Cleanup (If Starting Over)

```bash
terraform destroy \
  -var "project=clubapp" \
  -var "environment=dev" \
  -var "aws_region=us-east-1" \
  -var "enable_domain=false"

# Delete S3 backend (if no longer needed)
aws s3 rm s3://clubapp-dev-tfstate --recursive
aws dynamodb delete-table --table-name clubapp-dev-tfstate-lock
```

---

## Troubleshooting

- **Terraform init fails**: Ensure S3 bucket and DynamoDB table exist (Step 1).
- **ACM certificate stuck "Pending Validation"**: Verify CNAME records in GoDaddy DNS and wait 5–10 minutes.
- **ALB returns 502**: Check ECS service logs; ensure task definition is updated with correct image.
- **RDS connection timeout**: Ensure security groups allow inbound 5432 from ECS/Lambda.

---

## Next Steps

1. Push to GitHub: `git add . && git commit -m "Initial infrastructure" && git push origin main`
2. GitHub Actions will plan/apply automatically.
3. Deploy backend service once ECS task definition is ready.
4. Link mobile app to `api.desh.co` and `assets.desh.co` endpoints.
