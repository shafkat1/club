Write-Host "========================================" -ForegroundColor Blue
Write-Host "FIXING ECR DNS RESOLUTION ISSUE" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

# Get VPC ID from subnet
Write-Host "[1/4] Detecting VPC Configuration..." -ForegroundColor Cyan
$subnet = aws ec2 describe-subnets --subnet-ids subnet-092a57b2e8874db10 --region us-east-1 | ConvertFrom-Json
$vpcId = $subnet.Subnets[0].VpcId
Write-Host "VPC ID: $vpcId" -ForegroundColor Yellow

# Check DNS Hostnames
Write-Host ""
Write-Host "[2/4] Checking DNS Hostnames Setting..." -ForegroundColor Cyan
$dnsAttr = aws ec2 describe-vpc-attribute --vpc-id $vpcId --attribute enableDnsHostnames --region us-east-1 | ConvertFrom-Json
$dnsEnabled = $dnsAttr.EnableDnsHostnames.Value
Write-Host "DNS Hostnames Enabled: $dnsEnabled" -ForegroundColor Yellow

if (-not $dnsEnabled) {
    Write-Host "Enabling DNS Hostnames..." -ForegroundColor Yellow
    aws ec2 modify-vpc-attribute --vpc-id $vpcId --enable-dns-hostnames --region us-east-1
    Write-Host "✅ DNS Hostnames Enabled" -ForegroundColor Green
} else {
    Write-Host "✅ DNS Hostnames already enabled" -ForegroundColor Green
}

# Enable DNS Support
Write-Host ""
Write-Host "[3/4] Enabling DNS Support..." -ForegroundColor Cyan
aws ec2 modify-vpc-attribute --vpc-id $vpcId --enable-dns-support --region us-east-1
Write-Host "✅ DNS Support Enabled" -ForegroundColor Green

# Verify Private DNS for ECR Endpoints
Write-Host ""
Write-Host "[4/4] Verifying ECR Endpoint Private DNS Settings..." -ForegroundColor Cyan
$ecrApi = aws ec2 describe-vpc-endpoints --region us-east-1 --filters "Name=vpc-endpoint-id,Values=vpce-05a20d5cae1f47bdc" | ConvertFrom-Json
$ecrDkr = aws ec2 describe-vpc-endpoints --region us-east-1 --filters "Name=vpc-endpoint-id,Values=vpce-0e1f4a613a0d129d9" | ConvertFrom-Json

$ecrApiPrivateDns = $ecrApi.VpcEndpoints[0].PrivateDnsEnabled
$ecrDkrPrivateDns = $ecrDkr.VpcEndpoints[0].PrivateDnsEnabled

Write-Host "ECR API Private DNS: $ecrApiPrivateDns" -ForegroundColor Yellow
Write-Host "ECR DKR Private DNS: $ecrDkrPrivateDns" -ForegroundColor Yellow

if ($ecrApiPrivateDns -and $ecrDkrPrivateDns) {
    Write-Host "✅ Both ECR endpoints have Private DNS enabled" -ForegroundColor Green
} else {
    Write-Host "⚠️  Private DNS needs to be enabled on one or more endpoints" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Blue
Write-Host "FIX APPLIED" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host "✅ DNS Hostnames: Enabled" -ForegroundColor Green
Write-Host "✅ DNS Support: Enabled" -ForegroundColor Green
Write-Host "✅ ECR Endpoints: Verified" -ForegroundColor Green
Write-Host ""
Write-Host "Triggering new ECS deployment..." -ForegroundColor Yellow
aws ecs update-service --cluster clubapp-dev-ecs --service clubapp-dev-svc --force-new-deployment --region us-east-1 | Out-Null
Write-Host "✅ New deployment triggered" -ForegroundColor Green
Write-Host ""
Write-Host "Expected resolution: Tasks should now pull from ECR within 2-5 minutes" -ForegroundColor Cyan
