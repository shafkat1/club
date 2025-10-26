import json
import boto3

iam = boto3.client('iam')

policy_document = {
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
                "arn:aws:s3:::clubapp-dev-assets",
                "arn:aws:s3:::clubapp-dev-assets/*"
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
    iam.put_role_policy(
        RoleName='github-oidc-deployment-role',
        PolicyName='github-oidc-deployment-policy',
        PolicyDocument=json.dumps(policy_document)
    )
    print("✅ Policy updated successfully!")
    print("S3 bucket ARN updated to: arn:aws:s3:::clubapp-dev-assets")
except Exception as e:
    print(f"❌ Error: {e}")
