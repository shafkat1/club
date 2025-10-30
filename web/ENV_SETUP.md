# Frontend Environment Setup

## Overview

This document explains the environment variables needed for the Club App web frontend.

## Environment Variables

Create a `.env.local` file in the `/web` directory with the following variables:

### Required Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# For production:
# NEXT_PUBLIC_API_URL=https://api.desh.co/api
```

### Optional Variables

```bash
# Token Settings
NEXT_PUBLIC_TOKEN_EXPIRY=86400  # 24 hours in seconds
NEXT_PUBLIC_REFRESH_TOKEN_KEY=refreshToken

# OAuth Configuration (if implementing OAuth)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id_here

# Application Settings
NEXT_PUBLIC_APP_NAME=Club App
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## Development Setup

1. **Create `.env.local`:**
   ```bash
   cp .env.example .env.local
   ```

2. **Update variables:**
   - Set `NEXT_PUBLIC_API_URL` to your local backend (usually `http://localhost:3000/api`)
   - Add any optional OAuth credentials if needed

3. **Verify backend is running:**
   ```bash
   # Backend should be running on http://localhost:3000
   # Check with:
   curl http://localhost:3000/api/health
   ```

4. **Start frontend:**
   ```bash
   npm run dev
   ```

## Production Setup

1. **Build frontend:**
   ```bash
   npm run build
   ```

2. **Set environment variables in deployment platform:**
   - `NEXT_PUBLIC_API_URL=https://api.desh.co/api`
   - Any OAuth credentials

3. **Deploy to AWS ECS:**
   - Push Docker image to ECR
   - Update ECS task definition
   - Deploy to ECS service

## Verifying Configuration

### Check API Connectivity

```bash
# In browser console
import { apiClient } from '@/utils/api-client'

// This should work if API is accessible
const response = await apiClient.get('/health')
console.log(response.data)
```

### Check Auth Flow

```bash
# In browser console
import { apiClient } from '@/utils/api-client'
import { useAuthStore } from '@/store/authStore'

// Test login
const store = useAuthStore.getState()
await store.login('test@example.com', 'password123')
console.log(store.user)
```

## Troubleshooting

### API_URL Not Found

**Error:** `Cannot find module or undefined API_URL`

**Solution:**
- Restart development server after changing `.env.local`
- Verify variable starts with `NEXT_PUBLIC_` (required for client-side access)

### CORS Errors

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
- Ensure backend has CORS enabled
- Check `NEXT_PUBLIC_API_URL` points to correct backend
- Verify backend is running

### Authentication Failing

**Error:** `401 Unauthorized` on every request

**Solution:**
- Verify NestJS auth endpoints are working
- Check refresh token is being stored
- Ensure `withCredentials: true` in axios config

## Security Notes

- **Never commit `.env.local`** - Add to `.gitignore`
- **Never expose secrets** in `NEXT_PUBLIC_*` variables
- Use httpOnly cookies for sensitive tokens (handled by backend)
- Always use HTTPS in production

## References

- [AUTHENTICATION_INTEGRATION_GUIDE.md](../AUTHENTICATION_INTEGRATION_GUIDE.md)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
