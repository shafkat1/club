# CloudWatch Log Group Setup Script for PowerShell

param(
    [string]$LogGroup = "/ecs/clubapp-backend",
    [string]$Region = "us-east-1",
    [string]$Cluster = "clubapp-dev-ecs",
    [string]$Service = "clubapp-dev-svc",
    [int]$RetentionDays = 7,
    [int]$MaxWaitTime = 600,
    [int]$CheckInterval = 10
)

Write-Host ""
Write-Host "========================================================" -ForegroundColor Blue
Write-Host "ECS Deployment Fix - CloudWatch Setup" -ForegroundColor Blue
Write-Host "========================================================" -ForegroundColor Blue
Write-Host ""

Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "  Log Group: $LogGroup"
Write-Host "  Region: $Region"
Write-Host "  Cluster: $Cluster"
Write-Host "  Service: $Service"
Write-Host ""

# Check AWS CLI
Write-Host "[*] Checking AWS CLI..." -ForegroundColor Yellow
try {
    $null = aws --version
    Write-Host "[OK] AWS CLI found" -ForegroundColor Green
}
catch {
    Write-Host "[ERROR] AWS CLI not installed" -ForegroundColor Red
    exit 1
}

# Check credentials
Write-Host "[*] Checking AWS credentials..." -ForegroundColor Yellow
try {
    $null = aws sts get-caller-identity --region $Region 2>$null
    Write-Host "[OK] AWS credentials valid" -ForegroundColor Green
}
catch {
    Write-Host "[ERROR] AWS credentials not configured" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Blue
Write-Host "Step 1: Creating CloudWatch Log Group" -ForegroundColor Blue
Write-Host "========================================================" -ForegroundColor Blue
Write-Host ""

# Check if log group exists
$result = aws logs describe-log-groups --log-group-name-prefix $LogGroup --region $Region --output json 2>$null
if ($result) {
    $groups = $result | ConvertFrom-Json
    $exists = $groups.logGroups | Where-Object { $_.logGroupName -eq $LogGroup }
    if ($exists) {
        Write-Host "[OK] Log group already exists: $LogGroup" -ForegroundColor Green
    }
    else {
        Write-Host "[*] Creating log group..." -ForegroundColor Yellow
        aws logs create-log-group --log-group-name $LogGroup --region $Region
        Write-Host "[OK] Log group created: $LogGroup" -ForegroundColor Green
    }
}
else {
    Write-Host "[*] Creating log group..." -ForegroundColor Yellow
    aws logs create-log-group --log-group-name $LogGroup --region $Region
    Write-Host "[OK] Log group created: $LogGroup" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Blue
Write-Host "Step 2: Setting Log Retention Policy" -ForegroundColor Blue
Write-Host "========================================================" -ForegroundColor Blue
Write-Host ""

Write-Host "[*] Setting retention to $RetentionDays days..." -ForegroundColor Yellow
aws logs put-retention-policy --log-group-name $LogGroup --retention-in-days $RetentionDays --region $Region
Write-Host "[OK] Retention policy set to $RetentionDays days" -ForegroundColor Green

Write-Host ""
Write-Host "========================================================" -ForegroundColor Blue
Write-Host "Step 3: Waiting for Tasks to Start" -ForegroundColor Blue
Write-Host "========================================================" -ForegroundColor Blue
Write-Host ""

Write-Host "[*] Waiting for ECS to retry failed tasks..." -ForegroundColor Yellow
Write-Host "[*] This may take 1-2 minutes..." -ForegroundColor Yellow
Write-Host ""

$elapsed = 0
$successfulStart = $false

while ($elapsed -lt $MaxWaitTime) {
    $serviceInfo = aws ecs describe-services --cluster $Cluster --services $Service --region $Region --output json 2>$null | ConvertFrom-Json
    
    $runningCount = $serviceInfo.services[0].runningCount
    $desiredCount = $serviceInfo.services[0].desiredCount
    $status = $serviceInfo.services[0].status
    
    Write-Host -NoNewline "`r[*] Elapsed: $($elapsed)s | Running: $runningCount/$desiredCount | Status: $status"
    
    if ($runningCount -ge $desiredCount -and $runningCount -gt 0) {
        Write-Host ""
        Write-Host "[OK] Task(s) started successfully!" -ForegroundColor Green
        $successfulStart = $true
        break
    }
    
    Start-Sleep -Seconds $CheckInterval
    $elapsed += $CheckInterval
}

if (-not $successfulStart) {
    Write-Host ""
    Write-Host "[!] Timed out waiting for tasks (may still be starting)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Blue
Write-Host "Step 4: Service Details" -ForegroundColor Blue
Write-Host "========================================================" -ForegroundColor Blue
Write-Host ""

$serviceInfo = aws ecs describe-services --cluster $Cluster --services $Service --region $Region --output json 2>$null | ConvertFrom-Json
$runningCount = $serviceInfo.services[0].runningCount
$desiredCount = $serviceInfo.services[0].desiredCount
$status = $serviceInfo.services[0].status

Write-Host "Service Status:"
Write-Host "  Status: $status"
Write-Host "  Desired Count: $desiredCount"
Write-Host "  Running Count: $runningCount"
Write-Host ""

if ($runningCount -eq $desiredCount -and $runningCount -gt 0) {
    Write-Host "[OK] Service is healthy!" -ForegroundColor Green
}
else {
    Write-Host "[!] Service not fully healthy yet" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Blue
Write-Host "Step 5: Recent Service Events" -ForegroundColor Blue
Write-Host "========================================================" -ForegroundColor Blue
Write-Host ""

$events = $serviceInfo.services[0].events | Select-Object -First 5
foreach ($event in $events) {
    Write-Host "  - $($event.createdAt): $($event.message)"
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Blue
Write-Host "Deployment Summary" -ForegroundColor Blue
Write-Host "========================================================" -ForegroundColor Blue
Write-Host ""

Write-Host "[OK] CloudWatch log group created: $LogGroup" -ForegroundColor Green
Write-Host "[OK] Retention policy set: $RetentionDays days" -ForegroundColor Green
Write-Host ""
Write-Host "Current Service Status:"
Write-Host "   Running: $runningCount/$desiredCount tasks"
Write-Host "   Cluster: $Cluster"
Write-Host "   Service: $Service"
Write-Host "   Region: $Region"
Write-Host ""

if ($runningCount -eq $desiredCount -and $runningCount -gt 0) {
    Write-Host "[OK] Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "View Service:"
    Write-Host "   https://console.aws.amazon.com/ecs/v2/clusters/$Cluster/services/$Service"
    Write-Host ""
    Write-Host "View Logs:"
    Write-Host "   aws logs tail $LogGroup --follow"
    Write-Host ""
    Write-Host "Check Task Status:"
    Write-Host "   aws ecs list-tasks --cluster $Cluster --service-name $Service --region $Region"
}
else {
    Write-Host "[!] Deployment still in progress" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Keep monitoring:"
    Write-Host "   aws ecs describe-services --cluster $Cluster --services $Service --region $Region"
    Write-Host ""
    Write-Host "Check logs:"
    Write-Host "   aws logs tail $LogGroup --follow"
}

Write-Host ""
