# AWS Setup - Current Status & Next Steps

## What We've Done ✅

1. **Created AWS Policy Files** (committed to GitHub)
   - ✅ `deployment-trust-policy.json` - Trust policy for GitHub OIDC
   - ✅ `deployment-policy.json` - IAM permissions for deployments

2. **Created Configuration Scripts**
   - ✅ `configure_aws.ps1` - Interactive AWS CLI setup
   - ✅ `QUICK_AWS_FIX.md` - Quick reference guide
   - ✅ `TROUBLESHOOT_AWS.md` - Troubleshooting guide
   - ✅ `AWS_CREDENTIALS_SETUP.md` - Comprehensive setup guide

3. **Attempted Configuration**
   - ✅ Created AWS credentials file at `~\.aws\credentials`
   - ❌ Credentials are **INVALID or INACTIVE** (error: "security token included in the request is invalid")

## Current Issue

The Access Key ID `AKIAWGHHM6OM53ZY744B` you provided is either:
- Inactive (needs to be deleted and regenerated)
- From a different AWS account
- Has expired

## What You Need to Do Now

### Step 1: Fix Your AWS Credentials ⚠️

1. **Go to AWS Console**: https://console.aws.amazon.com
2. **Click your username** (top right corner)
3. **Select "Security Credentials"**
4. **Go to "Access keys" section**
5. **Check if `AKIAWGHHM6OM53ZY744B` exists:**
   - **If YES and INACTIVE**: Delete it and create a new one
   - **If YES and ACTIVE**: Secret key might be wrong, delete and recreate
   - **If NO**: Create a new access key
6. **Create New Access Key:**
   - Click "Create access key"
   - Select "Command Line Interface (CLI)"
   - Click "Create"
   - **Copy both values immediately** (you won't see secret again!)
7. **Open PowerShell and run:**
   ```powershell
   notepad $env:USERPROFILE\.aws\credentials
   ```
8. **Replace the file contents with:**
   ```
   [default]
   aws_access_key_id = YOUR_NEW_ACCESS_KEY_ID
   aws_secret_access_key = YOUR_NEW_SECRET_ACCESS_KEY
   ```
9. **Save and close**

### Step 2: Verify AWS CLI Works ✅

```powershell
aws sts get-caller-identity
```

**Should show:**
```json
{
    "UserId": "AIDAW...",
    "Account": "425687053209",
    "Arn": "arn:aws:iam::425687053209:user/your-username"
}
```

✅ **If you see Account: 425687053209**, you're ready!

### Step 3: Create Deployment Role (Once Step 2 Works)

From the project directory (`C:\ai4\club`), run:

```powershell
# 1. Create the role
aws iam create-role `
  --role-name github-oidc-deployment-role `
  --assume-role-policy-document file://deployment-trust-policy.json `
  --region us-east-1

# 2. Attach the policy
aws iam put-role-policy `
  --role-name github-oidc-deployment-role `
  --policy-name deployment-policy `
  --policy-document file://deployment-policy.json `
  --region us-east-1

# 3. Get the Role ARN (COPY THIS!)
aws iam get-role `
  --role-name github-oidc-deployment-role `
  --query 'Role.Arn' `
  --output text `
  --region us-east-1
```

Example output:
```
arn:aws:iam::425687053209:role/github-oidc-deployment-role
```

### Step 4: Add Role ARN to GitHub Secrets ⭐

1. Go to: **https://github.com/shafkat1/club/settings/secrets/actions**
2. Click: **"New repository secret"**
3. Fill in:
   ```
   Name: AWS_DEPLOYMENT_ROLE_TO_ASSUME
   Value: arn:aws:iam::425687053209:role/github-oidc-deployment-role
   ```
4. Click: **"Add secret"**

---

## Timeline

| Task | Status | Notes |
|------|--------|-------|
| Policy files created | ✅ Complete | Ready in repo |
| AWS CLI installed | ✅ Complete | `aws-cli/2.28.7` |
| Credentials file created | ⚠️ Invalid | Need valid credentials |
| AWS credentials verified | ❌ Pending | Waiting for valid credentials |
| IAM role created | ❌ Pending | Can't create without valid AWS access |
| GitHub secret added | ❌ Pending | Waiting for role ARN |
| CI/CD pipelines ready | ❌ Pending | Will work once secret is added |

---

## Key Information

- **AWS Account ID**: `425687053209`
- **AWS Region**: `us-east-1`
- **GitHub Repo**: `shafkat1/club`
- **Current Invalid Key**: `AKIAWGHHM6OM53ZY744B`

---

## File Reference

📄 **Available in repo for quick access:**
- `QUICK_AWS_FIX.md` - Fast start
- `AWS_CREDENTIALS_SETUP.md` - Detailed walkthrough
- `TROUBLESHOOT_AWS.md` - Common issues
- `deployment-trust-policy.json` - OIDC trust policy
- `deployment-policy.json` - IAM permissions
- `configure_aws.ps1` - Setup script

---

**Next action:** Update your AWS credentials and test with `aws sts get-caller-identity` ✅
