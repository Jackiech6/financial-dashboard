# Railway.com Deployment Guide

## Quick Start

Railway automatically detects Next.js and handles deployment, making it easier than AWS Amplify!

## Step-by-Step Instructions

### Step 1: Push Code to GitHub (if not already done)
```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### Step 2: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Sign up with **GitHub** (recommended - easier to connect repo)
4. Authorize Railway to access your GitHub repositories

### Step 3: Deploy from GitHub
1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Find and select your `financial-dashboard` repository
4. Click **"Deploy Now"**

### Step 4: Configure Environment Variables
Railway will start building. While it builds:

1. In your Railway project, click on the service
2. Go to **"Variables"** tab
3. Add these environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `OPENAI_API_KEY` | `sk-your-key-here` | Your OpenAI API key (REQUIRED) |
| `NODE_ENV` | `production` | Set to production mode |

4. Click **"Add"** for each variable
5. Railway will automatically redeploy when you add variables

### Step 5: Wait for Deployment
Railway will:
- ✅ Auto-detect Next.js
- ✅ Install dependencies (`npm install`)
- ✅ Build the app (`npm run build`)
- ✅ Start the server (`npm start`)

This usually takes 2-5 minutes.

### Step 6: Get Your URL
Once deployment succeeds:
1. Railway provides a default domain: `your-app.up.railway.app`
2. Click on the service → **"Settings"** → **"Generate Domain"** to get a permanent URL
3. Or go to **"Settings"** → **"Networking"** to add a custom domain

### Step 7: Test Your App
1. Visit the Railway-provided URL
2. Test the application:
   - ✅ Watchlist displays quotes
   - ✅ News panel works
   - ✅ Chat functionality works
   - ✅ API routes work

## Configuration Details

### Auto-Detection
Railway automatically:
- Detects Next.js framework
- Uses Node.js 18+ (latest stable)
- Runs `npm install` for dependencies
- Runs `npm run build` to build
- Runs `npm start` to start the server

### Build Settings (Auto-detected)
- **Build Command:** `npm run build`
- **Start Command:** `npm start`
- **Node Version:** Auto-detected (18+)

### Port Configuration
Next.js automatically uses `PORT` environment variable (Railway provides this automatically). No configuration needed.

## Environment Variables Reference

### Required
- `OPENAI_API_KEY` - Your OpenAI API key for chat functionality

### Optional
- `NODE_ENV=production` - Production mode (recommended)
- `USE_MOCK_CHAT=false` - Set to `true` only if you want mock responses

## Troubleshooting

### Build Fails
1. Check Railway logs: Click on your service → **"Deployments"** → Click on failed deployment → View logs
2. Common issues:
   - Missing environment variables (add `OPENAI_API_KEY`)
   - Dependency issues (should auto-resolve with `npm install`)
   - TypeScript errors (fix in code first)

### App Doesn't Load
1. Check if deployment succeeded (green status)
2. Check logs for runtime errors
3. Verify environment variables are set
4. Check if port is correct (Railway handles this automatically)

### API Routes Don't Work
- Railway handles Next.js API routes automatically
- No special configuration needed
- Check logs if specific routes fail

## Advantages of Railway

✅ **Auto-detection** - No manual framework configuration  
✅ **Simpler setup** - Just connect GitHub and deploy  
✅ **Better Next.js support** - Native App Router support  
✅ **Automatic HTTPS** - SSL certificates provided  
✅ **Easy scaling** - Can upgrade plan if needed  
✅ **Good documentation** - Clear error messages  

## Cost

Railway offers:
- **Free tier:** $5/month credit (usually enough for small apps)
- **Pay-as-you-go:** Only pay for what you use
- **Hobby plan:** $5/month + usage for always-on apps

For this project, the free tier credit is usually sufficient for testing.

## Continuous Deployment

Railway automatically redeploys when you:
- Push to your GitHub repository
- Add/modify environment variables
- Change settings

No manual deployment needed after initial setup!

## Next Steps After Deployment

1. ✅ Test all features on Railway URL
2. ✅ Monitor logs for any errors
3. ✅ Set up custom domain (optional)
4. ✅ Configure auto-scaling if needed (optional)

Your app should be live and working! 🚀

