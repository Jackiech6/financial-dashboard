# Deploying Finance Copilot to AWS

This guide covers deploying the Finance Copilot Next.js application to AWS using **AWS Amplify**, which is the recommended approach for Next.js applications.

## Prerequisites

- AWS Account
- AWS CLI installed and configured (optional but recommended)
- Git repository (GitHub, GitLab, or Bitbucket)
- OpenAI API key

## Option 1: AWS Amplify (Recommended)

AWS Amplify provides the easiest deployment path for Next.js applications with automatic builds, CI/CD, and hosting.

### Step 1: Prepare Your Repository

1. Push your code to GitHub, GitLab, or Bitbucket
2. Ensure all files are committed, including:
   - `data/kb_embeddings.json` (should be committed)
   - All source code
   - `package.json`
   - `next.config.js`

### Step 2: Create Amplify App

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click **"New app"** → **"Host web app"**
3. Choose your Git provider (GitHub, GitLab, Bitbucket, or AWS CodeCommit)
4. Authorize AWS Amplify to access your repository
5. Select your repository and branch (usually `main` or `master`)
6. Click **"Next"**

### Step 3: Configure Build Settings

AWS Amplify should auto-detect Next.js. Verify the build settings:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
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

If auto-detection fails, create `amplify.yml` in your project root:

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

### Step 4: Configure Environment Variables

In the Amplify console, go to **App settings** → **Environment variables** and add:

- `OPENAI_API_KEY`: Your OpenAI API key (sk-...)
- `NODE_ENV`: `production`
- (Optional) `USE_MOCK_CHAT`: Leave unset or `false` for production

⚠️ **Important**: Mark `OPENAI_API_KEY` as a **secret** (it should be encrypted by default in Amplify).

### Step 5: Deploy

1. Review the configuration
2. Click **"Save and deploy"**
3. Wait for the build to complete (5-10 minutes for first build)
4. Your app will be available at: `https://[app-id].amplifyapp.com`

### Step 6: Custom Domain (Optional)

1. Go to **App settings** → **Domain management**
2. Click **"Add domain"**
3. Follow the instructions to configure your domain

## Option 2: AWS EC2 (For More Control)

If you need more control or want to run on a virtual server:

### Step 1: Launch EC2 Instance

1. Go to [EC2 Console](https://console.aws.amazon.com/ec2/)
2. Launch Instance:
   - **AMI**: Amazon Linux 2023 or Ubuntu 22.04 LTS
   - **Instance Type**: t3.small or larger (2GB RAM minimum)
   - **Key Pair**: Create or select an existing key pair
   - **Security Group**: Allow HTTP (80) and HTTPS (443) traffic
3. Launch the instance

### Step 2: Connect and Setup

SSH into your instance:

```bash
ssh -i your-key.pem ec2-user@your-instance-ip
```

### Step 3: Install Dependencies

```bash
# Update system
sudo yum update -y  # Amazon Linux
# or
sudo apt update && sudo apt upgrade -y  # Ubuntu

# Install Node.js 18+
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -  # Amazon Linux
sudo yum install -y nodejs

# or for Ubuntu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Git
sudo yum install -y git  # Amazon Linux
# or
sudo apt install -y git  # Ubuntu
```

### Step 4: Clone and Build

```bash
# Clone your repository
git clone your-repo-url
cd "Financial Dashboard"

# Install dependencies
npm install

# Build the application
npm run build

# Create .env.local
nano .env.local
```

Add to `.env.local`:
```
OPENAI_API_KEY=your-api-key-here
NODE_ENV=production
```

### Step 5: Run with PM2

```bash
# Start the application
pm2 start npm --name "finance-copilot" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions shown
```

### Step 6: Configure Nginx (Reverse Proxy)

```bash
# Install Nginx
sudo yum install -y nginx  # Amazon Linux
# or
sudo apt install -y nginx  # Ubuntu

# Create Nginx configuration
sudo nano /etc/nginx/conf.d/finance-copilot.conf
```

Add:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Test Nginx configuration
sudo nginx -t

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 7: Setup SSL with Let's Encrypt (Optional but Recommended)

```bash
# Install Certbot
sudo yum install -y certbot python3-certbot-nginx  # Amazon Linux
# or
sudo apt install -y certbot python3-certbot-nginx  # Ubuntu

# Obtain certificate
sudo certbot --nginx -d your-domain.com
```

## Option 3: AWS App Runner (Container-Based)

For containerized deployments:

### Step 1: Create Dockerfile

Create `Dockerfile` in project root:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
}

module.exports = nextConfig
```

### Step 2: Create App Runner Service

1. Go to [AWS App Runner Console](https://console.aws.amazon.com/apprunner/)
2. Create service:
   - **Source**: Container registry (ECR) or Source code repository
   - Configure build and runtime settings
   - Set environment variables (OPENAI_API_KEY)
3. Deploy

## Environment Variables for AWS

Regardless of deployment method, set these environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | Your OpenAI API key |
| `NODE_ENV` | Yes | Set to `production` |
| `USE_MOCK_CHAT` | No | Set to `false` or leave unset |

## Post-Deployment Checklist

- [ ] Verify the app loads correctly
- [ ] Test chat functionality with a question
- [ ] Verify API routes work (`/api/quotes`, `/api/news`, `/api/chat`)
- [ ] Check that environment variables are set correctly
- [ ] Verify HTTPS is enabled (for production)
- [ ] Test on mobile devices
- [ ] Monitor application logs for errors
- [ ] Set up CloudWatch alarms (optional)

## Troubleshooting

### Build Fails

- Check build logs in Amplify console or CloudWatch
- Verify Node.js version (18+ required)
- Ensure all dependencies are in `package.json`

### API Routes Not Working

- Verify environment variables are set
- Check that API routes are accessible (not blocked by security groups)
- Review CloudWatch logs for errors

### Memory Issues

- Increase instance size or memory allocation
- Optimize bundle size (check `npm run build` output)

### Slow Performance

- Enable caching in CloudFront (if using)
- Check database/API response times
- Consider using AWS ElastiCache for caching

## Cost Estimation

**AWS Amplify**:
- Free tier: 15 build minutes/month, 5GB storage, 15GB served/month
- After free tier: ~$0.01 per build minute, $0.023 per GB stored, $0.15 per GB served

**EC2**:
- t3.small: ~$15/month
- t3.medium: ~$30/month

**App Runner**:
- $0.007 per vCPU hour, $0.0008 per GB hour
- Example: ~$20-40/month for small apps

## Security Best Practices

1. **Never commit API keys** - Use environment variables only
2. **Enable HTTPS** - Use SSL/TLS certificates
3. **Set up WAF** - Web Application Firewall for protection
4. **Regular updates** - Keep dependencies updated
5. **Monitor logs** - Use CloudWatch for monitoring
6. **IAM roles** - Use IAM roles instead of access keys when possible

## Support

For issues specific to AWS deployment, check:
- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- AWS Support (if you have a support plan)

