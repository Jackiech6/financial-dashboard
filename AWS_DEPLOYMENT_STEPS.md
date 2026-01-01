# AWS Amplify Deployment Steps

Follow these steps to deploy your Financial Dashboard to AWS Amplify.

## Prerequisites ✅

- ✅ AWS Account (create one at https://aws.amazon.com if needed)
- ✅ Code pushed to GitHub: `git@github.com:Jackiech6/financial-dashboard.git`
- ✅ OpenAI API Key: `sk-proj-FXRNVfqf_DK9...` (already configured)

## Step-by-Step Deployment

### Step 1: Push Latest Code to GitHub

Make sure your latest code is pushed:

```bash
cd "/Users/chenjackie/Desktop/Financial Dashboard"
git add .
git commit -m "Prepare for AWS Amplify deployment"
git push origin main
```

### Step 2: Create AWS Amplify App

1. **Go to AWS Amplify Console:**
   - Visit: https://console.aws.amazon.com/amplify/
   - Sign in with your AWS account

2. **Click "New app" → "Host web app"**

3. **Connect Repository:**
   - Choose "GitHub" (or your git provider)
   - Authorize AWS Amplify to access your repositories
   - Select repository: `Jackiech6/financial-dashboard`
   - Select branch: `main`
   - Click "Next"

### Step 3: Configure Build Settings

AWS Amplify should auto-detect Next.js. The `amplify.yml` file in your repo contains the correct configuration:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
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

**Verify these settings:**
- Build command: `npm run build`
- Node version: 18.x or 20.x (auto-detected)
- Framework: Next.js (auto-detected)

Click "Next" to continue.

### Step 4: Configure Environment Variables ⚠️ IMPORTANT

This is **critical** - your app won't work without these!

1. **Click "Advanced settings"** (or look for "Environment variables" section)

2. **Add Environment Variables:**
   
   | Variable Name | Value | Notes |
   |--------------|-------|-------|
   | `OPENAI_API_KEY` | `sk-proj-... (your API key from .env.local)` | Your OpenAI API key (mark as secret) |
   | `NODE_ENV` | `production` | Production environment flag |

3. **Mark `OPENAI_API_KEY` as Secret** (should be default - it will be encrypted)

4. **Apply to all environments:** Production, Preview, Development

### Step 5: Review and Deploy

1. **Review your settings:**
   - Repository: ✅ `Jackiech6/financial-dashboard`
   - Branch: ✅ `main`
   - Build settings: ✅ Auto-detected Next.js
   - Environment variables: ✅ `OPENAI_API_KEY` and `NODE_ENV` set

2. **Click "Save and deploy"**

3. **Wait for deployment:**
   - First build takes 5-10 minutes
   - You can watch the build progress in real-time
   - Build logs will show if there are any issues

### Step 6: Verify Deployment

Once deployment completes:

1. **Your app URL will be:** `https://[random-id].amplifyapp.com`
   - This URL is shown in the Amplify console
   - Example: `https://main.d1234567890.amplifyapp.com`

2. **Test the application:**
   - ✅ Open the URL in your browser
   - ✅ Verify the page loads
   - ✅ Test the watchlist (should show stock quotes)
   - ✅ Click a ticker (should update news panel)
   - ✅ Test the chat (send a message like "What is P/E ratio?")
   - ✅ Verify you get AI responses

3. **Check logs if issues:**
   - Go to "Monitoring" → "Logs" in Amplify console
   - Look for any errors

## Troubleshooting

### Build Fails

**Error: "The id argument must be of type string. Received undefined"**
- This is a known Next.js/Turbopack bug locally
- AWS Amplify uses a different build environment
- **Solution:** If this occurs, it might be a dependency issue
  - Check build logs for specific error
  - Try updating `amplify.yml` to use `npm install` instead of `npm ci`

**Error: "Module not found"**
- Check that all dependencies are in `package.json`
- Verify `node_modules` is not committed (it shouldn't be)

**Error: "TypeScript errors"**
- Check build logs for specific TypeScript errors
- Fix any TypeScript issues in your code

### App Deploys But Chat Doesn't Work

**Error: "API key not configured"**
- ✅ Verify `OPENAI_API_KEY` is set in Amplify environment variables
- ✅ Make sure it's set for the correct environment (Production)
- ✅ Check that the value is correct (no extra spaces)
- ✅ Redeploy after adding/changing environment variables

**Error: "Network error" or "Connection error"**
- This is a runtime issue, not deployment
- Check CloudWatch logs for details
- Verify your OpenAI API key is valid and has credits

### App Works But Performance is Slow

- Check CloudWatch metrics
- Consider enabling caching
- Review bundle size in build logs

## Next Steps After Successful Deployment

1. **Set Custom Domain (Optional):**
   - Go to "App settings" → "Domain management"
   - Click "Add domain"
   - Follow instructions to configure DNS

2. **Set Up Custom Branch Deployments (Optional):**
   - Amplify automatically creates preview deployments for pull requests
   - Useful for testing before merging to main

3. **Monitor Usage:**
   - Check CloudWatch logs regularly
   - Monitor API usage in OpenAI dashboard
   - Set up billing alerts if needed

4. **Enable HTTPS:**
   - Amplify automatically provides HTTPS
   - No additional configuration needed

## Cost Estimation

**AWS Amplify Free Tier:**
- 15 build minutes/month
- 5GB storage
- 15GB served/month

**After Free Tier:**
- ~$0.01 per build minute
- $0.023 per GB stored
- $0.15 per GB served

For a small application like this, you'll likely stay within the free tier.

## Security Reminders

- ✅ Never commit `.env.local` (already in `.gitignore`)
- ✅ API keys are encrypted in Amplify
- ✅ Use environment variables, not hardcoded keys
- ✅ HTTPS is automatically enabled
- ✅ Regularly rotate API keys if needed

## Support

If you encounter issues:
1. Check the build logs in Amplify console
2. Check CloudWatch logs for runtime errors
3. Verify environment variables are set correctly
4. Review AWS Amplify documentation: https://docs.aws.amazon.com/amplify/

---

**Ready to deploy?** Follow the steps above, and your Financial Dashboard will be live on AWS in about 10 minutes! 🚀

