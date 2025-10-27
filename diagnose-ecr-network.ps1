# Diagnostic Script: ECR Network Connectivity Issues

param(
    [string]$Region = "us-east-1",
    [string]$Cluster = "clubapp-dev-ecs",
    [string]$Service = "clubapp-dev-svc"
)

Write-Host ""
Write-Host "========================================================" -ForegroundColor Blue
Write-Host "ECR Network Connectivity Diagnostics" -ForegroundColor Blue
Write-Host "========================================================" -ForegroundColor Blue
Write-Host ""

# Get ECS Service Configuration
Write-Host "[*] Gathering ECS service configuration..." -ForegroundColor Yellow
$serviceInfo = aws ecs describe-services --cluster $Cluster --services $Service --region $Region --output json | ConvertFrom-Json
$service = $serviceInfo.services[0]

Write-Host "[OK] ECS Service found" -ForegroundColor Green
Write-Host ""

# Extract VPC Configuration
Write-Host "========================================================" -ForegroundColor Blue
Write-Host "VPC Configuration" -ForegroundColor Blue
Write-Host "========================================================" -ForegroundColor Blue
Write-Host ""

$vpcConfig = $service.networkConfiguration.awsvpcConfiguration
$subnets = $vpcConfig.subnets
$securityGroups = $vpcConfig.securityGroups

Write-Host "Subnets:"
foreach ($subnet in $subnets) {
    Write-Host "  - $subnet"
}

Write-Host ""
Write-Host "Security Groups:"
foreach ($sg in $securityGroups) {
    Write-Host "  - $sg"
}

Write-Host ""
Write-Host "[*] Fetching subnet details..." -ForegroundColor Yellow

foreach ($subnet in $subnets) {
    $subnetInfo = aws ec2 describe-subnets --subnet-ids $subnet --region $Region --output json | ConvertFrom-Json
    $subnetDetail = $subnetInfo.Subnets[0]
    
    Write-Host ""
    Write-Host "Subnet: $subnet"
    Write-Host "  VPC ID: $($subnetDetail.VpcId)"
    Write-Host "  CIDR Block: $($subnetDetail.CidrBlock)"
    Write-Host "  Availability Zone: $($subnetDetail.AvailabilityZone)"
    Write-Host "  Map Public IP: $($subnetDetail.MapPublicIpOnLaunch)"
    
    # Check for route to NAT/IGW
    $routeTable = aws ec2 describe-route-tables --filters "Name=association.subnet-id,Values=$subnet" --region $Region --output json | ConvertFrom-Json
    
    if ($routeTable.RouteTables.Count -gt 0) {
        $routes = $routeTable.RouteTables[0].Routes
        Write-Host "  Routes:"
        foreach ($route in $routes) {
            if ($route.DestinationCidrBlock -eq "0.0.0.0/0") {
                if ($route.NatGatewayId) {
                    Write-Host "    - 0.0.0.0/0 via NAT Gateway: $($route.NatGatewayId)"
                }
                elseif ($route.GatewayId) {
                    Write-Host "    - 0.0.0.0/0 via Gateway: $($route.GatewayId)"
                }
                else {
                    Write-Host "    - 0.0.0.0/0 via Network Interface: $($route.NetworkInterfaceId)"
                }
            }
            else {
                Write-Host "    - $($route.DestinationCidrBlock)"
            }
        }
    }
}

# Check Security Groups
Write-Host ""
Write-Host "========================================================" -ForegroundColor Blue
Write-Host "Security Group Rules" -ForegroundColor Blue
Write-Host "========================================================" -ForegroundColor Blue
Write-Host ""

foreach ($sgId in $securityGroups) {
    $sgInfo = aws ec2 describe-security-groups --group-ids $sgId --region $Region --output json | ConvertFrom-Json
    $sg = $sgInfo.SecurityGroups[0]
    
    Write-Host "Security Group: $sgId ($($sg.GroupName))"
    Write-Host "  Egress Rules (Outbound):"
    
    $egress = $sg.IpPermissionsEgress
    foreach ($rule in $egress) {
        $protocol = $rule.IpProtocol
        if ($protocol -eq "-1") { $protocol = "All" }
        
        $ports = ""
        if ($rule.FromPort -ne $null) {
            if ($rule.FromPort -eq $rule.ToPort) {
                $ports = ":$($rule.FromPort)"
            }
            else {
                $ports = ":$($rule.FromPort)-$($rule.ToPort)"
            }
        }
        
        $target = ""
        if ($rule.IpRanges.Count -gt 0) {
            $target = $rule.IpRanges[0].CidrIp
        }
        elseif ($rule.UserIdGroupPairs.Count -gt 0) {
            $target = $rule.UserIdGroupPairs[0].GroupId
        }
        else {
            $target = "Various"
        }
        
        Write-Host "    - Protocol: $protocol$ports to $target"
    }
    Write-Host ""
}

