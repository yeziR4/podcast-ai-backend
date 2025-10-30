# 🎙️ AI-Powered Podcast Search Backend

An intelligent Node.js backend that solves CORS issues and enhances web searches for podcast generation using AI (Gemini).

## 🌟 Features

- ✅ **Solves CORS Issues**: Acts as a proxy between your frontend and SERP API
- 🤖 **AI-Enhanced Search**: Uses Gemini AI to analyze podcast context and generate intelligent search queries
- 📊 **Smart Aggregation**: Combines multiple search results and removes duplicates
- 💾 **Caching**: Reduces API costs by caching frequent searches
- 🚀 **Fast & Lightweight**: Built with Express.js for optimal performance
- 🔒 **Rate Limiting**: Protects against abuse with built-in rate limiting
- 📝 **Detailed Logging**: Comprehensive logs for debugging

## 🚀 Quick Start

See [QUICKSTART.md](QUICKSTART.md) for a 5-minute setup guide!

## 📡 API Endpoints

### Health Check
```
GET /api/health
```

### Intelligent Search (AI-Powered)
```
POST /api/search/intelligent

Body:
{
  "query": "english premier league recent results",
  "podcastDescription": "A sports podcast covering latest football news",
  "context": "Looking for recent match results and standings",
  "numResults": 5
}
```

### Basic Search
```
POST /api/search/basic

Body:
{
  "query": "english premier league",
  "numResults": 5
}
```

## 🎯 Frontend Integration (TypeScript)

```typescript
const API_BASE_URL = 'https://your-render-app.onrender.com/api';

interface SearchRequest {
  query: string;
  podcastDescription?: string;
  context?: string;
  numResults?: number;
}

export async function intelligentSearch(request: SearchRequest) {
  const response = await fetch(`${API_BASE_URL}/search/intelligent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return await response.json();
}

// Usage
const results = await intelligentSearch({
  query: 'premier league results',
  podcastDescription: 'Sports podcast',
  numResults: 5
});
```

## 🚀 Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for complete deployment instructions.

**Quick Deploy to Render:**
1. Push code to GitHub
2. Connect repository on Render
3. Add environment variables
4. Deploy!

## 🔑 Environment Variables

```env
SERP_API_KEY=your_key_here        # Required
GEMINI_API_KEY=your_key_here      # Required
PORT=3000                          # Optional
NODE_ENV=production                # Optional
CACHE_TTL=3600                     # Optional
MAX_REQUESTS_PER_MINUTE=30         # Optional
```

## 📚 Documentation

- [QUICKSTART.md](QUICKSTART.md) - 5-minute setup guide
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Complete deployment walkthrough

## 📝 License

MIT License - Feel free to use in your projects!

---

Built with ❤️ for podcast creators
