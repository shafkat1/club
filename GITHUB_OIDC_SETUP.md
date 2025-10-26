# GitHub OIDC Setup for AWS

This guide sets up AWS IAM role for GitHub Actions to deploy Terraform.

## Account Details
- **AWS Account ID**: `425687053209`
- **GitHub Repo**: `shafkat1/club`
- **Role Name**: `github-oidc-terraform-role`

---

## Step 1: Create the IAM Role

Run these AWS CLI commands locally (ensure your AWS credentials are configured):

```bash
# Create the role with trust policy
aws iam create-role \
  --role-name github-oidc-terraform-role \
  --assume-role-policy-document file://trust-policy.json \
  --region us-east-1
```

**Files needed in current directory:**
- `trust-policy.json` ✓ (already created)

---

## Step 2: Attach the Permissions Policy

```bash
# Attach the inline policy
aws iam put-role-policy \
  --role-name github-oidc-terraform-role \
  --policy-name github-oidc-terraform-policy \
  --policy-document file://terraform-policy.json \
  --region us-east-1
```

**Files needed:**
- `terraform-policy.json` ✓ (already created)

---

## Step 3: Get the Role ARN

```bash
# Output the role ARN
aws iam get-role \
  --role-name github-oidc-terraform-role \
  --query 'Role.Arn' \
  --output text
```

**Example output:**
```
arn:aws:iam::425687053209:role/github-oidc-terraform-role
```

**Copy this ARN** for the next step.

---

## Step 4: Add Secret to GitHub Repository

1. Open: **https://github.com/shafkat1/club/settings/environments**

2. Click **"New environment"** button

3. Name: `development` → Click **"Configure environment"**

4. Scroll to **"Environment secrets"** section

5. Click **"Add secret"**
   - **Name**: `AWS_ROLE_TO_ASSUME`
   - **Value**: Paste the ARN from Step 3 (e.g., `arn:aws:iam::425687053209:role/github-oidc-terraform-role`)
   - Click **"Add secret"**

6. (Optional) Add **"Environment variables"**:
   - **Name**: `PROJECT` → **Value**: `clubapp`
   - **Name**: `AWS_REGION` → **Value**: `us-east-1`
   - Click **"Add variable"** for each

---

## Step 5: Verify Setup

1. Go to: **https://github.com/shafkat1/club/actions**

2. Click the **"Terraform"** workflow

3. Click **"Run workflow"** → select branch `main`

4. Click **"Run workflow"** button

5. Watch the workflow run. It should now:
   - ✅ Configure AWS credentials via OIDC
   - ✅ Initialize Terraform
   - ✅ Plan infrastructure
   - ✅ Apply (with approval on main)

---

## Files Included

- `trust-policy.json` – Trust policy for GitHub OIDC (hardcoded account ID)
- `terraform-policy.json` – IAM permissions policy
- This guide

---

## Troubleshooting

### Error: "Credentials could not be loaded"
- ✅ Run Steps 1-3 locally first (your AWS CLI must be configured)
- ✅ Double-check the secret in GitHub matches the role ARN exactly
- ✅ Wait 1-2 minutes after creating the role for IAM propagation

### Error: "AccessDenied" on terraform apply
- The IAM policy may need additional permissions
- Check the Terraform action logs for which action failed
- Add that action to `terraform-policy.json` and re-run `put-role-policy`

### Error: "Role not found"
- Ensure Step 1 completed successfully
- Verify role name is `github-oidc-terraform-role` (exact match)
- Check in AWS Console: IAM → Roles → search `github-oidc`

---

## Next Steps

Once the workflow succeeds:

1. **Bootstrap Terraform State** (if not done):
   ```bash
   cd infra/terraform
   terraform init  # Uses S3 backend
   ```

2. **Add ACM validation CNAMEs to GoDaddy** (from Terraform outputs)

3. **Deploy backend services** once Terraform infrastructure is ready

---

**Created**: 2025-10-26
**Account**: 425687053209
