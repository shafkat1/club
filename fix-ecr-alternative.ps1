Write-Host "========================================" -ForegroundColor Blue
Write-Host "ALTERNATIVE ECR FIX - PUBLIC SUBNETS" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

Write-Host "Issue: ECR DNS resolution failing despite VPC endpoint configuration" -ForegroundColor Red
Write-Host "Solution: Use public subnets with internet gateway for ECR access" -ForegroundColor Yellow
Write-Host ""

# Get VPC ID
Write-Host "[1/6] Getting VPC Configuration..." -ForegroundColor Cyan
$subnet = aws ec2 describe-subnets --subnet-ids subnet-092a57b2e8874db10 --region us-east-1 | ConvertFrom-Json
$vpcId = $subnet.Subnets[0].VpcId
Write-Host "VPC ID: $vpcId" -ForegroundColor Yellow

# Check if subnets are public or private
Write-Host ""
Write-Host "[2/6] Checking subnet configuration..." -ForegroundColor Cyan
$subnet1 = aws ec2 describe-subnets --subnet-ids subnet-092a57b2e8874db10 --region us-east-1 | ConvertFrom-Json
$subnet2 = aws ec2 describe-subnets --subnet-ids subnet-02a56a1d839f819ba --region us-east-1 | ConvertFrom-Json

Write-Host "Subnet 1 (subnet-092a57b2e8874db10):" -ForegroundColor Yellow
Write-Host "  MapPublicIpOnLaunch: $($subnet1.Subnets[0].MapPublicIpOnLaunch)" -ForegroundColor Yellow
Write-Host "  AvailabilityZone: $($subnet1.Subnets[0].AvailabilityZone)" -ForegroundColor Yellow

Write-Host "Subnet 2 (subnet-02a56a1d839f819ba):" -ForegroundColor Yellow
Write-Host "  MapPublicIpOnLaunch: $($subnet2.Subnets[0].MapPublicIpOnLaunch)" -ForegroundColor Yellow
Write-Host "  AvailabilityZone: $($subnet2.Subnets[0].AvailabilityZone)" -ForegroundColor Yellow

# Check for internet gateway
Write-Host ""
Write-Host "[3/6] Checking for Internet Gateway..." -ForegroundColor Cyan
$igw = aws ec2 describe-internet-gateways --region us-east-1 --filters "Name=attachment.vpc-id,Values=$vpcId" | ConvertFrom-Json
if ($igw.InternetGateways.Count -gt 0) {
    Write-Host "✅ Internet Gateway found: $($igw.InternetGateways[0].InternetGatewayId)" -ForegroundColor Green
} else {
    Write-Host "❌ No Internet Gateway found - creating one..." -ForegroundColor Red
    
    # Create internet gateway
    $newIgw = aws ec2 create-internet-gateway --region us-east-1 | ConvertFrom-Json
    $igwId = $newIgw.InternetGateway.InternetGatewayId
    Write-Host "✅ Internet Gateway created: $igwId" -ForegroundColor Green
    
    # Attach to VPC
    aws ec2 attach-internet-gateway --internet-gateway-id $igwId --vpc-id $vpcId --region us-east-1
    Write-Host "✅ Internet Gateway attached to VPC" -ForegroundColor Green
}

# Check route tables for internet gateway routes
Write-Host ""
Write-Host "[4/6] Checking route tables..." -ForegroundColor Cyan
$routeTables = aws ec2 describe-route-tables --region us-east-1 --filters "Name=vpc-id,Values=$vpcId" | ConvertFrom-Json

foreach ($rt in $routeTables.RouteTables) {
    $hasInternetRoute = $false
    foreach ($route in $rt.Routes) {
        if ($route.GatewayId -and $route.GatewayId.StartsWith("igw-")) {
            $hasInternetRoute = $true
            break
        }
    }
    
    if ($hasInternetRoute) {
        Write-Host "✅ Route table $($rt.RouteTableId) has internet gateway route" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Route table $($rt.RouteTableId) missing internet gateway route" -ForegroundColor Yellow
        
        # Add internet gateway route
        if ($igw.InternetGateways.Count -gt 0) {
            $igwId = $igw.InternetGateways[0].InternetGatewayId
        } else {
            $igwId = $newIgw.InternetGateway.InternetGatewayId
        }
        
        aws ec2 create-route --route-table-id $rt.RouteTableId --destination-cidr-block 0.0.0.0/0 --gateway-id $igwId --region us-east-1
        Write-Host "✅ Added internet gateway route to $($rt.RouteTableId)" -ForegroundColor Green
    }
}

# Update ECS service to use public IP assignment
Write-Host ""
Write-Host "[5/6] Updating ECS service network configuration..." -ForegroundColor Cyan

# Get current service configuration
$service = aws ecs describe-services --cluster clubapp-dev-ecs --services clubapp-dev-svc --region us-east-1 | ConvertFrom-Json
$currentConfig = $service.services[0].networkConfiguration.awsvpcConfiguration

Write-Host "Current configuration:" -ForegroundColor Yellow
Write-Host "  Subnets: $($currentConfig.subnets -join ', ')" -ForegroundColor Yellow
Write-Host "  Security Groups: $($currentConfig.securityGroups -join ', ')" -ForegroundColor Yellow
Write-Host "  Assign Public IP: $($currentConfig.assignPublicIp)" -ForegroundColor Yellow

# Update service to ensure public IP assignment
aws ecs update-service `
    --cluster clubapp-dev-ecs `
    --service clubapp-dev-svc `
    --network-configuration "awsvpcConfiguration={subnets=[subnet-092a57b2e8874db10,subnet-02a56a1d839f819ba],securityGroups=[sg-0512c36f727263750],assignPublicIp=ENABLED}" `
    --region us-east-1 | Out-Null

Write-Host "✅ ECS service updated with public IP assignment" -ForegroundColor Green

# Force new deployment
Write-Host ""
Write-Host "[6/6] Triggering new deployment..." -ForegroundColor Cyan
aws ecs update-service --cluster clubapp-dev-ecs --service clubapp-dev-svc --force-new-deployment --region us-east-1 | Out-Null
Write-Host "✅ New deployment triggered" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Blue
Write-Host "ALTERNATIVE FIX APPLIED" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host "✅ Internet Gateway: Verified/Created" -ForegroundColor Green
Write-Host "✅ Route Tables: Updated with internet routes" -ForegroundColor Green
Write-Host "✅ ECS Service: Updated with public IP assignment" -ForegroundColor Green
Write-Host "✅ New Deployment: Triggered" -ForegroundColor Green
Write-Host ""
Write-Host "Expected: Tasks should now access ECR via internet gateway" -ForegroundColor Cyan
Write-Host "Timeline: 2-5 minutes for task startup" -ForegroundColor Cyan
Write-Host ""
Write-Host "Monitor with: aws logs tail /ecs/clubapp-backend --follow" -ForegroundColor Gray
