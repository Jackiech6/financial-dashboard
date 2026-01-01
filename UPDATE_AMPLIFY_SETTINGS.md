# Update AWS Amplify Settings - URGENT FIX

## Current Settings (WRONG ❌)
- **Platform:** WEB
- **Framework:** Web

This is why you're getting 404 errors! AWS Amplify is treating your Next.js app as a static website.

## Required Settings (CORRECT ✅)
- **Platform:** WEB_COMPUTE
- **Framework:** Next.js - SSR (or Next.js)

## How to Fix (Step by Step)

### Step 1: Click the Edit Button
1. On the General settings page you're viewing
2. Click the **"Edit"** button (with pencil icon) next to the app name

### Step 2: Update Framework
1. Look for **"Framework"** dropdown
2. Change from **"Web"** to **"Next.js - SSR"** or **"Next.js"**
3. If you don't see Next.js option, try:
   - "Next.js - SSR"
   - "Next.js"
   - Or look for any Next.js framework option

### Step 3: Update Platform (if available)
1. Look for **"Platform"** dropdown
2. Change from **"WEB"** to **"WEB_COMPUTE"**
3. If you don't see this option, the framework change might be enough

### Step 4: Save Changes
1. Click **"Save"** or **"Update"** button
2. AWS Amplify will ask to redeploy - click **"Yes"** or **"Redeploy"**

### Step 5: Wait for Deployment
1. Go to **Build history** tab
2. Wait for the new build to complete (should take 2-5 minutes)
3. Once it says **"Succeeded"**, try your URL again

## Alternative: If Edit Button Doesn't Show Framework Options

If you can't change the framework through the Edit button, try:

### Option 1: Delete and Recreate App
1. Note down your app settings (environment variables, etc.)
2. Delete the current app
3. Create a new app and connect your GitHub repo
4. **Important:** When creating, select **"Next.js"** as the framework
5. Configure environment variables again
6. Deploy

### Option 2: Use AWS CLI
If you have AWS CLI installed:
```bash
aws amplify update-app \
  --app-id dlhqjp67a5ez6 \
  --platform WEB_COMPUTE \
  --region us-east-2

aws amplify update-branch \
  --app-id dlhqjp67a5ez6 \
  --branch-name main \
  --framework "Next.js - SSR" \
  --region us-east-2
```

## Why This Matters

- **WEB + Web:** Static site hosting (no server-side rendering)
  - ❌ Can't handle Next.js API routes properly
  - ❌ Can't do server-side rendering
  - ❌ 404 errors on routes

- **WEB_COMPUTE + Next.js:** Full Next.js support
  - ✅ Server-side rendering works
  - ✅ API routes work
  - ✅ Proper routing

## After Fixing

Once you update the settings and redeploy:
- ✅ Build should succeed
- ✅ Site should load at `https://main.dlhqjp67a5ez6.amplifyapp.com`
- ✅ No more 404 errors
- ✅ API routes will work

