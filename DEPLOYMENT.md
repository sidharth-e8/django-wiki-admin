# 🚀 Deployment Guide

## Quick Deploy to Vercel (Recommended)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/django-ai-wiki-api.git
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Connect your GitHub repository
   - Add environment variables:
     - `OPENAI_API_KEY`: Your OpenAI API key
     - `API_KEY`: (Optional) Project API key for additional security

3. **Test deployment**:
   ```bash
   curl https://your-app.vercel.app/api/health
   ```

## Alternative Deployment Options

### Railway

1. **Connect repository** to Railway
2. **Add environment variables** in Railway dashboard
3. **Deploy** automatically

### Netlify

1. **Build command**: `npm run build`
2. **Publish directory**: `.next`
3. **Add environment variables**

### Heroku

1. **Create Heroku app**:
   ```bash
   heroku create your-app-name
   ```

2. **Set environment variables**:
   ```bash
   heroku config:set OPENAI_API_KEY=your-key
   ```

3. **Deploy**:
   ```bash
   git push heroku main
   ```

### Docker

1. **Create Dockerfile**:
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and run**:
   ```bash
   docker build -t django-ai-wiki-api .
   docker run -p 3000:3000 -e OPENAI_API_KEY=your-key django-ai-wiki-api
   ```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | ✅ | Your OpenAI API key |
| `API_KEY` | ❌ | Optional project-level API key |
| `NODE_ENV` | ❌ | Set to 'production' for production |

## Post-Deployment

1. **Test the API**:
   ```bash
   node test-api.js
   ```

2. **Update Django AI Wiki** to use your API URL:
   ```python
   # In django-ai-wiki server.py
   API_URL = 'https://your-deployed-api.com/api/chat'
   ```

3. **Monitor logs** for any issues

## Security Checklist

- ✅ HTTPS enabled
- ✅ Environment variables set securely
- ✅ API keys not exposed in code
- ✅ CORS configured appropriately
- ✅ Request size limits in place
- ✅ Timeout protection enabled

## Troubleshooting

### Common Issues

1. **"OpenAI API key not configured"**
   - Ensure `OPENAI_API_KEY` is set in environment variables

2. **"Request timeout"**
   - Check OpenAI API status
   - Verify network connectivity

3. **"Rate limit exceeded"**
   - Implement request queuing
   - Consider upgrading OpenAI plan

4. **CORS errors**
   - Check CORS headers configuration
   - Verify request origin

### Monitoring

- Use platform-specific logging (Vercel Functions, Railway logs, etc.)
- Monitor `/api/health` endpoint
- Set up uptime monitoring
- Track API usage and costs
