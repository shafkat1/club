param(
    [string]$Cluster = "clubapp-dev-ecs",
    [string]$Service = "clubapp-dev-svc",
    [string]$TaskDef = "clubapp-backend-task:7",
    [string]$Region = "us-east-1"
)

Write-Host "Updating ECS Service..." -ForegroundColor Cyan
Write-Host "Cluster: $Cluster"
Write-Host "Service: $Service"
Write-Host "Task Definition: $TaskDef"
Write-Host "Region: $Region"
Write-Host ""

# First, verify cluster exists
Write-Host "Checking if cluster exists..." -ForegroundColor Yellow
try {
    $clusters = aws ecs list-clusters --region $Region --output json | ConvertFrom-Json
    Write-Host "Available clusters:"
    $clusters.clusterArns | ForEach-Object {
        Write-Host "  - $_"
    }
    Write-Host ""
}
catch {
    Write-Host "Error listing clusters: $_" -ForegroundColor Red
}

# Try to get cluster details
Write-Host "Getting cluster details..." -ForegroundColor Yellow
try {
    $clusterDetails = aws ecs describe-clusters --clusters $Cluster --region $Region --output json 2>&1
    Write-Host "Cluster details response: $clusterDetails"
    Write-Host ""
}
catch {
    Write-Host "Error describing cluster: $_" -ForegroundColor Red
}

# Try to update service
Write-Host "Attempting to update service..." -ForegroundColor Yellow
try {
    $result = aws ecs update-service `
        --cluster $Cluster `
        --service $Service `
        --task-definition $TaskDef `
        --region $Region `
        --output json 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Service updated successfully!" -ForegroundColor Green
        Write-Host $result
    }
    else {
        Write-Host "❌ Error updating service:" -ForegroundColor Red
        Write-Host $result
    }
}
catch {
    Write-Host "❌ Exception occurred: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Update attempt completed."
