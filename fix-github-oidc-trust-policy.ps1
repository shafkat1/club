# Update GitHub OIDC Role Trust Policy for AWS
# This allows GitHub Actions to assume the role and deploy

$ROLE_NAME = "github-actions-role"
$AWS_ACCOUNT_ID = "425687053209"
$REGION = "us-east-1"
$TRUST_POLICY_FILE = "trust-policy-github-oidc.json"

Write-Host "🔧 Updating GitHub OIDC role trust policy..." -ForegroundColor Cyan

# Read the trust policy file
$trustPolicy = Get-Content $TRUST_POLICY_FILE -Raw

# Update the role trust policy
try {
    aws iam update-assume-role-policy `
        --role-name $ROLE_NAME `
        --policy-document $trustPolicy `
        --region $REGION
    
    Write-Host "✅ Trust policy updated successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error updating trust policy: $_" -ForegroundColor Red
    exit 1
}

# Verify the role
Write-Host ""
Write-Host "📋 Verifying role..." -ForegroundColor Cyan

try {
    $role = aws iam get-role `
        --role-name $ROLE_NAME `
        --region $REGION
    
    Write-Host "✅ Role verified!" -ForegroundColor Green
    Write-Host ""
    Write-Host $role -ForegroundColor White
} catch {
    Write-Host "❌ Error verifying role: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ All done!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Go to GitHub Actions: https://github.com/shafkat1/club/actions" -ForegroundColor Yellow
Write-Host "2. Click the failing 'Deploy Backend to ECS' workflow" -ForegroundColor Yellow
Write-Host "3. Click 'Re-run failed jobs'" -ForegroundColor Yellow
Write-Host "4. Wait for workflow to complete" -ForegroundColor Yellow
Write-Host "5. It should now succeed! ✅" -ForegroundColor Yellow
