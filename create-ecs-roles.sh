#!/bin/bash

# Create ECS Task Execution Role and Task Role for ECS Fargate

ACCOUNT_ID="425687053209"
REGION="us-east-1"

echo "🔧 Creating ECS IAM Roles..."

# 1. Create ecsTaskExecutionRole
echo ""
echo "📋 Creating ecsTaskExecutionRole..."

aws iam create-role \
  --role-name ecsTaskExecutionRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Service": "ecs-tasks.amazonaws.com"
        },
        "Action": "sts:AssumeRole"
      }
    ]
  }' \
  --region $REGION 2>/dev/null

echo "✅ ecsTaskExecutionRole created (or already exists)"

# Attach policy to execution role
echo ""
echo "📋 Attaching AmazonECSTaskExecutionRolePolicy..."

aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy \
  --region $REGION

echo "✅ Policy attached"

# 2. Create ecsTaskRole (for application permissions)
echo ""
echo "📋 Creating ecsTaskRole..."

aws iam create-role \
  --role-name ecsTaskRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Service": "ecs-tasks.amazonaws.com"
        },
        "Action": "sts:AssumeRole"
      }
    ]
  }' \
  --region $REGION 2>/dev/null

echo "✅ ecsTaskRole created (or already exists)"

# Attach CloudWatch Logs policy to task role
echo ""
echo "📋 Attaching CloudWatch Logs policy to ecsTaskRole..."

aws iam put-role-policy \
  --role-name ecsTaskRole \
  --policy-name CloudWatchLogsPolicy \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        "Resource": "arn:aws:logs:us-east-1:425687053209:log-group:/ecs/clubapp-backend:*"
      }
    ]
  }' \
  --region $REGION

echo "✅ CloudWatch Logs policy attached"

echo ""
echo "🎊 ECS IAM Roles setup complete!"
echo ""
echo "Created roles:"
echo "  ✅ ecsTaskExecutionRole"
echo "  ✅ ecsTaskRole"
