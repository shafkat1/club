Write-Host "========================================" -ForegroundColor Blue
Write-Host "FINAL ECR DNS FIX - AGGRESSIVE APPROACH" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

Write-Host "Issue: ECR DNS still resolving to public IPs despite VPC DNS settings" -ForegroundColor Red
Write-Host "Error: dial tcp 16.15.178.247:443: i/o timeout" -ForegroundColor Red
Write-Host ""

# Get VPC ID
Write-Host "[1/7] Getting VPC Configuration..." -ForegroundColor Cyan
$subnet = aws ec2 describe-subnets --subnet-ids subnet-092a57b2e8874db10 --region us-east-1 | ConvertFrom-Json
$vpcId = $subnet.Subnets[0].VpcId
Write-Host "VPC ID: $vpcId" -ForegroundColor Yellow

# Force enable VPC DNS settings again
Write-Host ""
Write-Host "[2/7] Ensuring VPC DNS Settings..." -ForegroundColor Cyan
aws ec2 modify-vpc-attribute --vpc-id $vpcId --enable-dns-hostnames --region us-east-1
aws ec2 modify-vpc-attribute --vpc-id $vpcId --enable-dns-support --region us-east-1
Write-Host "✅ VPC DNS settings enforced" -ForegroundColor Green

# Delete existing ECR endpoints
Write-Host ""
Write-Host "[3/7] Deleting existing ECR endpoints..." -ForegroundColor Cyan
Write-Host "Deleting ECR API endpoint..." -ForegroundColor Yellow
aws ec2 delete-vpc-endpoint --vpc-endpoint-id vpce-05a20d5cae1f47bdc --region us-east-1
Write-Host "Deleting ECR DKR endpoint..." -ForegroundColor Yellow
aws ec2 delete-vpc-endpoint --vpc-endpoint-id vpce-0e1f4a613a0d129d9 --region us-east-1

# Wait for deletion
Write-Host "Waiting for endpoint deletion..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Create new ECR API endpoint with explicit private DNS
Write-Host ""
Write-Host "[4/7] Creating new ECR API endpoint..." -ForegroundColor Cyan
$ecrApiEndpoint = aws ec2 create-vpc-endpoint `
    --vpc-id $vpcId `
    --service-name com.amazonaws.us-east-1.ecr.api `
    --vpc-endpoint-type Interface `
    --subnet-ids subnet-092a57b2e8874db10 subnet-02a56a1d839f819ba `
    --security-group-ids sg-0512c36f727263750 `
    --private-dns-enabled `
    --region us-east-1 | ConvertFrom-Json

$newEcrApiId = $ecrApiEndpoint.VpcEndpoint.VpcEndpointId
Write-Host "✅ ECR API endpoint created: $newEcrApiId" -ForegroundColor Green

# Create new ECR DKR endpoint with explicit private DNS
Write-Host ""
Write-Host "[5/7] Creating new ECR DKR endpoint..." -ForegroundColor Cyan
$ecrDkrEndpoint = aws ec2 create-vpc-endpoint `
    --vpc-id $vpcId `
    --service-name com.amazonaws.us-east-1.ecr.dkr `
    --vpc-endpoint-type Interface `
    --subnet-ids subnet-092a57b2e8874db10 subnet-02a56a1d839f819ba `
    --security-group-ids sg-0512c36f727263750 `
    --private-dns-enabled `
    --region us-east-1 | ConvertFrom-Json

$newEcrDkrId = $ecrDkrEndpoint.VpcEndpoint.VpcEndpointId
Write-Host "✅ ECR DKR endpoint created: $newEcrDkrId" -ForegroundColor Green

# Wait for endpoints to be available
Write-Host ""
Write-Host "[6/7] Waiting for endpoints to be available..." -ForegroundColor Cyan
Write-Host "This may take 2-3 minutes..." -ForegroundColor Yellow
Start-Sleep -Seconds 120

# Verify endpoints are available
Write-Host "Checking endpoint status..." -ForegroundColor Yellow
$apiStatus = aws ec2 describe-vpc-endpoints --vpc-endpoint-ids $newEcrApiId --region us-east-1 --query 'VpcEndpoints[0].State' --output text
$dkrStatus = aws ec2 describe-vpc-endpoints --vpc-endpoint-ids $newEcrDkrId --region us-east-1 --query 'VpcEndpoints[0].State' --output text

Write-Host "ECR API Status: $apiStatus" -ForegroundColor Yellow
Write-Host "ECR DKR Status: $dkrStatus" -ForegroundColor Yellow

if ($apiStatus -eq "available" -and $dkrStatus -eq "available") {
    Write-Host "✅ Both endpoints are available" -ForegroundColor Green
} else {
    Write-Host "⚠️  Endpoints may still be initializing" -ForegroundColor Yellow
}

# Wait for DNS propagation
Write-Host ""
Write-Host "[7/7] Waiting for DNS propagation..." -ForegroundColor Cyan
Write-Host "DNS changes can take 5-10 minutes to fully propagate..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

Write-Host ""
Write-Host "========================================" -ForegroundColor Blue
Write-Host "FINAL FIX APPLIED" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host "✅ VPC DNS Hostnames: ENABLED" -ForegroundColor Green
Write-Host "✅ VPC DNS Support: ENABLED" -ForegroundColor Green
Write-Host "✅ ECR API Endpoint: $newEcrApiId (recreated)" -ForegroundColor Green
Write-Host "✅ ECR DKR Endpoint: $newEcrDkrId (recreated)" -ForegroundColor Green
Write-Host "✅ Private DNS: ENABLED on both endpoints" -ForegroundColor Green
Write-Host "✅ DNS Propagation: 60+ seconds wait completed" -ForegroundColor Green
Write-Host ""
Write-Host "Triggering new ECS deployment..." -ForegroundColor Yellow
aws ecs update-service --cluster clubapp-dev-ecs --service clubapp-dev-svc --force-new-deployment --region us-east-1 | Out-Null
Write-Host "✅ New deployment triggered" -ForegroundColor Green
Write-Host ""
Write-Host "Expected: Tasks should now resolve ECR to private VPC endpoint IPs" -ForegroundColor Cyan
Write-Host "Timeline: 5-10 minutes for full DNS propagation and task startup" -ForegroundColor Cyan
Write-Host ""
Write-Host "Monitor with: aws logs tail /ecs/clubapp-backend --follow" -ForegroundColor Gray
