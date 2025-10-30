# 🚀 Complete Deployment Guide

## Step-by-Step: GitHub → Render Deployment

### Prerequisites
- ✅ GitHub account
- ✅ Render account (free)
- ✅ SERP API key
- ✅ Gemini API key

---

## Part 1: Prepare Your Code

### 1. Test Locally First

```bash
# Navigate to project folder
cd podcast-backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your API keys
# SERP_API_KEY=your_key_here
# GEMINI_API_KEY=your_key_here

# Test the server
npm start

# In another terminal, test the endpoint
curl http://localhost:3000/api/health
```

If you see a JSON response, it's working! ✅

---

## Part 2: Push to GitHub

### 2. Initialize Git Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: AI-powered podcast search backend"

# Set main branch
git branch -M main
```

### 3. Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click **"+"** → **"New repository"**
3. Name it: `podcast-ai-backend`
4. **DON'T** initialize with README (we already have files)
5. Click **"Create repository"**

### 4. Push to GitHub

```bash
# Add GitHub remote (replace with YOUR username)
git remote add origin https://github.com/YOUR_USERNAME/podcast-ai-backend.git

# Push code
git push -u origin main
```

Refresh GitHub page - you should see your files! ✅

---

## Part 3: Deploy on Render

### 5. Connect Render to GitHub

1. Go to [render.com](https://render.com)
2. Sign up or log in (can use GitHub account)
3. Click **"New +"** → **"Web Service"**
4. Click **"Connect GitHub"** (if first time)
5. Find your `podcast-ai-backend` repository
6. Click **"Connect"**

### 6. Configure Service

Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `podcast-ai-backend` |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | `Free` (or Starter for better performance) |

### 7. Add Environment Variables

Scroll down to **"Environment Variables"** section:

Click **"Add Environment Variable"** for each:

```
Key: NODE_ENV
Value: production

Key: SERP_API_KEY
Value: [paste your SERP API key]

Key: GEMINI_API_KEY
Value: [paste your Gemini API key]

Key: CACHE_TTL
Value: 3600

Key: MAX_REQUESTS_PER_MINUTE
Value: 30
```

**Important**: Keep these keys SECRET! Never commit them to GitHub.

### 8. Deploy!

1. Click **"Create Web Service"**
2. Wait 2-5 minutes for deployment
3. Watch the logs - should see: "🚀 Server running on port 10000"

---

## Part 4: Test Your Deployed Backend

### 9. Get Your Backend URL

Render will give you a URL like:
```
https://podcast-ai-backend.onrender.com
```

### 10. Test It

```bash
# Test health endpoint
curl https://your-app-name.onrender.com/api/health

# Test search (replace URL with yours)
curl -X POST https://your-app-name.onrender.com/api/search/intelligent \
  -H "Content-Type: application/json" \
  -d '{
    "query": "english premier league results",
    "podcastDescription": "Sports podcast",
    "numResults": 3
  }'
```

If you get JSON responses, **IT WORKS!** 🎉

---

## Part 5: Connect to Your Frontend

### 11. Update Frontend Code

In your **TypeScript/JavaScript** frontend:

```typescript
// Replace with your Render URL
const BACKEND_URL = 'https://your-app-name.onrender.com';

async function searchForPodcast(query: string, description: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/search/intelligent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        podcastDescription: description,
        numResults: 5
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Search results:', data.data.results);
      return data.data.results;
    } else {
      console.error('❌ Search failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// Use it
searchForPodcast('premier league', 'Sports podcast covering football');
```

---

## 🔄 Future Updates

When you make changes:

```bash
# Make changes to code
# Test locally first!

# Commit changes
git add .
git commit -m "Description of changes"

# Push to GitHub
git push origin main

# Render will automatically redeploy! 🚀
```

---

## 🐛 Troubleshooting

### Problem: "Application failed to start"

**Solution**: Check Render logs:
1. Go to Render dashboard
2. Click your service
3. Click "Logs" tab
4. Look for errors

Common issues:
- ❌ Missing environment variables → Add them in Render dashboard
- ❌ Wrong start command → Should be `npm start`
- ❌ Dependencies not installed → Check build logs

### Problem: "CORS error still happening"

**Solution**:
1. Make sure you're calling the RENDER URL, not SERP API directly
2. Check browser console for exact error
3. Verify backend is running: `curl https://your-app.onrender.com/api/health`

### Problem: "429 Too Many Requests"

**Solution**: 
- You hit rate limit (30 requests/minute)
- Wait 1 minute or increase `MAX_REQUESTS_PER_MINUTE` in Render

### Problem: "Free tier sleeping"

**Solution**:
- Free tier sleeps after 15 min inactivity
- First request takes ~30 seconds to wake up
- Upgrade to Starter plan ($7/month) for always-on

---

## 📊 Monitoring

### View Logs
```
Render Dashboard → Your Service → Logs
```

### Check Health
```
https://your-app.onrender.com/api/health
```

### Monitor Usage
- SERP API: Check [serpapi.com](https://serpapi.com) dashboard
- Gemini: Check [ai.google.dev](https://ai.google.dev) quota

---

## 💰 Cost Estimate

| Service | Free Tier | Cost if Exceeded |
|---------|-----------|------------------|
| **Render** | 750 hours/month | $7/month (Starter) |
| **SERP API** | 100 searches/month | $50/month (5000 searches) |
| **Gemini** | 60 requests/minute | Free (as of 2024) |

**Total for moderate use**: $0 - $10/month

---

## ✅ Checklist

Before going live:

- [ ] Tested locally
- [ ] Code pushed to GitHub
- [ ] Render service created
- [ ] Environment variables added
- [ ] Backend URL tested with curl
- [ ] Frontend updated with backend URL
- [ ] End-to-end test completed
- [ ] Logs checked for errors

---

## 🎉 Success!

Your backend is now:
- ✅ Deployed and running 24/7
- ✅ Solving CORS issues
- ✅ AI-enhanced search working
- ✅ Auto-deploying on GitHub push

**You did it!** 🚀

Need help? Check the README.md or open an issue on GitHub!
