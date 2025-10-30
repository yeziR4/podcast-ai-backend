import express from 'express';
import { intelligentSearch, basicSearch } from '../services/searchService.js';

const router = express.Router();

/**
 * POST /api/search/intelligent
 * AI-powered intelligent search with topic analysis
 */
router.post('/intelligent', async (req, res, next) => {
  try {
    const { query, podcastDescription, context, numResults = 5 } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required'
      });
    }

    console.log(`\n🤖 Intelligent Search Request:`);
    console.log(`   Query: "${query}"`);
    console.log(`   Description: "${podcastDescription?.substring(0, 100)}..."`);
    console.log(`   Context: "${context?.substring(0, 50)}..."`);

    const results = await intelligentSearch({
      query,
      podcastDescription,
      context,
      numResults: Math.min(numResults, 10) // Cap at 10 results
    });

    res.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/search/basic
 * Basic SERP API search without AI enhancement
 */
router.post('/basic', async (req, res, next) => {
  try {
    const { query, numResults = 5 } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required'
      });
    }

    console.log(`\n🔍 Basic Search Request: "${query}"`);

    const results = await basicSearch({
      query,
      numResults: Math.min(numResults, 10)
    });

    res.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

export default router;
