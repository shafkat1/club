# AWS Credentials Troubleshooting

## Error: "The security token included in the request is invalid"

This means the Access Key ID or Secret Access Key is **incorrect or inactive**.

### Solutions:

#### Option 1: Verify Your Current Credentials

1. Go to: **https://console.aws.amazon.com**
2. Log in with your AWS account
3. Click your **username** (top right) → **Security Credentials**
4. Look for **Access keys for use with the AWS CLI**
5. Check if your key `AKIAWGHHM6OM53ZY744B` exists and is **Active**
   - If it's **Inactive**, activate it or delete and create a new one

#### Option 2: Create New Access Keys

If your key doesn't work or you can't find it:

1. Go to: **AWS Console > IAM > Users > Your Username > Security Credentials**
2. Click **Create access key**
3. Choose: **Command Line Interface (CLI)**
4. Click **Create access key**
5. **Copy IMMEDIATELY:**
   - Access Key ID (AKIA...)
   - Secret Access Key
6. Save them safely - you won't see the secret key again!

#### Option 3: Update Your Credentials

Once you have valid credentials, update them:

```powershell
# Edit the credentials file
$credentialsFile = "$env:USERPROFILE\.aws\credentials"
notepad $credentialsFile
```

Replace with:
```
[default]
aws_access_key_id = YOUR_NEW_ACCESS_KEY_ID
aws_secret_access_key = YOUR_NEW_SECRET_ACCESS_KEY
```

Then test:
```powershell
aws sts get-caller-identity
```

Should return:
```json
{
    "UserId": "AIDAWXXXXX",
    "Account": "425687053209",
    "Arn": "arn:aws:iam::425687053209:user/your-username"
}
```

### Account Information to Verify

Your AWS Account ID: **425687053209**

If you see a different account ID when you run `aws sts get-caller-identity`, you're using wrong credentials!

### Need Help?

1. Check AWS IAM Console for active access keys
2. Ensure you're using the correct AWS account (425687053209)
3. Delete old/unused access keys
4. Create fresh access keys and test immediately
