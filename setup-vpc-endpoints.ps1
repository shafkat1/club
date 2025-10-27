#!/usr/bin/env pwsh

Write-Host "Setting up VPC Endpoints for ECR access..." -ForegroundColor Cyan
Write-Host ""

# Get VPC ID from the subnet
Write-Host "Getting VPC ID from subnet..." -ForegroundColor Yellow
$subnetInfo = aws ec2 describe-subnets `
  --subnet-ids subnet-092a57b2e8874db10 `
  --region us-east-1 `
  --query 'Subnets[0]' `
  --output json | ConvertFrom-Json

$VPC_ID = $subnetInfo.VpcId
$SUBNET_1 = "subnet-092a57b2e8874db10"
$SUBNET_2 = "subnet-02a56a1d839f819ba"
$SG_ID = "sg-0512c36f727263750"

Write-Host "VPC ID: $VPC_ID"
Write-Host "Subnets: $SUBNET_1, $SUBNET_2"
Write-Host "Security Group: $SG_ID"
Write-Host ""

# Create ECR API endpoint
Write-Host "Creating ECR API endpoint..." -ForegroundColor Yellow
$ecrApiEndpoint = aws ec2 create-vpc-endpoint `
  --vpc-id $VPC_ID `
  --service-name "com.amazonaws.us-east-1.ecr.api" `
  --vpc-endpoint-type Interface `
  --subnet-ids $SUBNET_1 $SUBNET_2 `
  --security-group-ids $SG_ID `
  --region us-east-1 `
  --query 'VpcEndpoint.VpcEndpointId' `
  --output text

Write-Host "✅ ECR API Endpoint created: $ecrApiEndpoint"
Write-Host ""

# Create ECR DKR endpoint
Write-Host "Creating ECR DKR endpoint..." -ForegroundColor Yellow
$ecrDkrEndpoint = aws ec2 create-vpc-endpoint `
  --vpc-id $VPC_ID `
  --service-name "com.amazonaws.us-east-1.ecr.dkr" `
  --vpc-endpoint-type Interface `
  --subnet-ids $SUBNET_1 $SUBNET_2 `
  --security-group-ids $SG_ID `
  --region us-east-1 `
  --query 'VpcEndpoint.VpcEndpointId' `
  --output text

Write-Host "✅ ECR DKR Endpoint created: $ecrDkrEndpoint"
Write-Host ""

# Create S3 endpoint
Write-Host "Creating S3 endpoint..." -ForegroundColor Yellow
$s3Endpoint = aws ec2 create-vpc-endpoint `
  --vpc-id $VPC_ID `
  --service-name "com.amazonaws.us-east-1.s3" `
  --vpc-endpoint-type Gateway `
  --region us-east-1 `
  --query 'VpcEndpoint.VpcEndpointId' `
  --output text

Write-Host "✅ S3 Endpoint created: $s3Endpoint"
Write-Host ""

Write-Host "✅ All VPC endpoints created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Now force deploying ECS service to use new endpoints..." -ForegroundColor Cyan
aws ecs update-service `
  --cluster clubapp-dev-ecs `
  --service clubapp-dev-svc `
  --force-new-deployment `
  --region us-east-1

Write-Host ""
Write-Host "✅ Service deployment triggered!" -ForegroundColor Green
Write-Host "Tasks should now be able to access ECR and start successfully."
