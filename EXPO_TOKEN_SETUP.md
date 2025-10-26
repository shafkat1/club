# Expo Token Setup Guide

## What is EXPO_TOKEN?

`EXPO_TOKEN` is a personal access token that allows Expo EAS (Expo Application Services) to authenticate build requests from GitHub Actions CI/CD.

## Steps to Get Your EXPO_TOKEN

### 1. Create an Expo Account (if you don't have one)
- Go to https://expo.dev/signup
- Sign up with email or social login
- Verify your email

### 2. Generate a Personal Access Token
- Visit: https://expo.dev/settings/access-tokens
- Click "Create token"
- Give it a name like "GitHub Actions"
- Select scope: **build** (for building with EAS)
- Click "Generate token"
- **Copy the token immediately** - you won't be able to see it again!

### 3. Add EXPO_TOKEN to GitHub Secrets

1. Go to: https://github.com/shafkat1/club/settings/secrets/actions
2. Click "New repository secret"
3. Name: `EXPO_TOKEN`
4. Value: Paste the token you just copied
5. Click "Add secret"

## Verify Setup

Once added, the mobile build will:
1. ✅ Authenticate with Expo
2. ✅ Build for Android via EAS
3. ✅ Build for iOS via EAS
4. ✅ Store builds in Expo dashboard

## Troubleshooting

**Error: "An Expo user account is required"**
- Token not set or expired
- Solution: Regenerate token and update GitHub secret

**Error: "401 Unauthorized"**
- Token is invalid or expired
- Solution: Create a new token

## Important Notes

- Keep your token secret - never commit it to git
- The token has expiration (check Expo settings)
- You can revoke tokens anytime from https://expo.dev/settings/access-tokens
- Each token can be used by multiple CI/CD systems

## More Info

- Expo EAS Docs: https://docs.expo.dev/eas/introduction/
- GitHub Actions Integration: https://docs.expo.dev/eas/github-actions/
