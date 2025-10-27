#!/bin/bash

# Update GitHub OIDC Role Trust Policy
# This allows GitHub Actions to assume the role

ROLE_NAME="github-actions-role"
AWS_ACCOUNT_ID="425687053209"
REGION="us-east-1"

echo "🔧 Updating GitHub OIDC role trust policy..."

# Update the trust policy
aws iam update-assume-role-policy-document \
  --role-name $ROLE_NAME \
  --policy-document file://trust-policy-github-oidc.json \
  --region $REGION

echo "✅ Trust policy updated successfully!"

# Verify the role
echo ""
echo "📋 Verifying role..."
aws iam get-role \
  --role-name $ROLE_NAME \
  --region $REGION

echo ""
echo "✅ Role verified!"
echo ""
echo "Next steps:"
echo "1. Go back to GitHub Actions"
echo "2. Re-run the failing workflow"
echo "3. It should now succeed!"
