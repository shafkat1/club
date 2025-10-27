# ⚡ Deployment Fix Scripts - Quick Summary

## 🎯 What's Happening

Your ECS tasks are failing to start because the CloudWatch log group `/ecs/clubapp-backend` doesn't exist.

**Error**:
```
ResourceNotFoundException: The specified log group does not exist.
```

## ✅ Solution

We've created two automated scripts to fix this:

### 1️⃣ **For Windows** (PowerShell)
```powershell
.\fix-cloudwatch-and-deploy.ps1
```

### 2️⃣ **For Mac/Linux** (Bash)
```bash
chmod +x fix-cloudwatch-and-deploy.sh
./fix-cloudwatch-and-deploy.sh
```

## 📋 What the Scripts Do

✅ Create CloudWatch log group  
✅ Set 7-day retention policy  
✅ Wait for ECS to retry tasks (monitors in real-time)  
✅ Show service status and health  
✅ Display recent logs and events  
✅ Provide AWS console links  

**Time required**: ~2-3 minutes

## 🚀 Quick Start

### Windows (PowerShell)
```powershell
# 1. Open PowerShell
# 2. Navigate to project directory
cd C:\ai4\club

# 3. Run the script
.\fix-cloudwatch-and-deploy.ps1
```

### Mac/Linux/Git Bash
```bash
# 1. Open terminal
# 2. Navigate to project directory
cd ~/path/to/club

# 3. Make executable (first time only)
chmod +x fix-cloudwatch-and-deploy.sh

# 4. Run the script
./fix-cloudwatch-and-deploy.sh
```

## ⚙️ Prerequisites

- ✅ AWS CLI installed
- ✅ AWS credentials configured
- ✅ For Bash: `jq` installed (`brew install jq` or `apt-get install jq`)

## 📊 Expected Result

When complete, you'll see:

```
✅ CloudWatch log group created: /ecs/clubapp-backend
✅ Retention policy set: 7 days

📊 Current Service Status:
   Running: 1/1 tasks
   Cluster: clubapp-dev-ecs
   Service: clubapp-dev-svc

✅ Deployment successful!

🔗 View Service:
   https://console.aws.amazon.com/ecs/v2/clusters/...
📋 View Logs:
   aws logs tail /ecs/clubapp-backend --follow
```

## ❌ Troubleshooting

| Issue | Solution |
|-------|----------|
| AWS CLI not found | Install from https://aws.amazon.com/cli/ |
| Credentials invalid | Run `aws configure` |
| jq not found (bash) | Install: `brew install jq` (Mac) or `apt-get install jq` (Linux) |
| Script times out | Log group may exist. Check: `aws logs describe-log-groups --log-group-name-prefix /ecs/clubapp-backend` |

## 📖 Full Documentation

For detailed information, troubleshooting, and manual commands, see:
👉 **`CLOUDWATCH_FIX_README.md`**

## 🎉 Next Steps

After the script completes:

1. **Verify deployment**:
   ```bash
   aws ecs describe-services \
     --cluster clubapp-dev-ecs \
     --services clubapp-dev-svc \
     --region us-east-1 \
     --query 'services[0].[runningCount,desiredCount]'
   ```

2. **Monitor logs**:
   ```bash
   aws logs tail /ecs/clubapp-backend --follow
   ```

3. **Push new code** (deploys automatically):
   ```bash
   git add backend/
   git commit -m "your-feature"
   git push origin main
   ```

## 🔗 Related Files

- Pipeline Fixes: `PIPELINE_ISSUES_FIX.md`
- Pipeline Summary: `PIPELINE_FIX_COMPLETE.md`
- Comprehensive Guide: `CLOUDWATCH_FIX_README.md`

---

**Ready to fix the deployment?** Just run the script! 🚀
