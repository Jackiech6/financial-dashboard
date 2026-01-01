# Railway Runtime Error Fix

## "Application failed to respond" Error

If your app builds successfully but shows "Application failed to respond" at runtime, check these:

### 1. Environment Variables (MOST COMMON ISSUE)

**Check in Railway Dashboard:**
1. Go to your service
2. Click **"Variables"** tab
3. **Required variable:**
   - `OPENAI_API_KEY` = `sk-your-key-here` (YOUR API KEY)

**If missing:**
1. Click **"+ New Variable"**
2. Name: `OPENAI_API_KEY`
3. Value: Your OpenAI API key (starts with `sk-`)
4. Railway will automatically redeploy after adding

### 2. Check Runtime Logs

**In Railway Dashboard:**
1. Go to **"Deployments"** tab
2. Click on the **latest deployment**
3. Click **"View logs"** or expand logs
4. Look for **"Runtime"** section (not Build)
5. Check for error messages:
   - `Error:`
   - `Cannot find module`
   - `Missing environment variable`
   - Stack traces

### 3. Common Runtime Errors

#### Missing Environment Variable
**Error:** `OpenAI API key not configured`
**Fix:** Add `OPENAI_API_KEY` to Railway Variables

#### Module Not Found
**Error:** `Cannot find module 'X'`
**Fix:** Check if all dependencies are in package.json

#### Port Issues
**Error:** Server not starting
**Fix:** Next.js handles PORT automatically - should work

### 4. Current Configuration (Should Work)

✅ `next.config.ts` - Standard Next.js config
✅ `nixpacks.toml` - Uses Node.js 20, npm start
✅ `package.json` - Correct scripts and dependencies

### Quick Checklist

- [ ] OPENAI_API_KEY is set in Railway Variables
- [ ] Deployment shows "Succeeded" (green)
- [ ] Runtime logs show server starting
- [ ] No error messages in runtime logs

### If Still Not Working

1. **Check Runtime Logs** - Most important!
2. **Share the error message** from runtime logs
3. **Verify environment variables** are set correctly
4. **Try redeploying** after adding variables

The code and configuration are correct - it's likely just missing environment variables!
