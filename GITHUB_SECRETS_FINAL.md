# GitHub Secrets - Ready to Add ✅

**All values are confirmed and ready to use.**

## Quick Setup (2 minutes)

Visit: https://github.com/shafkat1/club/settings/secrets/actions

Click "New repository secret" three times and add these:

### Secret 1: AWS OIDC Role

```
Name:  AWS_DEPLOYMENT_ROLE_TO_ASSUME
Value: arn:aws:iam::425687053209:role/github-oidc-deployment-role
```

### Secret 2: CloudFront Distribution ID

```
Name:  CLOUDFRONT_DISTRIBUTION_ID
Value: E32TNLEZPNE766
```

### Secret 3: Backend API URL

```
Name:  NEXT_PUBLIC_API_URL
Value: https://clubapp-dev-alb-505439685.us-east-1.elb.amazonaws.com/api
```

## Verification Checklist

After adding secrets:

- [ ] Go to Settings → Secrets and variables → Actions
- [ ] Verify all 3 secrets are listed
- [ ] **Do NOT** see the actual secret values (GitHub hides them with dots)
- [ ] See green checkmarks next to each secret name

## Next Steps

1. **After secrets are added**, trigger new deployments:
   - Go to: https://github.com/shafkat1/club/actions/workflows/web-deploy.yml
   - Click: **"Run workflow" → Run workflow**
   
2. **Monitor the deployment**:
   - Web Portal should build in ~2 minutes
   - Files will upload to S3
   - CloudFront cache will be invalidated
   
3. **Test the deployment**:
   - Visit: https://d1r3q3asi8jhsv.cloudfront.net
   - You should see the Desh web portal

## Infrastructure Details

| Component | Value |
|---|---|
| AWS Region | us-east-1 |
| AWS Account ID | 425687053209 |
| S3 Bucket | clubapp-dev-assets |
| CloudFront Distribution | E32TNLEZPNE766 |
| CloudFront Domain | d1r3q3asi8jhsv.cloudfront.net |
| ALB DNS | clubapp-dev-alb-505439685.us-east-1.elb.amazonaws.com |
| RDS Database | clubapp-dev-postgres.c1jtbcb1z2w1.us-east-1.rds.amazonaws.com |
| Redis Cache | master.clubapp-dev-redis.glclad.use1.cache.amazonaws.com |

## Troubleshooting

### Secret not working?
- Clear browser cache (Ctrl+Shift+Delete)
- Wait 1 minute after adding secrets
- GitHub Actions uses secrets immediately, but there might be cache delay

### Still getting "Configure AWS credentials failed"?
- Check secret name is EXACTLY: `AWS_DEPLOYMENT_ROLE_TO_ASSUME`
- Check value doesn't have extra spaces at start/end
- Verify IAM role exists: `aws iam get-role --role-name github-oidc-deployment-role`

### S3 upload fails?
- Check `CLOUDFRONT_DISTRIBUTION_ID` is: `E32TNLEZPNE766` (no quotes)
- Verify bucket exists: `aws s3 ls s3://clubapp-dev-assets`

---

**You're ready to go! Add these 3 secrets and your deployment pipeline will be live.** 🚀
