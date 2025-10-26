# Quick AWS Credentials Fix

## Your Current Status
❌ **Credentials are INVALID or INACTIVE**

Access Key ID attempted: `AKIAWGHHM6OM53ZY744B`

## Immediate Actions

### 1. Open AWS IAM Console
```
https://console.aws.amazon.com
 → Click your username (top right)
 → Security Credentials
 → Access Keys section
```

### 2. Fix Your Access Key
- **If AKIAWGHHM6OM53ZY744B exists but is INACTIVE:**
  - Delete it
  - Click "Create access key"
  - Select "Command Line Interface (CLI)"
  - Download the CSV file

- **If AKIAWGHHM6OM53ZY744B doesn't exist:**
  - You may have used the wrong account
  - Click "Create access key"
  - Select "Command Line Interface (CLI)"
  - Download the CSV file

### 3. Update Your Local Credentials
```powershell
# Open the credentials file
notepad $env:USERPROFILE\.aws\credentials
```

Replace the contents with:
```
[default]
aws_access_key_id = PASTE_NEW_ACCESS_KEY_ID
aws_secret_access_key = PASTE_NEW_SECRET_ACCESS_KEY
```

### 4. Test It Works
```powershell
aws sts get-caller-identity
```

**Expected Output:**
```json
{
    "UserId": "...",
    "Account": "425687053209",
    "Arn": "arn:aws:iam::425687053209:user/..."
}
```

If you see account `425687053209`, you're good! ✅

### 5. Once Working, Create the Deployment Role
```powershell
cd C:\ai4\club

# Create role
aws iam create-role `
  --role-name github-oidc-deployment-role `
  --assume-role-policy-document file://deployment-trust-policy.json `
  --region us-east-1

# Attach policy
aws iam put-role-policy `
  --role-name github-oidc-deployment-role `
  --policy-name deployment-policy `
  --policy-document file://deployment-policy.json `
  --region us-east-1

# Get Role ARN (copy this!)
aws iam get-role `
  --role-name github-oidc-deployment-role `
  --query 'Role.Arn' `
  --output text `
  --region us-east-1
```

### 6. Add Role ARN to GitHub Secrets
```
Go to: https://github.com/shafkat1/club/settings/secrets/actions
Add Secret:
  Name: AWS_DEPLOYMENT_ROLE_TO_ASSUME
  Value: arn:aws:iam::425687053209:role/github-oidc-deployment-role
```

---

## Verify Everything Works

```powershell
# 1. Test AWS CLI is configured
aws sts get-caller-identity

# 2. Test role was created
aws iam get-role --role-name github-oidc-deployment-role --region us-east-1
```

Both commands should return successfully! 🎉
