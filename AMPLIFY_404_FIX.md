# Fix AWS Amplify 404 Error for Next.js

## Issue
Getting 404 error when accessing: `https://main.dlhqjp67a5ez6.amplifyapp.com`

## Root Cause
AWS Amplify might not be recognizing this as a Next.js app, or the platform/framework settings need to be configured.

## Solution Steps

### Step 1: Verify Build Status
1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click on your app
3. Go to **Build history**
4. Check the latest build:
   - ✅ If it shows **"Succeeded"** (green), continue to Step 2
   - ❌ If it shows **"Failed"**, fix the build errors first

### Step 2: Configure Framework & Platform (IMPORTANT!)

AWS Amplify needs to recognize this as a Next.js app. Do this:

#### Option A: Using AWS Console (Recommended)
1. In AWS Amplify Console, go to your app
2. Click **App settings** → **General**
3. Look for **"Platform"** or **"Framework"** settings
4. Set:
   - **Platform**: `WEB_COMPUTE` (or `WEB`)
   - **Framework**: `Next.js - SSR` (or `Next.js`)
5. Click **Save**

#### Option B: Using AWS CLI
If you have AWS CLI installed, run:
```bash
aws amplify update-app \
  --app-id dlhqjp67a5ez6 \
  --platform WEB_COMPUTE \
  --region us-east-1  # Change to your region

aws amplify update-branch \
  --app-id dlhqjp67a5ez6 \
  --branch-name main \
  --framework "Next.js - SSR" \
  --region us-east-1  # Change to your region
```

### Step 3: Trigger a New Deployment
After changing settings:
1. Go to **App settings** → **Build settings**
2. Click **"Redeploy this version"** OR
3. Make a small commit and push to trigger a new build

### Step 4: Verify Deployment
1. Wait for the new build to complete
2. Check the deployment logs for any errors
3. Visit your URL again

## Current Configuration Files

Your `amplify.yml` is correct:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - nvm use 20
        - node --version
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

## Why This Happens

AWS Amplify needs explicit framework detection for Next.js apps with SSR (Server-Side Rendering). If it's not set, Amplify treats it as a static site, causing routing issues and 404 errors.

## Additional Checks

If still not working after Step 2:
1. Check **Environment variables** are set:
   - `OPENAI_API_KEY` (your API key)
   - `NODE_ENV=production`
2. Check **Rewrites and redirects** (should auto-configure for Next.js)
3. Check **Custom headers** (should not interfere)

## Expected Result

After configuring:
- ✅ Build succeeds
- ✅ Deployment succeeds  
- ✅ Site loads at `https://main.dlhqjp67a5ez6.amplifyapp.com`
- ✅ No 404 errors

