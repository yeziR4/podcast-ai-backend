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
 * Perform actual SERP API search
 */
async function performSerpSearch(query, numResults = 5) {
  const apiKey = process.env.SERP_API_KEY;

  if (!apiKey) {
    console.error('❌ SERP_API_KEY is not configured');
    throw new Error('SERP_API_KEY is not configured');
  }

  // Log API key info
  console.log('\n🔑 API Key Check:');
  console.log(`   - Length: ${apiKey.length}`);
  console.log(`   - First 10: ${apiKey.substring(0, 10)}...`);
  console.log(`   - Has whitespace: ${apiKey !== apiKey.trim() ? 'YES ⚠️' : 'NO ✅'}`);

  // CRITICAL FIX: Trim whitespace
  const trimmedKey = apiKey.trim();

  try {
    console.log(`\n📡 Calling SERP API for: "${query}"`);
    
    const response = await axios.get('https://serpapi.com/search', {
      params: {
        engine: 'google',
        q: query,
        api_key: trimmedKey,  // ← USE TRIMMED KEY
        num: numResults
      },
      timeout: 10000
    });

    console.log(`✅ SERP API Success! Results: ${response.data.organic_results?.length || 0}`);

    // Extract organic results
    const organicResults = response.data.organic_results || [];
    
    return organicResults.map(result => ({
      title: result.title,
      link: result.link,
      snippet: result.snippet,
      displayLink: result.displayed_link,
      source: result.source,
      date: result.date
    }));

  } catch (error) {
    console.error('\n❌ SERP API Failed:');
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Error:`, error.response.data);
      
      if (error.response.status === 401) {
        console.error('\n🔴 401 - Invalid API Key!');
        console.error(`   Key used (first 10): ${trimmedKey.substring(0, 10)}...`);
        console.error('   Check: https://serpapi.com/manage-api-key');
      }
      
      throw new Error(`SERP API returned ${error.response.status}: ${error.response.data?.error || 'Unknown error'}`);
    } else if (error.request) {
      console.error('   No response from SERP API');
      throw new Error('SERP API did not respond');
    } else {
      console.error(`   Error: ${error.message}`);
      throw error;
    }
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
