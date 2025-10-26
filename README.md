# Club App

A map-first mobile and web application for purchasing drinks between people at bars, clubs, and pubs.

## Project Structure

```
.
├── infra/
│   ├── terraform/          # AWS infrastructure (RDS, DynamoDB, Redis, S3, ECS, ALB, CloudFront)
│   ├── scripts/
│   │   └── setup-github-oidc.sh
│   └── README.md
├── backend/                # NestJS API (TBD)
├── mobile/                 # React Native + Expo app (TBD)
├── web/                    # Next.js bartender & admin portal (TBD)
├── DEPLOYMENT.md           # Step-by-step deployment guide
└── README.md               # This file
```

## Quick Start

### Deploy Infrastructure

1. **Bootstrap Terraform state** (one-time):
   ```bash
   # Create S3 backend bucket and DynamoDB lock table
   aws s3api create-bucket --bucket clubapp-dev-tfstate --region us-east-1
   aws s3api put-bucket-versioning --bucket clubapp-dev-tfstate --versioning-configuration Status=Enabled
   aws dynamodb create-table --table-name clubapp-dev-tfstate-lock \
     --attribute-definitions AttributeName=LockID,AttributeType=S \
     --key-schema AttributeName=LockID,KeyType=HASH \
     --billing-mode PAY_PER_REQUEST --region us-east-1
   ```

2. **Apply Terraform**:
   ```bash
   cd infra/terraform
   terraform init
   terraform plan -var "project=clubapp" -var "environment=dev" -var "aws_region=us-east-1" -var "enable_domain=false"
   terraform apply
   ```

3. **Set up GitHub OIDC**:
   ```bash
   bash infra/scripts/setup-github-oidc.sh shafkat1/club us-east-1
   # Follow on-screen instructions to add secrets to GitHub
   ```

4. **Add ACM validation CNAMEs to GoDaddy DNS**:
   ```bash
   terraform output -json acm_validation_cnames | jq .
   # Copy the name/value pairs to GoDaddy DNS (2 records)
   ```

5. **When domain transfer completes**, update Terraform:
   ```bash
   terraform apply -var "enable_domain=true" ...
   ```

For detailed steps, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Key Infrastructure

- **API**: NestJS on ECS Fargate, behind ALB (HTTPS at `api.desh.co`)
- **Database**: PostgreSQL 16 multi-AZ with auto-rotating credentials via Secrets Manager
- **Cache**: ElastiCache Redis 7.1 (multi-AZ)
- **Storage**: S3 buckets (assets, receipts, logs) with CloudFront CDN (`assets.desh.co`)
- **Real-time**: DynamoDB for presence/counts, Redis for streams
- **CI/CD**: GitHub Actions with AWS OIDC for Terraform plan/apply
- **Security**: ACM/HTTPS, KMS encryption, IAM roles, security groups

## Domain & DNS

- Domain: `desh.co` (transferred from GoDaddy to AWS Route 53)
- Subdomains:
  - `api.desh.co` → ALB (HTTPS)
  - `assets.desh.co` → CloudFront (HTTPS)
- ACM certificates auto-rotate; DNS validation via Route 53

## Outputs

After `terraform apply`, retrieve key endpoints:

```bash
cd infra/terraform
terraform output -json
```

Key values:
- `alb_dns_name`: API load balancer endpoint
- `cloudfront_assets_domain`: CDN endpoint
- `rds_endpoint`: PostgreSQL host
- `redis_primary_endpoint`: Redis host
- `db_secret_arn`: Secrets Manager path for DB credentials

## GitHub Actions

Automated plan/apply on push to `main` (`.github/workflows/terraform.yml`). Requires:
- Environment: `development`
- Secret: `AWS_ROLE_TO_ASSUME` (IAM role ARN for OIDC)
- Variables: `PROJECT`, `AWS_REGION` (optional)

## Design

- **Map-first**: Venues with live counts of seekers and buyers
- **Privacy-respecting**: Presence scoped to venues; no GPS sharing
- **Bartender flow**: QR scan or phone lookup for redemption
- **Accessibility**: WCAG 2.2 AA compliance, large touch targets, screen reader support
- **Real-time**: WebSocket for live updates (Ably or self-hosted Socket.IO)

## Status

- ✅ Terraform infrastructure complete
- ✅ Secrets Manager + rotation configured
- ✅ GitHub Actions CI wired
- ⏳ NestJS backend (placeholder)
- ⏳ React Native mobile (Expo)
- ⏳ Next.js web (bartender/admin)

## License

TBD

---

For questions or issues, see [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section.
