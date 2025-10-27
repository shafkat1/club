# 🚀 ECS Deployment Fix Script (PowerShell Version)
# Creates CloudWatch log group and monitors deployment

param(
    [string]$LogGroup = "/ecs/clubapp-backend",
    [string]$Region = "us-east-1",
    [string]$Cluster = "clubapp-dev-ecs",
    [string]$Service = "clubapp-dev-svc",
    [int]$RetentionDays = 7,
    [int]$MaxWaitTime = 600,
    [int]$CheckInterval = 10
)

# Function to print headers
function Print-Header {
    param([string]$Message)
    Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Blue
    Write-Host "║ $Message" -ForegroundColor Blue
    Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Blue
}

# Function to print success messages
function Print-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

# Function to print error messages
function Print-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Function to print warnings
function Print-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

# Function to print info messages
function Print-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Cyan
}

# Check AWS CLI is installed
function Check-AwsCli {
    try {
        $null = aws --version
        Print-Success "AWS CLI found"
    }
    catch {
        Print-Error "AWS CLI is not installed or not in PATH"
        exit 1
    }
}

# Check AWS credentials
function Check-AwsCredentials {
    try {
        $null = aws sts get-caller-identity --region $Region 2>$null
        Print-Success "AWS credentials valid"
    }
    catch {
        Print-Error "AWS credentials not configured or invalid"
        exit 1
    }
}

# Create CloudWatch log group
function Create-LogGroup {
    Print-Header "Step 1: Creating CloudWatch Log Group"
    
    # Check if log group exists
    try {
        $group = aws logs describe-log-groups `
            --log-group-name-prefix $LogGroup `
            --region $Region `
            --query "logGroups[?logGroupName=='$LogGroup']" `
            --output json | ConvertFrom-Json
        
        if ($group.Count -gt 0) {
            Print-Warning "Log group already exists: $LogGroup"
            return
        }
    }
    catch { }
    
    Print-Info "Creating log group: $LogGroup"
    aws logs create-log-group `
        --log-group-name $LogGroup `
        --region $Region
    
    Print-Success "Log group created: $LogGroup"
}

# Set log retention
function Set-RetentionPolicy {
    Print-Header "Step 2: Setting Log Retention Policy"
    
    Print-Info "Setting retention to $RetentionDays days"
    aws logs put-retention-policy `
        --log-group-name $LogGroup `
        --retention-in-days $RetentionDays `
        --region $Region
    
    Print-Success "Retention policy set to $RetentionDays days"
}

# Wait for tasks to start
function Wait-ForTasks {
    Print-Header "Step 3: Waiting for Tasks to Start"
    
    $elapsed = 0
    Print-Info "Waiting for ECS to retry failed tasks..."
    Print-Info "This may take 1-2 minutes..."
    Write-Host ""
    
    while ($elapsed -lt $MaxWaitTime) {
        $serviceInfo = aws ecs describe-services `
            --cluster $Cluster `
            --services $Service `
            --region $Region `
            --query 'services[0]' `
            --output json | ConvertFrom-Json
        
        $runningCount = $serviceInfo.runningCount
        $desiredCount = $serviceInfo.desiredCount
        $status = $serviceInfo.status
        
        Write-Host "`r⏳ Elapsed: $($elapsed)s | Running: $runningCount/$desiredCount | Status: $status" -NoNewline
        
        if ($runningCount -ge $desiredCount -and $runningCount -gt 0) {
            Write-Host ""
            Print-Success "Task(s) started successfully!"
            return $true
        }
        
        Start-Sleep -Seconds $CheckInterval
        $elapsed += $CheckInterval
    }
    
    Write-Host ""
    Print-Warning "Timed out waiting for tasks to start"
    Print-Info "Tasks may still be starting. Check status manually:"
    Print-Info "aws ecs describe-services --cluster $Cluster --services $Service --region $Region"
    return $false
}

