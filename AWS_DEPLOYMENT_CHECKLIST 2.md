# AWS Deployment Checklist

Use this checklist to ensure a smooth deployment to AWS.

## Pre-Deployment

- [ ] Code is committed and pushed to Git repository
- [ ] All tests pass (`npm test`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] `data/kb_embeddings.json` exists and is committed (if using RAG)
- [ ] `.env.local` is NOT committed (should be in `.gitignore`)
- [ ] Review and understand which deployment method you're using

## AWS Amplify Deployment

- [ ] Repository is connected to AWS Amplify
- [ ] Build settings are configured (use `amplify.yml` or auto-detect)
- [ ] Environment variables are set in Amplify console:
  - [ ] `OPENAI_API_KEY` (marked as secret)
  - [ ] `NODE_ENV` = `production`
- [ ] First build completes successfully
- [ ] Application URL is accessible

## AWS EC2 Deployment

- [ ] EC2 instance is launched and accessible via SSH
- [ ] Node.js 18+ is installed
- [ ] PM2 is installed and configured
- [ ] Application is cloned from repository
- [ ] `.env.local` file is created on server with `OPENAI_API_KEY`
- [ ] Application builds successfully (`npm run build`)
- [ ] Application runs with PM2 (`pm2 start`)
- [ ] Nginx is configured as reverse proxy
- [ ] Security group allows HTTP (80) and HTTPS (443)
- [ ] SSL certificate is installed (Let's Encrypt)
- [ ] PM2 startup script is configured

## AWS App Runner / Docker Deployment

- [ ] `next.config.js` is updated for standalone mode (if needed)
- [ ] `Dockerfile` is present and tested
- [ ] Docker image builds successfully
- [ ] Container registry (ECR) is configured
- [ ] Environment variables are set in App Runner
- [ ] Service is deployed and accessible

## Post-Deployment Verification

- [ ] Application loads in browser
- [ ] Watchlist displays quotes
- [ ] News panel works (select a ticker)
- [ ] Chat interface loads
- [ ] Chat sends messages successfully
- [ ] API responses return data (check Network tab)
- [ ] No console errors in browser
- [ ] Environment variables are correctly set
- [ ] HTTPS is working (for production)
- [ ] Performance is acceptable

## Security Checklist

- [ ] API keys are NOT in source code
- [ ] Environment variables are set securely
- [ ] HTTPS/SSL is enabled
- [ ] Security groups restrict unnecessary ports
- [ ] Regular backups (if using EC2)
- [ ] CloudWatch logging is enabled
- [ ] Monitoring alerts are configured (optional)

## Documentation

- [ ] Deployment method is documented
- [ ] Environment variables are documented
- [ ] Custom domain is configured (if applicable)
- [ ] Team members have access documentation

## Troubleshooting

If deployment fails:

1. **Check Build Logs**
   - AWS Amplify: Check build logs in console
   - EC2: Check PM2 logs (`pm2 logs`)
   - App Runner: Check CloudWatch logs

2. **Verify Environment Variables**
   - Ensure `OPENAI_API_KEY` is set correctly
   - Check for typos in variable names

3. **Check Application Logs**
   - AWS Amplify: CloudWatch Logs
   - EC2: `pm2 logs` or `/var/log/nginx/error.log`
   - App Runner: CloudWatch Logs

4. **Verify Build**
   - Test build locally: `npm run build`
   - Check for TypeScript errors
   - Verify all dependencies are in `package.json`

5. **Network Issues**
   - Verify security groups allow traffic
   - Check DNS configuration (for custom domains)
   - Test API endpoints directly

## Support Resources

- AWS Amplify Docs: https://docs.aws.amazon.com/amplify/
- Next.js Deployment: https://nextjs.org/docs/deployment
- AWS Support: https://aws.amazon.com/support/

