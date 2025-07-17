# 🤖 Django AI Wiki API

A secure Next.js API server that provides AI-powered chat functionality for the Django AI Wiki project. This service acts as a proxy between the Django AI Wiki CLI tool and OpenAI, ensuring API keys remain secure.

## ✨ Features

- 🔒 **Secure API Key Management**: OpenAI keys never exposed to clients
- 🚀 **High Performance**: Built on Next.js with TypeScript
- 🛡️ **Input Validation**: Comprehensive request validation and sanitization
- ⚡ **Smart Fallbacks**: GPT-4 with automatic GPT-3.5-turbo fallback
- 📊 **Request Logging**: Detailed logging for monitoring and debugging
- 🔐 **Optional Project Auth**: Additional API key protection
- 🌐 **CORS Support**: Ready for cross-origin requests
- ⏱️ **Timeout Protection**: Prevents hanging requests

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- OpenAI API key
- npm or yarn

### Installation

1. **Clone and setup**:
   ```bash
   cd django-ai-wiki-api
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   ```

3. **Add your OpenAI API key** to `.env`:
   ```env
   OPENAI_API_KEY=sk-your-openai-api-key-here
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Visit**: http://localhost:3000

## 📋 API Endpoints

### `POST /api/chat`

Process Django documentation questions using AI.

**Request Body**:
```json
{
  "question": "Explain the leave approval flow",
  "docs": "<combined markdown + Mermaid diagram text>"
}
```

**Response**:
```json
{
  "answer": "The leave approval flow works like this: ..."
}
```

**Headers** (optional):
- `x-api-key`: Project API key if `API_KEY` is set in environment

### `GET /api/health`

Check API status and configuration.

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "openai_configured": true,
  "api_key_required": false
}
```

## ⚙️ Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | ✅ | Your OpenAI API key |
| `API_KEY` | ❌ | Optional project-level API key for additional security |
| `NODE_ENV` | ❌ | Environment (development/production) |

### Security Features

- **Request Size Limits**: Max 10MB request body
- **Content Truncation**: Automatically truncates large documentation
- **Rate Limiting**: Built-in OpenAI rate limit handling
- **Input Validation**: Comprehensive request validation
- **Timeout Protection**: 30-second request timeout
- **CORS Headers**: Configurable cross-origin support

## 🔧 Development

### Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Project Structure

```
django-ai-wiki-api/
├── pages/
│   ├── api/
│   │   ├── chat.ts      # Main chat endpoint
│   │   └── health.ts    # Health check endpoint
│   └── index.tsx        # Homepage with API docs
├── .env.example         # Environment template
├── next.config.js       # Next.js configuration
└── package.json         # Dependencies
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect repository** to Vercel
2. **Add environment variables** in Vercel dashboard
3. **Deploy** automatically on push

### Other Platforms

This is a standard Next.js application and can be deployed to:
- Netlify
- Railway
- Heroku
- AWS
- Google Cloud
- Any Node.js hosting platform

## 🔗 Integration

### Django AI Wiki Integration

The Django AI Wiki CLI tool sends requests to this API:

```python
# In django-ai-wiki
response = requests.post('https://your-api-domain.com/api/chat', json={
    'question': user_question,
    'docs': combined_documentation
})
```

### Custom Integration

```javascript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your-project-key' // if API_KEY is set
  },
  body: JSON.stringify({
    question: 'How does user authentication work?',
    docs: 'Your Django documentation here...'
  })
});

const { answer } = await response.json();
```

## 📊 Monitoring

### Request Logging

All requests are logged with:
- Timestamp
- Client IP
- Question preview
- Response status

### Health Monitoring

Use `/api/health` endpoint for:
- Uptime monitoring
- Configuration validation
- Service health checks

## 🛡️ Security Best Practices

1. **Never expose OpenAI API keys** to client-side code
2. **Use HTTPS** in production
3. **Set API_KEY** for additional protection
4. **Monitor request logs** for abuse
5. **Implement rate limiting** at infrastructure level
6. **Keep dependencies updated**

## 📝 License

This project is part of the Django AI Wiki ecosystem.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

**Built with ❤️ for the Django AI Wiki project**
