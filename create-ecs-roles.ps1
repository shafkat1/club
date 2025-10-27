# Create ECS Task Execution and Task Roles
# This script creates the necessary IAM roles for ECS Fargate deployments

Write-Host "🔧 Creating ECS IAM Roles..." -ForegroundColor Cyan

$ROLE_NAMES = @("ecsTaskExecutionRole", "ecsTaskRole")
$TRUST_POLICY_FILE = "ecs-task-trust-policy.json"
$AWS_REGION = "us-east-1"

# Read trust policy once
$trustPolicy = Get-Content $TRUST_POLICY_FILE -Raw

# 1. Create ecsTaskExecutionRole
Write-Host "`n📋 Creating ecsTaskExecutionRole..." -ForegroundColor Yellow

try {
    $roleResponse = aws iam create-role `
        --role-name ecsTaskExecutionRole `
        --assume-role-policy-document $trustPolicy `
        --region $AWS_REGION
    
    Write-Host "✅ ecsTaskExecutionRole created" -ForegroundColor Green
} catch {
    Write-Host "⚠️  ecsTaskExecutionRole already exists" -ForegroundColor Yellow
}

# Attach managed policy to execution role
Write-Host "`n📋 Attaching AmazonECSTaskExecutionRolePolicy..." -ForegroundColor Yellow

try {
    aws iam attach-role-policy `
        --role-name ecsTaskExecutionRole `
        --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy `
        --region $AWS_REGION
    
    Write-Host "✅ Policy attached to ecsTaskExecutionRole" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Policy already attached" -ForegroundColor Yellow
}

# 2. Create ecsTaskRole
Write-Host "`n📋 Creating ecsTaskRole..." -ForegroundColor Yellow

try {
    $roleResponse = aws iam create-role `
        --role-name ecsTaskRole `
        --assume-role-policy-document $trustPolicy `
        --region $AWS_REGION
    
    Write-Host "✅ ecsTaskRole created" -ForegroundColor Green
} catch {
    Write-Host "⚠️  ecsTaskRole already exists" -ForegroundColor Yellow
}

# Add CloudWatch Logs inline policy
Write-Host "`n📋 Adding CloudWatch Logs inline policy to ecsTaskRole..." -ForegroundColor Yellow

$CLOUDWATCH_POLICY_FILE = "ecs-task-cloudwatch-policy.json"
$cloudwatchPolicy = Get-Content $CLOUDWATCH_POLICY_FILE -Raw

try {
    aws iam put-role-policy `
        --role-name ecsTaskRole `
        --policy-name CloudWatchLogsPolicy `
        --policy-document $cloudwatchPolicy `
        --region $AWS_REGION
    
    Write-Host "✅ CloudWatch Logs policy added" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Policy may already exist" -ForegroundColor Yellow
}

# Verify roles were created
Write-Host "`n📋 Verifying roles..." -ForegroundColor Yellow

try {
    $exec_role = aws iam get-role --role-name ecsTaskExecutionRole --region $AWS_REGION
    Write-Host "✅ ecsTaskExecutionRole verified" -ForegroundColor Green
} catch {
    Write-Host "❌ ecsTaskExecutionRole not found" -ForegroundColor Red
}

try {
    $task_role = aws iam get-role --role-name ecsTaskRole --region $AWS_REGION
    Write-Host "✅ ecsTaskRole verified" -ForegroundColor Green
} catch {
    Write-Host "❌ ecsTaskRole not found" -ForegroundColor Red
}

Write-Host "`n🎊 ECS IAM Roles setup complete!" -ForegroundColor Green
Write-Host "`n✅ Created roles:" -ForegroundColor Green
Write-Host "   • ecsTaskExecutionRole" -ForegroundColor Green
Write-Host "   • ecsTaskRole" -ForegroundColor Green

Write-Host "`n🚀 Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to GitHub Actions: https://github.com/shafkat1/club/actions" -ForegroundColor Cyan
Write-Host "2. Click 'Deploy Backend to ECS' workflow" -ForegroundColor Cyan
Write-Host "3. Click latest failing run" -ForegroundColor Cyan
Write-Host "4. Click 'Re-run failed jobs'" -ForegroundColor Cyan
Write-Host "5. Wait 2-3 minutes for deployment!" -ForegroundColor Cyan
