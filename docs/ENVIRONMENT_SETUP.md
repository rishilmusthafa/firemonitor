# Environment Setup Guide

This guide explains how to set up environment variables for the Fire Monitor application.

## Required Environment Variables

### Cesium Access Token

The application requires a Cesium access token for 3D globe functionality.

#### Option 1: Get a Free Token (Recommended)

1. Visit [https://cesium.com/ion/signup/](https://cesium.com/ion/signup/)
2. Sign up for a free account
3. After signing up, go to your account settings
4. Copy your access token

#### Option 2: Use Default Token (Limited Functionality)

The application includes a default token for development, but it has limited functionality.

## Setup Instructions

### 1. Create Environment File

Create a file called `.env.local` in your project root (same level as `package.json`):

```bash
# Cesium Access Token
NEXT_PUBLIC_CESIUM_ACCESS_TOKEN="your_actual_token_here"
```

### 2. File Structure

Your project should look like this:

```
firemonitor/
├── .env.local          # Environment variables (create this)
├── package.json
├── next.config.ts
├── src/
└── public/
```

### 3. Restart Development Server

After creating the `.env.local` file, restart your development server:

```bash
npm run dev
```

## Environment File Template

```bash
# Cesium Access Token - Get your free token from https://cesium.com/ion/signup/
NEXT_PUBLIC_CESIUM_ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Add other environment variables here as needed
# NEXT_PUBLIC_API_URL="https://api.example.com"
# NEXT_PUBLIC_APP_VERSION="1.0.0"
```

## Troubleshooting

### 401 Unauthorized Error

If you see a 401 error when loading the map:

1. Check that `.env.local` exists in the project root
2. Verify the token is correct and not expired
3. Ensure the token starts with `eyJ` (JWT format)
4. Restart the development server

### Token Not Loading

1. Make sure the file is named exactly `.env.local`
2. Check that there are no spaces around the `=` sign
3. Ensure the token is wrapped in quotes
4. Verify the environment variable name is correct

### Development vs Production

- **Development**: Use `.env.local` (not committed to git)
- **Production**: Set environment variables in your hosting platform

## Security Notes

- Never commit `.env.local` to version control
- The `.env.local` file is already in `.gitignore`
- Use different tokens for development and production
- Keep your tokens secure and don't share them publicly

## Next Steps

After setting up the environment variables:

1. The 3D globe should load without errors
2. You should see the UAE centered on the map
3. The theme toggle should work properly
4. You're ready for Phase 2 development 