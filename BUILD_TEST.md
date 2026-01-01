# Build Test & Verification

## To manually test the build process (what AWS Amplify does):

```bash
# 1. Clean install (like AWS Amplify)
rm -rf node_modules package-lock.json
npm install

# 2. Build (what Amplify does)
npm run build

# 3. If build succeeds, check output
ls -la .next/
```

## Expected AWS Amplify Build Process:

1. **preBuild phase:**
   - `npm ci` - Clean install from package-lock.json

2. **build phase:**
   - `npm run build` - Builds Next.js application

3. **Artifacts:**
   - Takes everything from `.next/` directory
   - Deploys to CloudFront

## Common Issues:

1. **TypeScript errors** - Check `tsconfig.json` configuration
2. **Missing dependencies** - Verify `package.json` has all required packages
3. **Import path errors** - Check `tsconfig.json` paths configuration
4. **Environment variables** - Must be set in Amplify Console, not in code

## Current Configuration:

- Next.js: 16.1.1
- TypeScript: 5.9.3
- Node.js: 18+ required (Amplify auto-detects)
- Build command: `npm run build`
- Output: `.next/` directory