# Check for VPC Endpoints
Write-Host "========================================================" -ForegroundColor Blue
Write-Host "VPC Endpoints (For ECR Access)" -ForegroundColor Blue
Write-Host "========================================================" -ForegroundColor Blue
Write-Host ""

Write-Host "[*] Checking for VPC endpoints..." -ForegroundColor Yellow

$endpoints = aws ec2 describe-vpc-endpoints --filters "Name=vpc-id,Values=$($subnetDetail.VpcId)" --region $Region --output json 2>$null | ConvertFrom-Json

if ($endpoints.VpcEndpoints.Count -gt 0) {
    Write-Host "[OK] Found $($endpoints.VpcEndpoints.Count) VPC endpoint(s):" -ForegroundColor Green
    foreach ($endpoint in $endpoints.VpcEndpoints) {
        Write-Host "  - $($endpoint.ServiceName) (ID: $($endpoint.VpcEndpointId))"
        Write-Host "    Status: $($endpoint.State)"
        Write-Host "    Type: $($endpoint.VpcEndpointType)"
    }
}
else {
    Write-Host "[!] No VPC endpoints found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "To access ECR from private subnets, you need VPC endpoints for:"
    Write-Host "  - com.amazonaws.$Region.ecr.api"
    Write-Host "  - com.amazonaws.$Region.ecr.dkr"
    Write-Host "  - com.amazonaws.$Region.s3"
    Write-Host ""
}

# Check Recent Task Events
Write-Host ""
Write-Host "========================================================" -ForegroundColor Blue
Write-Host "Recent Task Failures" -ForegroundColor Blue
Write-Host "========================================================" -ForegroundColor Blue
Write-Host ""

Write-Host "[*] Checking recent failed tasks..." -ForegroundColor Yellow

$tasks = aws ecs list-tasks --cluster $Cluster --service-name $Service --desired-status STOPPED --region $Region --output json 2>$null | ConvertFrom-Json

if ($tasks.taskArns.Count -gt 0) {
    Write-Host "[OK] Found $($tasks.taskArns.Count) stopped task(s)" -ForegroundColor Green
    
    # Get details of last stopped task
    $lastTask = $tasks.taskArns[0]
    $taskDetails = aws ecs describe-tasks --cluster $Cluster --tasks $lastTask --region $Region --output json | ConvertFrom-Json
    $task = $taskDetails.tasks[0]
    
    Write-Host ""
    Write-Host "Last Stopped Task: $($task.taskArn)"
    Write-Host "Stop Code: $($task.stopCode)"
    Write-Host "Stop Reason: $($task.stoppingAt)"
    Write-Host ""
    
    if ($task.containers.Count -gt 0) {
        $container = $task.containers[0]
        Write-Host "Container Status: $($container.lastStatus)"
        if ($container.reason) {
            Write-Host "Reason: $($container.reason)"
        }
    }
}
else {
    Write-Host "[!] No stopped tasks found" -ForegroundColor Yellow
}

# Recommendations
Write-Host ""
Write-Host "========================================================" -ForegroundColor Blue
Write-Host "Recommendations" -ForegroundColor Blue
Write-Host "========================================================" -ForegroundColor Blue
Write-Host ""

if ($endpoints.VpcEndpoints.Count -eq 0) {
    Write-Host "[*] PRIMARY ISSUE: No VPC Endpoints Found" -ForegroundColor Red
    Write-Host ""
    Write-Host "Solution: Create VPC endpoints for ECR access"
    Write-Host "  1. Run: fix-ecr-vpc-endpoints.ps1"
    Write-Host ""
    Write-Host "This will create the necessary endpoints for ECR image pulling"
}
else {
    Write-Host "[*] VPC Endpoints are configured" -ForegroundColor Green
    Write-Host ""
    Write-Host "Possible issues:"
    Write-Host "  1. Security group rules too restrictive"
    Write-Host "  2. Network ACLs blocking traffic"
    Write-Host "  3. Subnet routing not configured correctly"
    Write-Host "  4. Check CloudWatch logs for detailed errors"
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Blue
Write-Host "Next Steps" -ForegroundColor Blue
Write-Host "========================================================" -ForegroundColor Blue
Write-Host ""
Write-Host "1. Review the diagnostics above"
Write-Host "2. Run: fix-ecr-vpc-endpoints.ps1 (if no endpoints found)"
Write-Host "3. Wait 2-3 minutes for endpoints to become available"
Write-Host "4. Run: .\fix-cloudwatch-deploy-simple.ps1 (to monitor deployment)"
Write-Host ""
