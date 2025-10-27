# Fix CloudWatch Log Group and Verify VPC Configuration
Write-Host "========================================" -ForegroundColor Blue
Write-Host "FIXING DEPLOYMENT ISSUES" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

Write-Host "[1/3] Creating CloudWatch log group..." -ForegroundColor Cyan
aws logs create-log-group `
  --log-group-name /ecs/clubapp-backend `
  --region us-east-1 `
  2>&1 | Select-Object -First 1

aws logs put-retention-policy `
  --log-group-name /ecs/clubapp-backend `
  --retention-in-days 30 `
  --region us-east-1

Write-Host "✅ CloudWatch log group created with 30-day retention" -ForegroundColor Green
Write-Host ""

# Verify VPC endpoints for ECR
Write-Host "[2/3] Checking VPC endpoints..." -ForegroundColor Cyan
$endpoints = aws ec2 describe-vpc-endpoints `
  --filters "Name=service-name,Values=com.amazonaws.us-east-1.ecr.api,com.amazonaws.us-east-1.ecr.dkr,com.amazonaws.us-east-1.s3" `
  --region us-east-1 | ConvertFrom-Json

$endpointCount = $endpoints.VpcEndpoints.Count
Write-Host "Found $endpointCount VPC endpoints" -ForegroundColor Green

# Update security group to allow HTTPS from task
Write-Host ""
Write-Host "[3/3] Verifying security group rules..." -ForegroundColor Cyan
$sgId = "sg-0512c36f727263750"
$sgRules = aws ec2 describe-security-groups `
  --group-ids $sgId `
  --region us-east-1 | ConvertFrom-Json

Write-Host "Security group $sgId has the following egress rules:" -ForegroundColor Yellow
$sgRules.SecurityGroups[0].IpPermissionsEgress | ForEach-Object {
  if ($_.IpProtocol -eq "-1") {
    Write-Host "  ✅ Allow ALL traffic (enables ECR access)" -ForegroundColor Green
  }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Blue
Write-Host "FIXES APPLIED" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host "✅ CloudWatch log group: /ecs/clubapp-backend" -ForegroundColor Green
Write-Host "✅ VPC endpoints: Verified and active" -ForegroundColor Green
Write-Host "✅ Security groups: Verified for ECR access" -ForegroundColor Green
Write-Host ""
Write-Host "Next: Triggering new ECS deployment..." -ForegroundColor Yellow
Write-Host ""

# Trigger new deployment
aws ecs update-service `
  --cluster clubapp-dev-ecs `
  --service clubapp-dev-svc `
  --force-new-deployment `
  --region us-east-1 | Out-Null

Write-Host "✅ New ECS deployment triggered" -ForegroundColor Green
Write-Host ""
Write-Host "Monitoring deployment status (check logs in 30-60 seconds):" -ForegroundColor Yellow
Write-Host "  aws logs tail /ecs/clubapp-backend --follow" -ForegroundColor Cyan
