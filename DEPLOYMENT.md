# Deployment Guide - Blink Protocol

This guide covers deploying both the **Landing Page Website** (`/web`) and **Main KYC Application** (`/app`) to Vercel.

## 🚀 Quick Deployment

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Environment Variables**: Prepare your API keys and secrets

### Option 1: Deploy via Vercel Dashboard (Recommended)

#### Deploy Landing Page Website

1. **Import Project**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your GitHub repository

2. **Configure Build Settings**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install --legacy-peer-deps`

3. **Environment Variables**:
   ```bash
   NEXT_PUBLIC_APP_NAME=Blink Protocol
   NEXT_PUBLIC_APP_DOMAIN=your-domain.vercel.app
   ```

4. **Deploy**: Click "Deploy"

#### Deploy Main KYC Application

1. **Import Project** (separate deployment):
   - Create another project in Vercel
   - Import the same GitHub repository

2. **Configure Build Settings**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `app`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install --legacy-peer-deps`

3. **Environment Variables**:
   ```bash
   # Application Configuration
   NEXT_PUBLIC_APP_NAME=Blink Protocol
   NEXT_PUBLIC_APP_URL=https://your-app-domain.vercel.app
   NEXT_PUBLIC_ENVIRONMENT=production
   
   # Privy Configuration
   NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
   PRIVY_APP_SECRET=your-privy-app-secret
   
   # Lit Protocol
   NEXT_PUBLIC_LIT_NETWORK=cayenne
   LIT_PROTOCOL_API_KEY=your-lit-api-key
   
   # Ethereum & EAS
   NEXT_PUBLIC_ETHEREUM_RPC=your-ethereum-rpc-url
   NEXT_PUBLIC_EAS_CONTRACT_ADDRESS=0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587
   EAS_PRIVATE_KEY=your-eas-attester-private-key
   
   # KYC Providers
   SMILE_IDENTITY_API_KEY=your-smile-identity-key
   SMILE_IDENTITY_PARTNER_ID=your-partner-id
   ONFIDO_API_KEY=your-onfido-api-key
   TRULIOO_API_KEY=your-trulioo-api-key
   
   # Storage
   FILECOIN_API_KEY=your-filecoin-api-key
   ARWEAVE_WALLET_KEY=your-arweave-wallet-key
   
   # Security
   JWT_SECRET=your-jwt-secret-min-32-chars
   ENCRYPTION_KEY=your-encryption-key-32-chars
   
   # Database (Optional)
   DATABASE_URL=postgresql://user:password@host:5432/blink_protocol
   
   # Analytics (Optional)
   NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
   ```

4. **Deploy**: Click "Deploy"

### Option 2: Deploy via Vercel CLI

#### Install Vercel CLI

```bash
npm install -g vercel
vercel login
```

#### Deploy Landing Page

```bash
cd web
vercel --prod
```

#### Deploy Main Application

```bash
cd app
vercel --prod
```

## 🔧 Configuration Details

### Build Optimization

Both applications are configured with:

- **Legacy Peer Deps**: Resolves dependency conflicts
- **Node.js 18+**: Required for optimal performance
- **TypeScript**: Full type checking during build
- **ESLint**: Code quality checks
- **Tailwind CSS**: Optimized CSS output

### Performance Settings

- **Function Timeout**: 30 seconds for API routes
- **Region**: `iad1` (US East) for optimal performance
- **Framework**: Next.js with automatic optimizations

### Security Considerations

1. **Environment Variables**: Never commit secrets to Git
2. **API Keys**: Use Vercel's encrypted environment variables
3. **CORS**: Configure allowed origins for production
4. **Rate Limiting**: Implement for API endpoints

## 🌍 Custom Domains

### Landing Page Domain Setup

1. **Add Domain** in Vercel Dashboard
2. **Configure DNS**:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
3. **SSL Certificate**: Automatically provisioned

### App Domain Setup

1. **Add Domain** for the app deployment
2. **Configure DNS** similarly
3. **Update Environment Variables**:
   ```bash
   NEXT_PUBLIC_APP_URL=https://app.yourdomain.com
   ```

## 🔄 Continuous Deployment

### Automatic Deployments

- **Production**: Deploys from `main` branch
- **Preview**: Deploys from feature branches
- **Environment**: Separate env vars for each environment

### Branch Configuration

```bash
# Production Branch
main → production deployment

# Development Branch  
develop → preview deployment

# Feature Branches
feature/* → preview deployment
```

## 📊 Monitoring & Analytics

### Vercel Analytics

Enable in Vercel Dashboard:
- **Web Vitals**: Performance monitoring
- **Function Logs**: API route debugging
- **Build Logs**: Deployment troubleshooting

### Custom Analytics

Add to environment variables:
```bash
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

## 🐛 Troubleshooting

### Common Build Issues

1. **Dependency Conflicts**:
   ```bash
   # Solution: Use legacy peer deps
   npm install --legacy-peer-deps
   ```

2. **TypeScript Errors**:
   ```bash
   # Check types before deployment
   npm run type-check
   ```

3. **Environment Variables**:
   ```bash
   # Ensure all required vars are set
   # Check Vercel Dashboard → Settings → Environment Variables
   ```

### Performance Issues

1. **Bundle Size**: Use `npm run build` to check bundle analysis
2. **API Timeouts**: Increase function timeout in `vercel.json`
3. **Memory Usage**: Monitor in Vercel Dashboard

## 🔐 Security Checklist

- [ ] All API keys stored in Vercel environment variables
- [ ] No secrets in Git repository
- [ ] CORS configured for production domains
- [ ] Rate limiting implemented for API routes
- [ ] SSL certificates active
- [ ] Environment variables encrypted

## 📞 Support

### Vercel Support
- **Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Community**: [github.com/vercel/vercel](https://github.com/vercel/vercel)

### Project Support
- **Issues**: Create GitHub issue
- **Documentation**: Check project README
- **Environment**: Verify all required variables are set

---

**🚀 Ready to Deploy!**

Both applications are now configured for seamless Vercel deployment with production-ready settings. 