# AWS CLI Configuration Script

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "AWS CLI Configuration Setup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "STEP 1: Get Your AWS Credentials" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Go to AWS Console:"
Write-Host "1. Sign in to https://console.aws.amazon.com"
Write-Host "2. Click your username (top right)"
Write-Host "3. Select 'Security Credentials'"
Write-Host "4. Scroll to 'Access keys'"
Write-Host "5. Copy Access Key ID and Secret Access Key"
Write-Host ""

# Prompt for credentials
$accessKeyId = Read-Host "Enter your AWS Access Key ID"
$secretAccessKey = Read-Host "Enter your AWS Secret Access Key (hidden)" -AsSecureString

# Convert SecureString to plain text
$secretPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($secretAccessKey)
)

Write-Host ""
Write-Host "STEP 2: Configuring AWS CLI" -ForegroundColor Yellow
Write-Host "============================" -ForegroundColor Yellow
Write-Host ""

# Create .aws directory if it doesn't exist
$awsDir = "$env:USERPROFILE\.aws"
if (!(Test-Path $awsDir)) {
    New-Item -ItemType Directory -Path $awsDir -Force | Out-Null
    Write-Host "[OK] Created AWS config directory"
}

# Create credentials file
$credentialsFile = "$awsDir\credentials"
$credentialsContent = @"
[default]
aws_access_key_id = $accessKeyId
aws_secret_access_key = $secretPlain
"@

Set-Content -Path $credentialsFile -Value $credentialsContent
Write-Host "[OK] Created credentials file"

# Create config file
$configFile = "$awsDir\config"
$configContent = @"
[default]
region = us-east-1
output = json
"@

Set-Content -Path $configFile -Value $configContent
Write-Host "[OK] Created config file"

Write-Host ""
Write-Host "STEP 3: Verify Configuration" -ForegroundColor Yellow
Write-Host "============================" -ForegroundColor Yellow
Write-Host ""

$caller = aws sts get-caller-identity 2>&1 | ConvertFrom-Json
if ($caller) {
    Write-Host "[SUCCESS] AWS CLI configured correctly!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your AWS Account:" -ForegroundColor Cyan
    Write-Host "  Account ID: $($caller.Account)"
    Write-Host "  User ARN:   $($caller.Arn)"
} else {
    Write-Host "[ERROR] Failed to verify AWS configuration" -ForegroundColor Red
    Exit 1
}

Write-Host ""
Write-Host "STEP 4: Next Steps" -ForegroundColor Yellow
Write-Host "==================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Run these commands to create the deployment role:"
Write-Host ""
Write-Host "1. Create role:"
Write-Host "   aws iam create-role --role-name github-oidc-deployment-role --assume-role-policy-document file://deployment-trust-policy.json --region us-east-1"
Write-Host ""
Write-Host "2. Attach policy:"
Write-Host "   aws iam put-role-policy --role-name github-oidc-deployment-role --policy-name deployment-policy --policy-document file://deployment-policy.json --region us-east-1"
Write-Host ""
Write-Host "3. Get Role ARN (copy this!):"
Write-Host "   aws iam get-role --role-name github-oidc-deployment-role --query 'Role.Arn' --output text --region us-east-1"
Write-Host ""
Write-Host "4. Add to GitHub Secrets:"
Write-Host "   https://github.com/shafkat1/club/settings/secrets/actions"
Write-Host "   Secret Name: AWS_DEPLOYMENT_ROLE_TO_ASSUME"
Write-Host "   Secret Value: <paste the Role ARN>"
Write-Host ""
