/**
 * ADD THIS TO YOUR RENDER BACKEND
 * This debug endpoint will help diagnose environment variable issues
 */

// ============================================
// DEBUG ENDPOINT - Add this to your Express app
// ============================================

// Example: app.js or server.js
app.get('/api/debug/check-env', (req, res) => {
  const serpApiKey = process.env.SERP_API_KEY;
  
  res.json({
    success: true,
    checks: {
      hasApiKey: !!serpApiKey,
      keyLength: serpApiKey ? serpApiKey.length : 0,
      keyPrefix: serpApiKey ? serpApiKey.substring(0, 10) + "..." : "NOT_SET",
      allEnvVarsCount: Object.keys(process.env).length,
      nodeEnv: process.env.NODE_ENV,
      // List all env var names (not values) for debugging
      availableEnvVars: Object.keys(process.env).filter(key => 
        key.includes('SERP') || key.includes('API')
      )
    },
    message: serpApiKey 
      ? "API key is loaded in environment" 
      : "⚠️ API key is NOT loaded in environment"
  });
});

// ============================================
// HARDCODED KEY TEST ENDPOINT
// ============================================

app.post('/api/search/test-hardcoded', async (req, res) => {
  console.log("🧪 Testing with HARDCODED API key");
  
  // ⚠️ TEMPORARILY hardcode your key here for testing
  const HARDCODED_KEY = "YOUR_SERP_API_KEY_HERE"; // REPLACE THIS
  
  const { query, numResults = 5 } = req.body;
  
  try {
    const serpApiUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${HARDCODED_KEY}&num=${numResults}`;
    
    const response = await fetch(serpApiUrl);
    const data = await response.json();
    
    if (response.status === 200) {
      res.json({
        success: true,
        message: "Hardcoded key works!",
        results: data.organic_results || [],
        testType: "hardcoded"
      });
    } else {
      res.status(response.status).json({
        success: false,
        error: {
          message: `SERP API returned ${response.status}: ${data.error || 'Unknown error'}`,
          response: data
        },
        testType: "hardcoded"
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message,
        type: error.constructor.name
      },
      testType: "hardcoded"
    });
  }
});

// ============================================
// ENHANCED LOGGING FOR EXISTING ENDPOINT
// ============================================

app.post('/api/search/intelligent', async (req, res) => {
  const { query, podcastDescription, numResults = 5 } = req.body;
  
  // Get API key from environment
  const apiKey = process.env.SERP_API_KEY;
  
  // Enhanced logging
  console.log("🔍 Intelligent Search Request:");
  console.log("  Query:", query);
  console.log("  API Key loaded:", !!apiKey);
  console.log("  API Key length:", apiKey ? apiKey.length : 0);
  console.log("  API Key prefix:", apiKey ? apiKey.substring(0, 10) + "..." : "NOT_SET");
  
  // Check if API key exists
  if (!apiKey) {
    console.error("❌ SERP_API_KEY not found in environment variables!");
    console.error("Available env vars with 'API':", 
      Object.keys(process.env).filter(k => k.includes('API'))
    );
    
    return res.status(500).json({
      success: false,
      error: {
        message: "SERP_API_KEY not configured in environment variables",
        type: "ConfigurationError",
        hint: "Set SERP_API_KEY in Render dashboard environment variables"
      },
      timestamp: new Date().toISOString()
    });
  }
  
  // Check for extra whitespace (common issue)
  const trimmedKey = apiKey.trim();
  if (trimmedKey !== apiKey) {
    console.warn("⚠️  API key has whitespace! Trimming...");
  }
  
  try {
    const serpApiUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${trimmedKey}&num=${numResults}`;
    
    console.log("📡 Calling SERP API...");
    
    const response = await fetch(serpApiUrl);
    const data = await response.json();
    
    console.log("📡 SERP API Response Status:", response.status);
    
    if (response.status === 200) {
      console.log("✅ SERP API Success!");
      res.json({
        success: true,
        results: data.organic_results || [],
        searchInfo: data.search_information
      });
    } else {
      console.error("❌ SERP API Error:", data);
      res.status(response.status).json({
        success: false,
        error: {
          message: `Search failed: SERP API returned ${response.status}: ${data.error || 'Unknown error'}`,
          type: "Error"
        },
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error("❌ Request failed:", error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message,
        type: error.constructor.name
      },
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================
// COMMON ISSUES CHECKLIST
// ============================================

/*
🔧 TROUBLESHOOTING CHECKLIST:

1. ✅ API Key in Render Environment Variables
   - Go to Render Dashboard → Your Service → Environment
   - Add: SERP_API_KEY = your_actual_key
   - NO quotes, NO spaces

2. ✅ Redeploy After Setting Env Vars
   - Render requires a redeploy to load new env vars
   - Click "Manual Deploy" → "Deploy latest commit"

3. ✅ Check API Key Format
   - Should be alphanumeric string
   - Usually 64 characters long
   - No spaces, no quotes

4. ✅ Verify SERP API Account
   - Visit: https://serpapi.com/manage-api-key
   - Check if key is active
   - Check if you have remaining credits

5. ✅ Check Variable Name
   - Must be exactly: SERP_API_KEY
   - Case sensitive!
   - No typos

6. ✅ CORS Headers (if calling from browser)
   app.use(cors({
     origin: ['your-creao-domain'],
     credentials: true
   }));
*/
