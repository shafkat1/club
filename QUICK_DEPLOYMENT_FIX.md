# 🚀 QUICK FIX: Get All Workflows Passing

All three workflows are failing because the **AWS Deployment Role** is missing. Follow these steps to fix everything in 5 minutes.

---

## ⚡ STEP 1: Create AWS Deployment Role (2 minutes)

Run this in your terminal:

```bash
#!/bin/bash

ACCOUNT_ID="425687053209"
REGION="us-east-1"

# Create trust policy
cat > deployment-trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Federated": "arn:aws:iam::425687053209:oidc-provider/token.actions.githubusercontent.com"
    },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
        "token.actions.githubusercontent.com:sub": "repo:shafkat1/club:ref:refs/heads/main"
      }
    }
  }]
}
EOF

# Create deployment policy
cat > deployment-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ECRAccess",
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:CreateRepository",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload",
        "ecr:DescribeRepositories",
        "ecr:ListImages"
      ],
      "Resource": "*"
    },
    {
      "Sid": "ECSDeployment",
      "Effect": "Allow",
      "Action": [
        "ecs:UpdateService",
        "ecs:DescribeServices",
        "ecs:DescribeTaskDefinition",
        "ecs:DescribeTasks",
        "ecs:ListTasks",
        "ecs:RegisterTaskDefinition"
      ],
      "Resource": "*"
    },
    {
      "Sid": "S3WebDeployment",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::clubapp-dev-web-assets",
        "arn:aws:s3:::clubapp-dev-web-assets/*"
      ]
    },
    {
      "Sid": "CloudFrontInvalidation",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:ListInvalidations",
        "cloudfront:GetDistribution"
      ],
      "Resource": "*"
    },
    {
      "Sid": "IAMPassRole",
      "Effect": "Allow",
      "Action": ["iam:PassRole"],
      "Resource": [
        "arn:aws:iam::425687053209:role/ecsTaskExecutionRole",
        "arn:aws:iam::425687053209:role/ecsTaskRole"
      ]
    },
    {
      "Sid": "CloudWatchLogs",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:us-east-1:425687053209:log-group:/ecs/*"
    }
  ]
}
EOF

echo "Creating role..."
aws iam create-role \
  --role-name github-oidc-deployment-role \
  --assume-role-policy-document file://deployment-trust-policy.json \
  --region $REGION

echo "Attaching policy..."
aws iam put-role-policy \
  --role-name github-oidc-deployment-role \
  --policy-name deployment-policy \
  --policy-document file://deployment-policy.json \
  --region $REGION

echo "Getting role ARN..."
ROLE_ARN=$(aws iam get-role \
  --role-name github-oidc-deployment-role \
  --query 'Role.Arn' \
  --output text \
  --region $REGION)

echo "✅ Role created: $ROLE_ARN"
echo "Copy this value for the next step!"
```

---

## ⚡ STEP 2: Add GitHub Secret (2 minutes)

1. Go to: **https://github.com/shafkat1/club/settings/secrets/actions**
2. Click: **New repository secret**
3. Name: `AWS_DEPLOYMENT_ROLE_TO_ASSUME`
4. Value: Paste the role ARN from Step 1 (looks like `arn:aws:iam::425687053209:role/github-oidc-deployment-role`)
5. Click: **Add secret**

---

## ⚡ STEP 3: Verify Mobile/Web Secrets Exist (1 minute)

Check these secrets also exist (should already be there):

- ✅ `CLOUDFRONT_DISTRIBUTION_ID` 
- ✅ `NEXT_PUBLIC_API_URL`
- ✅ `EXPO_TOKEN` (if building mobile)
- ✅ `EAS_PROJECT_ID` (if building mobile)

---

## ⚡ STEP 4: Trigger Workflows (Optional)

Once the secret is added, re-run the workflows:

1. Go to: https://github.com/shafkat1/club/actions
2. Click each failed workflow
3. Click: **Re-run failed jobs**

Or push a new commit to trigger them automatically:

```bash
git commit --allow-empty -m "Trigger workflows with new AWS role"
git push origin main
```

---

## ✅ WHAT HAPPENS NEXT

Once you complete these steps:

✅ **Backend Deploy** - Will build Docker image and push to ECR ✓  
✅ **Web Portal Deploy** - Will build Next.js and upload to S3 ✓  
✅ **Mobile Build** - Will build APK/IPA via Expo EAS ✓  

All workflows will succeed! 🎉

---

## 🆘 TROUBLESHOOTING

### Error: "role already exists"
```bash
# Delete and recreate:
aws iam delete-role-policy --role-name github-oidc-deployment-role --policy-name deployment-policy
aws iam delete-role --role-name github-oidc-deployment-role
# Then re-run the script above
```

### Error: "OIDC provider doesn't exist"
```bash
# Create it:
aws iam create-open-id-connect-provider \
  --url "https://token.actions.githubusercontent.com" \
  --client-id-list "sts.amazonaws.com" \
  --thumbprint-list "6938fd4d98bab03faadb97b34396831e3780aea1" \
  --region us-east-1
```

### Workflows still failing after secret added?
- Wait 1-2 minutes for GitHub to sync the secret
- Re-run the failed jobs from the Actions page

---

**Time to complete: ~5 minutes**  
**Difficulty: Easy**  
**Impact: All 3 workflows will start working!** ✅
