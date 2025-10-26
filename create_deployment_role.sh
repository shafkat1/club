#!/bin/bash

set -e

ROLE_NAME="github-oidc-deployment-role"
POLICY_NAME="deployment-policy"
REGION="us-east-1"

echo "Creating GitHub OIDC Deployment Role..."

# Trust policy
TRUST_POLICY='{
  "Version": "2012-10-17",
  "Statement": [
    {
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
    }
  ]
}'

# Create role
echo "$TRUST_POLICY" | aws iam create-role \
  --role-name "$ROLE_NAME" \
  --assume-role-policy-document file:///dev/stdin \
  --region "$REGION"

echo "✓ Role created successfully"

# Deployment policy
DEPLOYMENT_POLICY='{
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
}'

# Attach policy
echo "$DEPLOYMENT_POLICY" | aws iam put-role-policy \
  --role-name "$ROLE_NAME" \
  --policy-name "$POLICY_NAME" \
  --policy-document file:///dev/stdin \
  --region "$REGION"

echo "✓ Policy attached successfully"

# Get and display role ARN
ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME" --query 'Role.Arn' --output text --region "$REGION")

echo ""
echo "========================================="
echo "DEPLOYMENT ROLE CREATED SUCCESSFULLY!"
echo "========================================="
echo ""
echo "Role Name: $ROLE_NAME"
echo "Role ARN:  $ROLE_ARN"
echo ""
echo "Next Steps:"
echo "1. Add this ARN to GitHub Secrets"
echo "   Name: AWS_DEPLOYMENT_ROLE_TO_ASSUME"
echo "   Value: $ROLE_ARN"
echo ""
