# AWS Setup - Your Action Checklist

## Current Status
✅ AWS CLI installed  
✅ Policy files created  
✅ Setup guides created  
❌ AWS credentials need to be fixed  

---

## What You Must Do Now

### 🟥 STEP 1: Create Valid AWS Access Keys

**Action Required: Go to AWS Console**

1. Open: **https://console.aws.amazon.com**
2. Log in with your AWS account credentials
3. Click your **username** (top-right corner)
4. Click **Security Credentials**
5. Scroll to **Access keys** section
6. Look for key `AKIAWGHHM6OM53ZY744B`:
   - If it's **INACTIVE**: Delete it first
   - If it's **ACTIVE**: Delete it anyway (secret was likely exposed)
7. Click **Create access key**
8. Select: **Command Line Interface (CLI)**
9. Click **Create access key**
10. **IMMEDIATELY COPY:**
    - Access Key ID (starts with `AKIA`)
    - Secret Access Key
    - ⚠️ **You won't see the secret again!**

**Save these values somewhere safe temporarily.**

---

### 🟥 STEP 2: Update Your Local AWS Credentials

**Action Required: Update credentials file**

```powershell
# Open the credentials file in Notepad
notepad $env:USERPROFILE\.aws\credentials
```

Replace the entire contents with:
```
[default]
aws_access_key_id = PASTE_YOUR_NEW_ACCESS_KEY_ID_HERE
aws_secret_access_key = PASTE_YOUR_NEW_SECRET_KEY_HERE
```

Save and close (Ctrl+S, then close)

---

### 🟨 STEP 3: Verify It Works

**Action Required: Test AWS CLI**

```powershell
aws sts get-caller-identity
```

**Expected Output:**
```json
{
    "UserId": "AIDAW...",
    "Account": "425687053209",
    "Arn": "arn:aws:iam::425687053209:user/your-name"
}
```

**✅ If you see Account ID `425687053209`, continue to Step 4**

**❌ If you get error:**
- Check `TROUBLESHOOT_AWS.md` in the repo
- Or verify the credentials you entered

---

### 🟩 STEP 4: Create the Deployment Role

**Action Required: Run AWS CLI commands (from `C:\ai4\club` directory)**

```powershell
cd C:\ai4\club

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

# 3. Get the Role ARN (COPY THIS OUTPUT!)
aws iam get-role `
  --role-name github-oidc-deployment-role `
  --query 'Role.Arn' `
  --output text `
  --region us-east-1
```

**Expected Output from Step 3:**
```
arn:aws:iam::425687053209:role/github-oidc-deployment-role
```

**⚠️ COPY THIS ARN VALUE**

---

### 🟦 STEP 5: Add Role ARN to GitHub Secrets

**Action Required: Add secret to GitHub**

1. Go to: **https://github.com/shafkat1/club/settings/secrets/actions**
2. Click: **New repository secret**
3. Fill in the form:
   - **Name:** `AWS_DEPLOYMENT_ROLE_TO_ASSUME`
   - **Value:** Paste the ARN from Step 4
4. Click: **Add secret**

**Example Value:**
```
arn:aws:iam::425687053209:role/github-oidc-deployment-role
```

---

## ✅ Final Verification

Once you complete all 5 steps, verify everything works:

```powershell
# Test 1: AWS credentials work
aws sts get-caller-identity

# Test 2: Deployment role exists
aws iam get-role --role-name github-oidc-deployment-role --region us-east-1

# Check 3: Go to GitHub and verify the secret was added
# https://github.com/shafkat1/club/settings/secrets/actions
```

---

## 📚 Reference Files in Repository

If you get stuck:
- `QUICK_AWS_FIX.md` - Quick reference
- `AWS_CREDENTIALS_SETUP.md` - Detailed guide
- `TROUBLESHOOT_AWS.md` - Common issues
- `AWS_SETUP_SUMMARY.md` - Full status

---

## Timeline

| Step | Task | Status | Time |
|------|------|--------|------|
| 1 | Create AWS Access Keys | ⏳ TODO | 5 min |
| 2 | Update local credentials | ⏳ TODO | 2 min |
| 3 | Test AWS CLI | ⏳ TODO | 1 min |
| 4 | Create deployment role | ⏳ TODO | 2 min |
| 5 | Add GitHub secret | ⏳ TODO | 2 min |
| **Total** | **Full AWS Setup** | ⏳ TODO | **~12 min** |

---

## What Happens After This

Once you complete these 5 steps:
✅ GitHub Actions will be able to deploy to AWS  
✅ Backend will auto-deploy to ECS  
✅ Web portal will auto-deploy to S3/CloudFront  
✅ Mobile builds will work via Expo EAS  
✅ Terraform pipelines will work  

---

**You're almost there! Just need to complete those 5 steps.** 🚀
