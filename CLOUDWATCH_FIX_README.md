# 🚀 CloudWatch Log Group Fix - Deployment Scripts

## Problem

Your ECS service is failing to start tasks because:

```
ResourceNotFoundException: The specified log group does not exist.
```

The task definition specifies logging to `/ecs/clubapp-backend`, but the CloudWatch log group was never created.

---

## Solution Overview

We've created two scripts to fix this automatically:
- **Bash script** for Linux/Mac/Git Bash
- **PowerShell script** for Windows

Both scripts will:
1. ✅ Create the CloudWatch log group
2. ✅ Set retention policy (7 days)
3. ✅ Wait for ECS to retry failed tasks
4. ✅ Monitor deployment progress
5. ✅ Show recent logs and events
6. ✅ Provide deployment summary

---

## 🚀 Quick Start

### Option 1: PowerShell (Windows) - Recommended

```powershell
# Run the script
.\fix-cloudwatch-and-deploy.ps1

# Or with custom values:
.\fix-cloudwatch-and-deploy.ps1 `
  -LogGroup "/ecs/clubapp-backend" `
  -Region "us-east-1" `
  -Cluster "clubapp-dev-ecs" `
  -Service "clubapp-dev-svc" `
  -RetentionDays 7
```

### Option 2: Bash (Mac/Linux/Git Bash)

```bash
# Make script executable
chmod +x fix-cloudwatch-and-deploy.sh

# Run the script
./fix-cloudwatch-and-deploy.sh

# Or with custom values:
./fix-cloudwatch-and-deploy.sh
```

---

## 📋 Prerequisites

### Required
- **AWS CLI** - Must be installed and in PATH
- **AWS Credentials** - Must be configured (`aws sts get-caller-identity` works)
- **jq** (Bash only) - For JSON parsing

### For Windows
- **PowerShell 5.0+** - Usually pre-installed
- **AWS CLI** - Download from: https://aws.amazon.com/cli/

### For Mac/Linux
- **Bash** - Usually pre-installed
- **AWS CLI** - Install with: `brew install awscli` or see https://aws.amazon.com/cli/
- **jq** - Install with: `brew install jq` (Mac) or `apt-get install jq` (Linux)

---

## 🔍 What the Script Does

### Step 1: Create CloudWatch Log Group
```bash
aws logs create-log-group --log-group-name /ecs/clubapp-backend --region us-east-1
```

### Step 2: Set Retention Policy
```bash
aws logs put-retention-policy --log-group-name /ecs/clubapp-backend --retention-in-days 7
```

### Step 3: Wait for Tasks to Start
- Polls ECS service status every 10 seconds
- Waits up to 10 minutes for tasks to reach running state
- Shows real-time progress

### Step 4: Show Service Details
```bash
aws ecs describe-services --cluster clubapp-dev-ecs --services clubapp-dev-svc
```

### Step 5: Show Recent Events
- Lists last 5 service events
- Helps diagnose any remaining issues

### Step 6: Show Recent Logs
- Displays logs from the last 10 minutes
- Useful for verifying application startup

---

## 📊 Expected Output

When you run the script, you'll see:

```
╔════════════════════════════════════════════════════╗
║ 🚀 ECS Deployment Fix - CloudWatch Setup           ║
╚════════════════════════════════════════════════════╝

ℹ️  Configuration:
ℹ️    Log Group: /ecs/clubapp-backend
ℹ️    Region: us-east-1
ℹ️    Cluster: clubapp-dev-ecs
ℹ️    Service: clubapp-dev-svc

✅ AWS CLI found
✅ AWS credentials valid

╔════════════════════════════════════════════════════╗
║ Step 1: Creating CloudWatch Log Group             ║
╚════════════════════════════════════════════════════╝

ℹ️  Creating log group: /ecs/clubapp-backend
✅ Log group created: /ecs/clubapp-backend

╔════════════════════════════════════════════════════╗
║ Step 2: Setting Log Retention Policy              ║
╚════════════════════════════════════════════════════╝

ℹ️  Setting retention to 7 days
✅ Retention policy set to 7 days

╔════════════════════════════════════════════════════╗
║ Step 3: Waiting for Tasks to Start                ║
╚════════════════════════════════════════════════════╝

ℹ️  Waiting for ECS to retry failed tasks...
ℹ️  This may take 1-2 minutes...

⏳ Elapsed:  60 seconds | Running: 1/1 | Status: ACTIVE
✅ Task(s) started successfully!

[... more output ...]

✅ Deployment successful!

🔗 View Service:
   https://console.aws.amazon.com/ecs/v2/clusters/clubapp-dev-ecs/services/clubapp-dev-svc

📋 View Logs:
   aws logs tail /ecs/clubapp-backend --follow
```

---

## ✅ Success Indicators

After the script completes, check for:

- ✅ `✅ Log group created`
- ✅ `✅ Retention policy set`
- ✅ `✅ Task(s) started successfully!`
- ✅ `✅ Service is healthy!`
- ✅ `✅ Deployment successful!`
- ✅ Running: 1/1 tasks

---

## 🔧 Troubleshooting

### Script exits with "AWS CLI not found"

**Solution**: Install AWS CLI from https://aws.amazon.com/cli/

```bash
# Mac
brew install awscli

