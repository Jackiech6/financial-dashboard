# AWS Deployment Quick Start

## Fastest Path: AWS Amplify (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Prepare for AWS deployment"
   git push origin main
   ```

2. **Go to AWS Amplify Console**
   - Visit: https://console.aws.amazon.com/amplify/
   - Click "New app" → "Host web app"
   - Connect your Git repository

3. **Configure Build Settings**
   - Amplify auto-detects Next.js
   - If needed, use the `amplify.yml` file in this repo

4. **Set Environment Variables**
   - `OPENAI_API_KEY`: Your OpenAI API key (sk-...)
   - `NODE_ENV`: `production`

5. **Deploy**
   - Click "Save and deploy"
   - Wait 5-10 minutes
   - Your app will be live!

## What Gets Deployed

✅ All source code  
✅ Knowledge base embeddings (`data/kb_embeddings.json`)  
✅ Build artifacts  
✅ Environment variables (set in Amplify console)

## Important Notes

- **Never commit `.env.local`** - It's already in `.gitignore`
- **Set `OPENAI_API_KEY` in Amplify console**, not in code
- The app uses Next.js API routes, which work automatically with Amplify
- Amplify handles SSL/HTTPS automatically

## Next Steps After Deployment

1. Test your deployed app
2. Add custom domain (optional) in Amplify settings
3. Monitor logs in CloudWatch
4. Set up alerts for errors (optional)

For detailed instructions, see `DEPLOY_AWS.md`.

