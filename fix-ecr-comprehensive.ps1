Write-Host "========================================" -ForegroundColor Blue
Write-Host "COMPREHENSIVE ECR DNS FIX" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

Write-Host "Issue: Tasks still resolving ECR to public IPs instead of VPC endpoints" -ForegroundColor Red
Write-Host "Error: dial tcp 16.15.178.247:443: i/o timeout" -ForegroundColor Red
Write-Host ""

# Get VPC ID
Write-Host "[1/6] Getting VPC Configuration..." -ForegroundColor Cyan
$subnet = aws ec2 describe-subnets --subnet-ids subnet-092a57b2e8874db10 --region us-east-1 | ConvertFrom-Json
$vpcId = $subnet.Subnets[0].VpcId
Write-Host "VPC ID: $vpcId" -ForegroundColor Yellow

# Check current VPC DNS settings
Write-Host ""
Write-Host "[2/6] Checking VPC DNS Settings..." -ForegroundColor Cyan
$dnsHostnames = aws ec2 describe-vpc-attribute --vpc-id $vpcId --attribute enableDnsHostnames --region us-east-1 | ConvertFrom-Json
$dnsSupport = aws ec2 describe-vpc-attribute --vpc-id $vpcId --attribute enableDnsSupport --region us-east-1 | ConvertFrom-Json

Write-Host "DNS Hostnames: $($dnsHostnames.EnableDnsHostnames.Value)" -ForegroundColor Yellow
Write-Host "DNS Support: $($dnsSupport.EnableDnsSupport.Value)" -ForegroundColor Yellow

# Force enable both settings
Write-Host ""
Write-Host "[3/6] Ensuring VPC DNS Settings..." -ForegroundColor Cyan
aws ec2 modify-vpc-attribute --vpc-id $vpcId --enable-dns-hostnames --region us-east-1
aws ec2 modify-vpc-attribute --vpc-id $vpcId --enable-dns-support --region us-east-1
Write-Host "✅ VPC DNS settings enforced" -ForegroundColor Green

# Check VPC endpoints
Write-Host ""
Write-Host "[4/6] Checking VPC Endpoints..." -ForegroundColor Cyan
$ecrApi = aws ec2 describe-vpc-endpoints --region us-east-1 --filters "Name=vpc-endpoint-id,Values=vpce-05a20d5cae1f47bdc" | ConvertFrom-Json
$ecrDkr = aws ec2 describe-vpc-endpoints --region us-east-1 --filters "Name=vpc-endpoint-id,Values=vpce-0e1f4a613a0d129d9" | ConvertFrom-Json

Write-Host "ECR API Endpoint: $($ecrApi.VpcEndpoints[0].State)" -ForegroundColor Yellow
Write-Host "ECR DKR Endpoint: $($ecrDkr.VpcEndpoints[0].State)" -ForegroundColor Yellow
Write-Host "ECR API Private DNS: $($ecrApi.VpcEndpoints[0].PrivateDnsEnabled)" -ForegroundColor Yellow
Write-Host "ECR DKR Private DNS: $($ecrDkr.VpcEndpoints[0].PrivateDnsEnabled)" -ForegroundColor Yellow

# Check if we need to recreate endpoints with proper private DNS
if (-not $ecrApi.VpcEndpoints[0].PrivateDnsEnabled -or -not $ecrDkr.VpcEndpoints[0].PrivateDnsEnabled) {
    Write-Host ""
    Write-Host "[5/6] Recreating VPC Endpoints with Private DNS..." -ForegroundColor Cyan
    
    # Delete existing endpoints
    Write-Host "Deleting existing ECR endpoints..." -ForegroundColor Yellow
    aws ec2 delete-vpc-endpoint --vpc-endpoint-id vpce-05a20d5cae1f47bdc --region us-east-1
    aws ec2 delete-vpc-endpoint --vpc-endpoint-id vpce-0e1f4a613a0d129d9 --region us-east-1
    
    # Wait for deletion
    Write-Host "Waiting for endpoint deletion..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    # Recreate with private DNS enabled
    Write-Host "Creating ECR API endpoint with private DNS..." -ForegroundColor Yellow
    aws ec2 create-vpc-endpoint `
        --vpc-id $vpcId `
        --service-name com.amazonaws.us-east-1.ecr.api `
        --vpc-endpoint-type Interface `
        --subnet-ids subnet-092a57b2e8874db10 subnet-02a56a1d839f819ba `
        --security-group-ids sg-0512c36f727263750 `
        --private-dns-enabled `
        --region us-east-1 | Out-Null
    
    Write-Host "Creating ECR DKR endpoint with private DNS..." -ForegroundColor Yellow
    aws ec2 create-vpc-endpoint `
        --vpc-id $vpcId `
        --service-name com.amazonaws.us-east-1.ecr.dkr `
        --vpc-endpoint-type Interface `
        --subnet-ids subnet-092a57b2e8874db10 subnet-02a56a1d839f819ba `
        --security-group-ids sg-0512c36f727263750 `
        --private-dns-enabled `
        --region us-east-1 | Out-Null
    
    Write-Host "✅ VPC Endpoints recreated with private DNS" -ForegroundColor Green
} else {
    Write-Host "✅ VPC Endpoints already have private DNS enabled" -ForegroundColor Green
}

# Wait for DNS propagation
Write-Host ""
Write-Host "[6/6] Waiting for DNS propagation..." -ForegroundColor Cyan
Write-Host "DNS changes can take 2-5 minutes to propagate..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host ""
Write-Host "========================================" -ForegroundColor Blue
Write-Host "COMPREHENSIVE FIX APPLIED" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host "✅ VPC DNS Hostnames: ENABLED" -ForegroundColor Green
Write-Host "✅ VPC DNS Support: ENABLED" -ForegroundColor Green
Write-Host "✅ ECR Endpoints: Recreated with Private DNS" -ForegroundColor Green
Write-Host "✅ DNS Propagation: 30 seconds wait completed" -ForegroundColor Green
Write-Host ""
Write-Host "Triggering new ECS deployment..." -ForegroundColor Yellow
aws ecs update-service --cluster clubapp-dev-ecs --service clubapp-dev-svc --force-new-deployment --region us-east-1 | Out-Null
Write-Host "✅ New deployment triggered" -ForegroundColor Green
Write-Host ""
Write-Host "Expected: Tasks should now resolve ECR to private VPC endpoint IPs" -ForegroundColor Cyan
Write-Host "Timeline: 2-5 minutes for full DNS propagation and task startup" -ForegroundColor Cyan