# Check service details
function Check-ServiceDetails {
    Print-Header "Step 4: Service Details"
    
    $serviceInfo = aws ecs describe-services `
        --cluster $Cluster `
        --services $Service `
        --region $Region `
        --query 'services[0]' `
        --output json | ConvertFrom-Json
    
    $runningCount = $serviceInfo.runningCount
    $desiredCount = $serviceInfo.desiredCount
    $status = $serviceInfo.status
    $taskDef = ($serviceInfo.taskDefinition -split ':')[-2]
    
    Write-Host ""
    Write-Host "Service Status:"
    Write-Host "  Status: $status"
    Write-Host "  Desired Count: $desiredCount"
    Write-Host "  Running Count: $runningCount"
    Write-Host "  Task Definition: $taskDef"
    Write-Host ""
    
    if ($runningCount -eq $desiredCount -and $runningCount -gt 0) {
        Print-Success "Service is healthy!"
    }
    else {
        Print-Warning "Service not fully healthy yet"
    }
}

# Show recent events
function Show-RecentEvents {
    Print-Header "Step 5: Recent Service Events"
    
    $serviceInfo = aws ecs describe-services `
        --cluster $Cluster `
        --services $Service `
        --region $Region `
        --query 'services[0].events[0:5]' `
        --output json | ConvertFrom-Json
    
    foreach ($event in $serviceInfo) {
        Write-Host "  📌 $($event.createdAt): $($event.message)"
    }
    Write-Host ""
}

# Show logs
function Show-Logs {
    Print-Header "Step 6: CloudWatch Logs (Last 10 minutes)"
    
    $startTime = [int64]((Get-Date).AddMinutes(-10) - (Get-Date -Date "01/01/1970")).TotalMilliseconds
    
    try {
        $logEvents = aws logs filter-log-events `
            --log-group-name $LogGroup `
            --start-time $startTime `
            --region $Region `
            --query 'events[0:20]' `
            --output json | ConvertFrom-Json
        
        if ($logEvents.Count -eq 0) {
            Print-Info "No logs yet (task may still be starting)"
        }
        else {
            Write-Host "Recent logs:"
            foreach ($event in $logEvents) {
                $timestamp = [System.DateTimeOffset]::FromUnixTimeMilliseconds($event.timestamp).DateTime
                Write-Host "  $timestamp`: $($event.message)"
            }
        }
    }
    catch {
        Print-Info "No logs yet (task may still be starting)"
    }
    Write-Host ""
}

# Print summary
function Print-Summary {
    Print-Header "Deployment Summary"
    
    $serviceInfo = aws ecs describe-services `
        --cluster $Cluster `
        --services $Service `
        --region $Region `
        --query 'services[0]' `
        --output json | ConvertFrom-Json
    
    $runningCount = $serviceInfo.runningCount
    $desiredCount = $serviceInfo.desiredCount
    
    Write-Host ""
    Write-Host "✅ CloudWatch log group created: $LogGroup"
    Write-Host "✅ Retention policy set: $RetentionDays days"
    Write-Host ""
    Write-Host "📊 Current Service Status:"
    Write-Host "   Running: $runningCount/$desiredCount tasks"
    Write-Host "   Cluster: $Cluster"
    Write-Host "   Service: $Service"
    Write-Host "   Region: $Region"
    Write-Host ""
    
    if ($runningCount -eq $desiredCount -and $runningCount -gt 0) {
        Print-Success "Deployment successful!"
        Write-Host ""
        Write-Host "🔗 View Service:"
        Write-Host "   https://console.aws.amazon.com/ecs/v2/clusters/$Cluster/services/$Service"
        Write-Host ""
        Write-Host "📋 View Logs:"
        Write-Host "   aws logs tail $LogGroup --follow"
        Write-Host ""
        Write-Host "🔍 Check Task Status:"
        Write-Host "   aws ecs list-tasks --cluster $Cluster --service-name $Service --region $Region"
    }
    else {
        Print-Warning "Deployment still in progress"
        Write-Host ""
        Write-Host "📝 Keep monitoring:"
        Write-Host "   aws ecs describe-services --cluster $Cluster --services $Service --region $Region"
        Write-Host ""
        Write-Host "📋 Check logs:"
        Write-Host "   aws logs tail $LogGroup --follow"
    }
    Write-Host ""
}

# Main function
function Main {
    Print-Header "🚀 ECS Deployment Fix - CloudWatch Setup"
    Write-Host ""
    
    Print-Info "Configuration:"
    Print-Info "  Log Group: $LogGroup"
    Print-Info "  Region: $Region"
    Print-Info "  Cluster: $Cluster"
    Print-Info "  Service: $Service"
    Write-Host ""
    
    # Run checks
    Check-AwsCli
    Check-AwsCredentials
    Write-Host ""
    
    # Run deployment steps
    Create-LogGroup
    Write-Host ""
    
    Set-RetentionPolicy
    Write-Host ""
    
    Wait-ForTasks | Out-Null
    Write-Host ""
    
    Check-ServiceDetails
    Show-RecentEvents
    Show-Logs
    
    Print-Summary
}

# Run main function
Main