# Windows
# Download from: https://aws.amazon.com/cli/
```

### Script exits with "AWS credentials not configured"

**Solution**: Configure AWS credentials

```bash
aws configure

# Or set environment variables:
export AWS_ACCESS_KEY_ID="your-key"
export AWS_SECRET_ACCESS_KEY="your-secret"
export AWS_DEFAULT_REGION="us-east-1"
```

### Log group already exists but still failing

**Solution**: The script will skip creation if it exists. Check if retention policy is set:

```bash
aws logs describe-log-groups --log-group-name-prefix /ecs/clubapp-backend
```

### Script times out waiting for tasks

**Solution**: Tasks may still be starting. Check manually:

```bash
# Check service status
aws ecs describe-services \
  --cluster clubapp-dev-ecs \
  --services clubapp-dev-svc \
  --region us-east-1 \
  --query 'services[0].[runningCount,desiredCount]'

# Check recent events
aws ecs describe-services \
  --cluster clubapp-dev-ecs \
  --services clubapp-dev-svc \
  --region us-east-1 \
  --query 'services[0].events[0:5]'

# View logs
aws logs tail /ecs/clubapp-backend --follow
```

### Tasks fail with different error

**Common errors**:

1. **ECR image not found**
   ```
   CannotPullContainerError: pull image manifest has been retried
   ```
   Solution: Verify image exists in ECR

   ```bash
   aws ecr list-images --repository-name clubapp-backend
   ```

2. **Invalid task role**
   ```
   ECS was unable to assume the role 'arn:aws:iam::...'
   ```
   Solution: Check task role trust policy

   ```bash
   aws iam get-role --role-name ecsTaskRole
   ```

3. **VPC/Network issue**
   ```
   i/o timeout connecting to service
   ```
   Solution: Check VPC endpoints or NAT gateway

---

## 📝 Manual Alternative (If Script Fails)

If the script doesn't work, you can run the commands manually:

```bash
# 1. Create log group
aws logs create-log-group \
  --log-group-name /ecs/clubapp-backend \
  --region us-east-1

# 2. Set retention
aws logs put-retention-policy \
  --log-group-name /ecs/clubapp-backend \
  --retention-in-days 7 \
  --region us-east-1

# 3. Wait 1-2 minutes for ECS to retry

# 4. Check status
aws ecs describe-services \
  --cluster clubapp-dev-ecs \
  --services clubapp-dev-svc \
  --region us-east-1 \
  --query 'services[0].[runningCount,desiredCount,status]'

# 5. View logs
aws logs tail /ecs/clubapp-backend --follow
```

---

## 🎯 Next Steps

### After Deployment Succeeds

1. **Verify application is responding**
   ```bash
   # Port forward to your local machine or check via load balancer
   curl http://your-alb-dns/health
   ```

2. **Monitor logs regularly**
   ```bash
   aws logs tail /ecs/clubapp-backend --follow
   ```

3. **Set up CloudWatch alarms** (optional)
   ```bash
   # Monitor for errors
   aws cloudwatch put-metric-alarm \
     --alarm-name clubapp-backend-errors \
     --alarm-description "Alert on backend errors" \
     --metric-name ErrorCount \
     --namespace AWS/ECS
   ```

### Future Deployments

The CloudWatch log group now exists, so future deployments will work automatically:

```bash
# Push backend code
git add backend/
git commit -m "your-feature"
git push origin main

# GitHub Actions will automatically deploy
# Watch at: https://github.com/shafkat1/club/actions
```

---

## 📞 Support

### Getting Help

1. **Check the logs first**
   ```bash
   aws logs tail /ecs/clubapp-backend --follow
   ```

2. **See service events**
   ```bash
   aws ecs describe-services \
     --cluster clubapp-dev-ecs \
     --services clubapp-dev-svc \
     --region us-east-1 \
     --query 'services[0].events[0:20]'
   ```

3. **Check ECS task details**
   ```bash
   aws ecs list-tasks --cluster clubapp-dev-ecs
   aws ecs describe-tasks --cluster clubapp-dev-ecs --tasks <task-arn>
   ```

---

## 🔗 Useful Links

- AWS CLI Documentation: https://docs.aws.amazon.com/cli/
- ECS Documentation: https://docs.aws.amazon.com/ecs/
- CloudWatch Logs: https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/
- AWS IAM: https://docs.aws.amazon.com/iam/

---

## 📚 Related Documentation

- **Pipeline Fixes**: See `PIPELINE_ISSUES_FIX.md`
- **Backend Setup**: See `BACKEND_SETUP.md`
- **Deployment Guide**: See `DEPLOYMENT_GUIDE.md`

---

## ✨ Script Features

✅ **Automatic**: Handles all setup steps  
✅ **Safe**: Checks if log group exists before creating  
✅ **Fast**: Monitors in real-time (10-second intervals)  
✅ **Helpful**: Shows detailed output and helpful messages  
✅ **Colorful**: Color-coded output for easy reading  
✅ **Smart**: Provides AWS console links  
✅ **Diagnostic**: Shows logs and events for troubleshooting  

---

## 🎉 Success!

Once the script completes successfully, your ECS service will be:
- ✅ Running with logs available
- ✅ Monitoring CloudWatch for errors
- ✅ Ready for automated deployments
- ✅ Accessible via the ALB or load balancer

**Happy deploying! 🚀**
