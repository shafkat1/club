#!/usr/bin/env python3

import json
import boto3
import sys

# Initialize IAM client
iam = boto3.client('iam', region_name='us-east-1')

# Trust policy
trust_policy = {
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
}

# Deployment policy
deployment_policy = {
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

try:
    print("=" * 50)
    print("Creating GitHub OIDC Deployment Role")
    print("=" * 50)
    
    # Step 1: Create the role
    print("\nStep 1: Creating IAM role 'github-oidc-deployment-role'...")
    role_response = iam.create_role(
        RoleName='github-oidc-deployment-role',
        AssumeRolePolicyDocument=json.dumps(trust_policy),
        Description='GitHub OIDC role for automated deployments'
    )
    print(f"  Created: {role_response['Role']['Arn']}")
    
    # Step 2: Attach the policy
    print("\nStep 2: Attaching deployment policy...")
    iam.put_role_policy(
        RoleName='github-oidc-deployment-role',
        PolicyName='deployment-policy',
        PolicyDocument=json.dumps(deployment_policy)
    )
    print("  Policy attached successfully")
    
    # Step 3: Get the role ARN
    print("\nStep 3: Retrieving role details...")
    role = iam.get_role(RoleName='github-oidc-deployment-role')
    role_arn = role['Role']['Arn']
    
    # Display results
    print("\n" + "=" * 50)
    print("SUCCESS - DEPLOYMENT ROLE CREATED!")
    print("=" * 50)
    print(f"\nRole Name: github-oidc-deployment-role")
    print(f"Role ARN:  {role_arn}")
    print("\n" + "=" * 50)
    print("NEXT STEPS:")
    print("=" * 50)
    print("\n1. Go to GitHub Secrets:")
    print("   https://github.com/shafkat1/club/settings/secrets/actions")
    print("\n2. Click 'New repository secret'")
    print("\n3. Add this secret:")
    print(f"   Name:  AWS_DEPLOYMENT_ROLE_TO_ASSUME")
    print(f"   Value: {role_arn}")
    print("\n4. Click 'Add secret'")
    print("\nYour deployment pipelines will now be ready to go!")
    
except iam.exceptions.EntityAlreadyExistsException:
    print("\n⚠️  Role already exists!")
    print("Retrieving existing role...")
    role = iam.get_role(RoleName='github-oidc-deployment-role')
    role_arn = role['Role']['Arn']
    print(f"\nRole ARN: {role_arn}")
    print("\nAdd this to GitHub Secrets:")
    print("   Name:  AWS_DEPLOYMENT_ROLE_TO_ASSUME")
    print(f"   Value: {role_arn}")
    
except Exception as e:
    print(f"\n❌ Error: {str(e)}")
    sys.exit(1)
