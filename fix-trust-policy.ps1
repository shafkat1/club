$roleName = "github-actions-apprunner"
$trustPolicyFile = "trust-policy-final.json"

Write-Host "Updating trust policy for role: $roleName" -ForegroundColor Cyan

# Check if AWS CLI is installed
try {
    aws --version | Out-Null
} catch {
    Write-Host "Error: AWS CLI is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Verify the trust policy file exists
if (-not (Test-Path $trustPolicyFile)) {
    Write-Host "Error: Trust policy file not found: $trustPolicyFile" -ForegroundColor Red
    exit 1
}

# Read the trust policy
$trustPolicy = Get-Content $trustPolicyFile -Raw

Write-Host "Trust policy content:" -ForegroundColor Green
Write-Host $trustPolicy
Write-Host ""

# Update the role trust policy
try {
    aws iam update-assume-role-policy `
        --role-name $roleName `
        --policy-document file://$trustPolicyFile
    
    Write-Host "✅ Trust policy updated successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error updating trust policy: $_" -ForegroundColor Red
    exit 1
}

# Verify the update
Write-Host ""
Write-Host "Verifying the updated trust policy..." -ForegroundColor Cyan
try {
    $result = aws iam get-role --role-name $roleName --query 'Role.AssumeRolePolicyDocument' --output json
    Write-Host "Current trust policy:" -ForegroundColor Green
    Write-Host $result
    Write-Host ""
    Write-Host "✅ Update verified!" -ForegroundColor Green
} catch {
    Write-Host "Warning: Could not verify update: $_" -ForegroundColor Yellow
}
