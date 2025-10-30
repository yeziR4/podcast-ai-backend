# ⚡ QUICK START - 5 Minutes to Deploy

## 🎯 What You're Building

An AI-powered backend that:
- ✅ Fixes your CORS error
- 🤖 Uses Gemini AI to enhance searches
- 📊 Returns better results for your podcast generator

---

## 📦 Step 1: Download & Setup (2 minutes)

```bash
# 1. Navigate to the folder
cd podcast-backend

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env
```

---

## 🔑 Step 2: Add Your API Keys (1 minute)

Edit `.env` file:

```env
SERP_API_KEY=3d218789...your_key_here
GEMINI_API_KEY=your_gemini_key_here
```

**Where to get keys:**
- SERP API: [serpapi.com](https://serpapi.com) (free 100 searches/month)
- Gemini: [ai.google.dev](https://ai.google.dev) (free)

---

## 🧪 Step 3: Test Locally (30 seconds)

```bash
# Start server
npm start

# You should see:
# 🚀 Server running on port 3000
# ✅ SERP API Key: ✅ Configured
# ✅ Gemini API Key: ✅ Configured
```

**Test it:**
```bash
# Open new terminal
curl http://localhost:3000/api/health
```

---

## 🚀 Step 4: Deploy to Render (2 minutes)

### Option A: Quick Deploy (Fastest)

1. Push to GitHub:
```bash
git init
git add .
git commit -m "AI podcast backend"
git remote add origin https://github.com/YOUR_USERNAME/podcast-backend.git
git push -u origin main
```

2. Go to [render.com](https://render.com)
3. Click "New +" → "Web Service"
4. Connect your GitHub repo
5. Add environment variables (same as .env)
6. Click "Create Web Service"

**Done!** ✅ Your backend URL: `https://your-app.onrender.com`

### Option B: One-Click Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

---

## 🔗 Step 5: Connect to Frontend (1 minute)

Update your TypeScript/JavaScript:

```typescript
// OLD CODE (causing CORS error):
const response = await fetch('https://serpapi.com/search?...');

// NEW CODE (using your backend):
const response = await fetch('https://your-app.onrender.com/api/search/intelligent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'english premier league results',
    podcastDescription: 'Sports podcast covering football',
    numResults: 5
  })
});

const data = await response.json();
console.log(data.data.results); // Your search results!
```

---

## 🎉 You're Done!

**Before:** ❌ CORS error, direct API calls exposed
**After:** ✅ Working search, AI-enhanced, secure

---

## 📱 Test Your Live Backend

```bash
# Replace with YOUR Render URL
curl -X POST https://your-app.onrender.com/api/search/intelligent \
  -H "Content-Type: application/json" \
  -d '{
    "query": "english premier league",
    "podcastDescription": "Sports podcast",
    "numResults": 3
  }'
```

You should see JSON with search results! 🎊

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Module not found" | Run `npm install` |
| "API key not configured" | Check `.env` file |
| "Port already in use" | Change PORT in `.env` |
| CORS still happening | Make sure you're calling YOUR backend URL |

---

## 📚 Next Steps

- Read [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for details
- Check [README.md](README.md) for full documentation
- Test with different queries
- Monitor logs in Render dashboard

---

## 💡 Pro Tips

1. **Free tier sleeps**: First request after 15min takes ~30s
2. **Cache works**: Same queries return instantly
3. **AI is smart**: It generates multiple search angles
4. **Logs are your friend**: Check them if something breaks

---

**Need help?** Open an issue on GitHub or check the logs!

**Happy podcast building!** 🎙️✨
