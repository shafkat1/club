Write-Host "Verifying ECS permissions for github-actions-apprunner role..." -ForegroundColor Cyan
Write-Host ""

$roleName = "github-actions-apprunner"
$policyName = "github-actions-apprunner-inline"

# Get the policy
$policy = aws iam get-role-policy --role-name $roleName --policy-name $policyName | ConvertFrom-Json

Write-Host "✅ Policy retrieved successfully!" -ForegroundColor Green
Write-Host ""

# Check for ECS permissions
$ecsStatement = $policy.PolicyDocument.Statement | Where-Object { $_.Action -contains "ecs:RegisterTaskDefinition" }

if ($ecsStatement) {
    Write-Host "✅ ECS Permissions Found:" -ForegroundColor Green
    Write-Host "ECS Actions:" -ForegroundColor Cyan
    $ecsStatement.Action | ForEach-Object {
        Write-Host "  - $_"
    }
    Write-Host ""
    Write-Host "✅ The github-actions-apprunner role now has ECS permissions!" -ForegroundColor Green
    Write-Host "✅ ECS RegisterTaskDefinition is now allowed!" -ForegroundColor Green
} else {
    Write-Host "❌ ECS permissions not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "Full Policy Document:" -ForegroundColor Cyan
$policy.PolicyDocument | ConvertTo-Json -Depth 10
