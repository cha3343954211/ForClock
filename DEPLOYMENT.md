# For Clock Deployment Guide

This guide covers various deployment options for For Clock, from simple static hosting to production deployments.

---

## Table of Contents

1. [Quick Deployment Options](#quick-deployment-options)
2. [Static Hosting](#static-hosting)
3. [VPS Deployment](#vps-deployment)
4. [Docker Deployment](#docker-deployment)
5. [Cloud Platform Deployment](#cloud-platform-deployment)
6. [Production Checklist](#production-checklist)
7. [Performance Optimization](#performance-optimization)
8. [Security Considerations](#security-considerations)

---

## Quick Deployment Options

### Option 1: Vercel (Recommended for beginners)

**Time**: 5 minutes  
**Cost**: Free tier available

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts
# That's it!
```

**Pros:**
- Zero configuration
- Automatic HTTPS
- Global CDN
- Preview deployments

**Cons:**
- Serverless function limits on free tier

### Option 2: Netlify

**Time**: 5 minutes  
**Cost**: Free tier available

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

**Pros:**
- Simple deployment
- Form handling
- Built-in analytics
- Easy rollbacks

### Option 3: GitHub Pages

**Time**: 10 minutes  
**Cost**: Free

1. Install `gh-pages`:
```bash
npm install --save-dev gh-pages
```

2. Add to `package.json`:
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  },
  "homepage": "https://yourusername.github.io/zen-clock"
}
```

3. Update `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/zen-clock/',
  // ... rest of config
});
```

4. Deploy:
```bash
npm run deploy
```

---

## Static Hosting

### Building for Production

```bash
# Build the application
npm run build

# Output will be in the 'dist' folder
# This contains all static assets needed
```

### Hosting Options

| Provider | Free Tier | Features | Best For |
|----------|-----------|----------|----------|
| **Vercel** | ✅ Yes | CDN, SSL, Functions | Most projects |
| **Netlify** | ✅ Yes | CDN, SSL, Forms | Static sites |
| **GitHub Pages** | ✅ Yes | CDN, SSL | Open source |
| **Cloudflare Pages** | ✅ Yes | CDN, SSL, Workers | Global reach |
| **Firebase Hosting** | ✅ Yes | CDN, SSL, DB | Firebase users |

### Configuration Examples

#### Vercel (vercel.json)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "routes": [
    {
      "src": "/[^.]+",
      "dest": "/",
      "status": 200
    }
  ]
}
```

#### Netlify (netlify.toml)
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## VPS Deployment

### Prerequisites

- Ubuntu/Debian server
- Node.js installed
- Nginx installed
- Domain name (optional)

### Step-by-Step Setup

#### 1. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx
```

#### 2. Build and Upload

```bash
# Build locally
npm run build

# Upload to server using SCP
scp -r dist/* user@your-server:/var/www/zen-clock
```

#### 3. Configure Nginx

Create `/etc/nginx/sites-available/zen-clock`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/zen-clock;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

#### 4. Enable and Restart

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/zen-clock /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### 5. Setup SSL (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

---

## Docker Deployment

### Dockerfile

Create `Dockerfile` in project root:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Build and Run

```bash
# Build Docker image
docker build -t zen-clock .

# Run container
docker run -d -p 80:80 zen-clock

# Or use docker-compose
docker-compose up -d
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  zen-clock:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

---

## Cloud Platform Deployment

### AWS S3 + CloudFront

#### 1. Build
```bash
npm run build
```

#### 2. Create S3 Bucket
```bash
aws s3 mb s3://zen-clock-bucket
```

#### 3. Upload Files
```bash
aws s3 sync dist/ s3://zen-clock-bucket
```

#### 4. Configure Static Website
```bash
aws s3 website s3://zen-clock-bucket \
  --index-document index.html \
  --error-document index.html
```

#### 5. Create CloudFront Distribution
- Use S3 bucket as origin
- Configure custom domain
- Enable HTTPS

### Google Cloud Storage

```bash
# Create bucket
gsutil mb gs://zen-clock-bucket

# Upload files
gsutil -m cp -r dist/* gs://zen-clock-bucket

# Make public
gsutil iam ch allUsers:objectViewer gs://zen-clock-bucket

# Configure website
gsutil web set -m index.html -e 404.html gs://zen-clock-bucket
```

### Azure Static Web Apps

```bash
# Install Azure CLI
npm install -g @azure/static-web-apps-cli

# Build
npm run build

# Deploy
swa deploy ./dist
```

---

## Production Checklist

### Pre-Deployment

- [ ] Run full test suite
- [ ] Check all features work in production build
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices
- [ ] Verify API keys are not exposed in client code
- [ ] Enable API key restrictions in Google Cloud Console
- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Configure analytics (Google Analytics, Plausible)
- [ ] Test performance (Lighthouse score > 90)
- [ ] Check accessibility (WCAG 2.1 AA)

### Security

- [ ] Enable HTTPS
- [ ] Configure security headers
- [ ] Set up CORS properly
- [ ] Implement rate limiting for AI endpoints
- [ ] Use environment variables for secrets
- [ ] Enable Content Security Policy (CSP)
- [ ] Set up DDoS protection

### Performance

- [ ] Enable gzip/brotli compression
- [ ] Configure CDN
- [ ] Set up browser caching
- [ ] Minimize bundle size
- [ ] Lazy load components
- [ ] Optimize images
- [ ] Use service workers (optional)

### Monitoring

- [ ] Set up uptime monitoring
- [ ] Configure error alerts
- [ ] Track key metrics (page load, errors)
- [ ] Set up log aggregation
- [ ] Create dashboard

---

## Performance Optimization

### Bundle Optimization

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mediapipe: ['@mediapipe/tasks-vision'],
          ui: ['lucide-react']
        }
      }
    }
  }
});
```

### Lazy Loading

```typescript
// Lazy load heavy components
const ParticlesCanvas = lazy(() => import('./components/ParticlesCanvas'));
const AnalogClock = lazy(() => import('./components/AnalogClock'));

// Use in component
<Suspense fallback={<Loading />}>
  <ParticlesCanvas />
</Suspense>
```

### Image Optimization

```bash
# Install sharp for image optimization
npm install --save-dev sharp

# Use in build process
```

### Caching Strategy

```javascript
// Service Worker for caching
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

---

## Security Considerations

### API Key Protection

**Never expose API keys in client-side code!**

#### Recommended Approach: Backend Proxy

```typescript
// Backend endpoint (Node.js/Express example)
app.post('/api/generate-reflection', async (req, res) => {
  const { timeString, theme } = req.body;
  
  // Rate limiting
  if (rateLimiter.isLimited(req.ip)) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  
  // Call AI service from server
  const result = await generateReflection(timeString, theme);
  res.json({ result });
});
```

#### Environment Variables

```bash
# .env.production (never commit this!)
GEMINI_API_KEY=your_secret_key
RATE_LIMIT_MAX_REQUESTS=100
```

### Security Headers

Add to Nginx config:

```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline';" always;
```

### Rate Limiting

Implement rate limiting for AI features:

```typescript
// Simple rate limiter
const rateLimitMap = new Map();

const rateLimiter = {
  isLimited: (ip: string): boolean => {
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 10;
    
    const requests = rateLimitMap.get(ip) || [];
    const recentRequests = requests.filter((time: number) => now - time < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      return true;
    }
    
    recentRequests.push(now);
    rateLimitMap.set(ip, recentRequests);
    return false;
  }
};
```

---

## Troubleshooting

### Common Deployment Issues

#### 1. 404 on Page Refresh

**Problem**: SPA routing issue  
**Solution**: Configure server to redirect all routes to index.html

#### 2. Assets Not Loading

**Problem**: Incorrect base path  
**Solution**: Set correct `base` in vite.config.ts

#### 3. CORS Errors

**Problem**: API requests blocked  
**Solution**: Configure CORS on server or use proxy

#### 4. Slow Performance

**Problem**: Large bundle size  
**Solution**: Enable code splitting, lazy loading, compression

---

## Support

For deployment issues:
- Check [GitHub Issues](https://github.com/yourusername/zen-clock/issues)
- Read [Development Guide](DEVELOPMENT.md)
- Contact maintainers

---

**Happy Deploying! 🚀**
