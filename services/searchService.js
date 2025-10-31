import axios from 'axios';
import { analyzeSearchIntent } from './aiService.js';
import { cache } from '../utils/cache.js';

/**
 * Intelligent AI-powered search
 * Analyzes podcast context and enhances search queries
 */
export async function intelligentSearch({ query, podcastDescription, context, numResults = 5 }) {
  try {
    // Step 1: Use AI to analyze and enhance the search
    console.log('🤖 Step 1: Analyzing search intent with AI...');
    const aiAnalysis = await analyzeSearchIntent({
      originalQuery: query,
      podcastDescription,
      context
    });

    console.log('✅ AI Analysis complete:');
    console.log(`   Enhanced queries: ${aiAnalysis.enhancedQueries.length}`);
    console.log(`   Additional topics: ${aiAnalysis.additionalTopics.length}`);

    // Step 2: Perform searches with enhanced queries
    console.log('\n🔍 Step 2: Performing enhanced searches...');
    const searchPromises = aiAnalysis.enhancedQueries.map(enhancedQuery =>
      performSerpSearch(enhancedQuery, Math.ceil(numResults / aiAnalysis.enhancedQueries.length))
    );

    const searchResults = await Promise.all(searchPromises);

    // Step 3: Aggregate and deduplicate results
    console.log('📊 Step 3: Aggregating results...');
    const allResults = searchResults.flat();
    const uniqueResults = deduplicateResults(allResults);

    // Step 4: Return enriched response
    return {
      originalQuery: query,
      aiEnhancement: {
        enhancedQueries: aiAnalysis.enhancedQueries,
        additionalTopics: aiAnalysis.additionalTopics,
        searchStrategy: aiAnalysis.strategy
      },
      results: uniqueResults.slice(0, numResults),
      totalResults: uniqueResults.length,
      cached: false
    };

  } catch (error) {
    console.error('❌ Intelligent search failed:', error.message);
    
    // Fallback to basic search if AI fails
    console.log('⚠️ Falling back to basic search...');
    return await basicSearch({ query, numResults });
  }
}

/**
 * Basic SERP API search without AI enhancement
 */
export async function basicSearch({ query, numResults = 5 }) {
  try {
    // Check cache first
    const cacheKey = `basic_${query}_${numResults}`;
    const cachedResult = cache.get(cacheKey);
    
    if (cachedResult) {
      console.log('💾 Returning cached results');
      return { ...cachedResult, cached: true };
    }

    console.log('🔍 Performing basic SERP search...');
    const results = await performSerpSearch(query, numResults);

    const response = {
      originalQuery: query,
      results,
      totalResults: results.length,
      cached: false
    };

    // Cache the results
    cache.set(cacheKey, response);

    return response;

  } catch (error) {
    console.error('❌ Basic search failed:', error.message);
    throw new Error(`Search failed: ${error.message}`);
  }
}

/**
 * Perform actual SERPER.DEV API search
 * NOTE: Using SERPER.DEV, not SERPAPI.COM!
 */
async function performSerpSearch(query, numResults = 5) {
  const apiKey = process.env.SERP_API_KEY;
  
  // Enhanced API key check
  if (!apiKey) {
    console.error('❌ SERP_API_KEY is not configured in environment');
    throw new Error('SERP_API_KEY is not configured');
  }

  // Log API key info (safely)
  console.log('\n🔑 API Key Check:');
  console.log(`   - Loaded: YES`);
  console.log(`   - Length: ${apiKey.length}`);
  console.log(`   - First 10 chars: ${apiKey.substring(0, 10)}...`);
  console.log(`   - Service: SERPER.DEV ✅`);
  
  // Trim whitespace
  const trimmedKey = apiKey.trim();
  
  if (trimmedKey !== apiKey) {
    console.log('⚠️  WARNING: API key had whitespace! Trimmed it.');
  }

  try {
    console.log(`\n📡 Calling SERPER.DEV API:`);
    console.log(`   Query: "${query}"`);
    console.log(`   NumResults: ${numResults}`);
    console.log(`   Endpoint: https://google.serper.dev/search`);
    
    // SERPER.DEV API CALL
    // Different from SERPAPI.COM:
    // - POST method (not GET)
    // - X-API-KEY header (not api_key param)
    // - Different response format
    const response = await axios.post(
      'https://google.serper.dev/search',
      {
        q: query,
        num: numResults
      },
      {
        headers: {
          'X-API-KEY': trimmedKey,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log(`✅ SERPER.DEV API Success!`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Results found: ${response.data.organic?.length || 0}`);

    // Extract organic results (SERPER.DEV uses "organic", not "organic_results")
    const organicResults = response.data.organic || [];
    
    // Map SERPER.DEV response format to your expected format
    return organicResults.map(result => ({
      title: result.title,
      link: result.link,
      snippet: result.snippet,
      displayLink: result.link,
      source: result.source || extractDomain(result.link),
      date: result.date
    }));

  } catch (error) {
    console.error('\n❌ SERPER.DEV API Request Failed:');
    
    if (error.response) {
      // Server responded with error status
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Status Text: ${error.response.statusText}`);
      console.error(`   Error Data:`, JSON.stringify(error.response.data, null, 2));
      
      // Check if it's a 401 (Invalid API key)
      if (error.response.status === 401) {
        console.error('\n🔴 401 UNAUTHORIZED - API Key Issue!');
        console.error('   Your SERPER.DEV API key is invalid');
        console.error('   Check: https://serper.dev/dashboard');
        console.error(`   Key used (first 10): ${trimmedKey.substring(0, 10)}...`);
      }
      
      throw new Error(`SERPER.DEV API returned ${error.response.status}: ${error.response.data?.message || error.response.data?.error || 'Unknown error'}`);
      
    } else if (error.request) {
      // Request was made but no response received
      console.error('   No response received from SERPER.DEV API');
      console.error('   This might be a network issue');
      throw new Error('SERPER.DEV API did not respond');
      
    } else {
      // Something else went wrong
      console.error(`   Error: ${error.message}`);
      throw error;
    }
  }
}

/**
 * Extract domain from URL
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
}

/**
 * Remove duplicate search results based on URL
 */
function deduplicateResults(results) {
  const seen = new Set();
  return results.filter(result => {
    if (seen.has(result.link)) {
      return false;
    }
    seen.add(result.link);
    return true;
  });
}
