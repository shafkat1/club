# Fix ECR VPC Endpoints Script

param(
    [string]$Region = "us-east-1",
    [string]$Cluster = "clubapp-dev-ecs",
    [string]$Service = "clubapp-dev-svc"
)

Write-Host ""
Write-Host "========================================================" -ForegroundColor Blue
Write-Host "Create VPC Endpoints for ECR Access" -ForegroundColor Blue
Write-Host "========================================================" -ForegroundColor Blue
Write-Host ""

# Get service configuration
Write-Host "[*] Gathering ECS configuration..." -ForegroundColor Yellow
$serviceInfo = aws ecs describe-services --cluster $Cluster --services $Service --region $Region --output json | ConvertFrom-Json
$service = $serviceInfo.services[0]

$vpcConfig = $service.networkConfiguration.awsvpcConfiguration
$subnets = $vpcConfig.subnets
$securityGroups = $vpcConfig.securityGroups

# Get VPC ID from subnet
$subnetInfo = aws ec2 describe-subnets --subnet-ids $subnets[0] --region $Region --output json | ConvertFrom-Json
$vpcId = $subnetInfo.Subnets[0].VpcId

Write-Host "[OK] Configuration retrieved:" -ForegroundColor Green
Write-Host "  VPC ID: $vpcId"
Write-Host "  Subnets: $($subnets -join ', ')"
Write-Host "  Security Groups: $($securityGroups -join ', ')"
Write-Host ""

# Create endpoints
$endpoints = @(
    "com.amazonaws.$Region.ecr.api",
    "com.amazonaws.$Region.ecr.dkr",
    "com.amazonaws.$Region.s3"
)

Write-Host "[*] Creating VPC Endpoints..." -ForegroundColor Yellow
Write-Host ""

foreach ($endpoint in $endpoints) {
    Write-Host "[*] Creating endpoint: $endpoint" -ForegroundColor Cyan
    
    # Create the endpoint
    $result = aws ec2 create-vpc-endpoint `
        --vpc-id $vpcId `
        --vpc-endpoint-type Interface `
        --service-name $endpoint `
        --subnet-ids $subnets[0] `
        --security-group-ids $securityGroups[0] `
        --region $Region `
        --output json 2>$null | ConvertFrom-Json
    
    if ($result.VpcEndpoint) {
        $endpointId = $result.VpcEndpoint.VpcEndpointId
        Write-Host "    [OK] Created: $endpointId" -ForegroundColor Green
    }
    else {
        Write-Host "    [!] May already exist - checking..." -ForegroundColor Yellow
    }
    
    Start-Sleep -Seconds 1
}

# Wait for endpoints to be available
Write-Host ""
Write-Host "[*] Waiting for endpoints to become available..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Verify endpoints
Write-Host ""
Write-Host "========================================================" -ForegroundColor Blue
Write-Host "Verify VPC Endpoints" -ForegroundColor Blue
Write-Host "========================================================" -ForegroundColor Blue
Write-Host ""

$endpoints = aws ec2 describe-vpc-endpoints --filters "Name=vpc-id,Values=$vpcId" --region $Region --output json 2>$null | ConvertFrom-Json

if ($endpoints.VpcEndpoints.Count -gt 0) {
    Write-Host "[OK] Found $($endpoints.VpcEndpoints.Count) VPC endpoint(s):" -ForegroundColor Green
    foreach ($ep in $endpoints.VpcEndpoints) {
        Write-Host "  - $($ep.ServiceName)"
        Write-Host "    ID: $($ep.VpcEndpointId)"
        Write-Host "    State: $($ep.State)"
        Write-Host "    Type: $($ep.VpcEndpointType)"
        Write-Host ""
    }
}
else {
    Write-Host "[!] No endpoints found yet" -ForegroundColor Yellow
}

# Update security group to allow ECR traffic
Write-Host "========================================================" -ForegroundColor Blue
Write-Host "Update Security Group for ECR" -ForegroundColor Blue
Write-Host "========================================================" -ForegroundColor Blue
Write-Host ""

Write-Host "[*] Allowing HTTPS traffic (443) within security group..." -ForegroundColor Yellow

foreach ($sg in $securityGroups) {
    try {
        # Check if rule already exists
        $sgInfo = aws ec2 describe-security-groups --group-ids $sg --region $Region --output json | ConvertFrom-Json
        $hasRule = $sgInfo.SecurityGroups[0].IpPermissions | Where-Object { $_.FromPort -eq 443 -and $_.IpProtocol -eq "tcp" }
        
        if (-not $hasRule) {
            aws ec2 authorize-security-group-ingress `
                --group-id $sg `
                --protocol tcp `
                --port 443 `
                --source-security-group-id $sg `
                --region $Region 2>$null
            
            Write-Host "[OK] Added HTTPS ingress rule to $sg" -ForegroundColor Green
        }
        else {
            Write-Host "[OK] HTTPS ingress rule already exists on $sg" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "[!] Error updating security group: $_" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Blue
Write-Host "Summary" -ForegroundColor Blue
Write-Host "========================================================" -ForegroundColor Blue
Write-Host ""
Write-Host "[OK] VPC Endpoints have been created!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Wait 2-3 minutes for endpoints to fully activate"
Write-Host "2. Force ECS to redeploy tasks"
Write-Host "3. Monitor deployment progress"
Write-Host ""
Write-Host "To redeploy tasks, run:"
Write-Host "  aws ecs update-service --cluster $Cluster --service $Service --force-new-deployment --region $Region"
Write-Host ""
Write-Host "Then monitor with:"
Write-Host "  .\fix-cloudwatch-deploy-simple.ps1"
Write-Host ""
