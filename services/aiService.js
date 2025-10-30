import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI;
let model;

// Initialize Gemini AI
function initializeAI() {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY not found. AI features will be disabled.');
    return false;
  }

  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    console.log('✅ Gemini AI initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Gemini AI:', error.message);
    return false;
  }
}

// Initialize on module load - DELAYED
let aiAvailable = false;
setTimeout(() => {
  aiAvailable = initializeAI();
}, 100);


/**
 * Analyze search intent and generate enhanced queries
 */
export async function analyzeSearchIntent({ originalQuery, podcastDescription, context }) {
  if (!aiAvailable) {
    console.log('⚠️ AI not available, returning original query');
    return {
      enhancedQueries: [originalQuery],
      additionalTopics: [],
      strategy: 'basic'
    };
  }

  try {
    const prompt = buildAnalysisPrompt(originalQuery, podcastDescription, context);
    
    console.log('🤖 Sending prompt to Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('📝 AI Response received');
    
    // Parse AI response
    const analysis = parseAIResponse(text, originalQuery);
    return analysis;

  } catch (error) {
    console.error('❌ AI analysis failed:', error.message);
    
    // Fallback to original query
    return {
      enhancedQueries: [originalQuery],
      additionalTopics: [],
      strategy: 'fallback'
    };
  }
}

/**
 * Build the AI prompt for search analysis
 */
function buildAnalysisPrompt(originalQuery, podcastDescription, context) {
  return `You are an intelligent search assistant for a podcast generator. Your job is to analyze user search queries and enhance them to get the most relevant, comprehensive, and up-to-date information.

ORIGINAL QUERY: "${originalQuery}"

PODCAST CONTEXT:
${podcastDescription ? `Description: ${podcastDescription}` : 'No description provided'}
${context ? `Additional Context: ${context}` : ''}

YOUR TASK:
1. Analyze the search intent
2. Generate 2-3 enhanced search queries that will retrieve more relevant information
3. Identify additional related topics that would enrich the podcast content
4. Consider current events, recent developments, and diverse perspectives

REQUIREMENTS:
- Enhanced queries should be specific and targeted
- Include time-sensitive terms if the topic is current (e.g., "2024", "latest", "recent")
- Consider different angles: news, analysis, statistics, expert opinions
- Keep queries concise and searchable

RESPONSE FORMAT (JSON):
{
  "enhancedQueries": ["query1", "query2", "query3"],
  "additionalTopics": ["topic1", "topic2"],
  "reasoning": "Brief explanation of your strategy"
}

Respond ONLY with valid JSON, no additional text.`;
}

/**
 * Parse AI response and extract structured data
 */
function parseAIResponse(text, fallbackQuery) {
  try {
    // Try to extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate and return
    return {
      enhancedQueries: Array.isArray(parsed.enhancedQueries) && parsed.enhancedQueries.length > 0
        ? parsed.enhancedQueries.slice(0, 3)
        : [fallbackQuery],
      additionalTopics: Array.isArray(parsed.additionalTopics)
        ? parsed.additionalTopics.slice(0, 5)
        : [],
      strategy: 'ai-enhanced',
      reasoning: parsed.reasoning || 'AI analysis completed'
    };

  } catch (error) {
    console.error('❌ Failed to parse AI response:', error.message);
    console.log('Raw response:', text);
    
    // Fallback
    return {
      enhancedQueries: [fallbackQuery],
      additionalTopics: [],
      strategy: 'parse-error'
    };
  }
}

/**
 * Generate podcast research suggestions based on topic
 */
export async function generateResearchSuggestions(topic) {
  if (!aiAvailable) {
    return [];
  }

  try {
    const prompt = `Generate 5 specific research questions or topics to explore for a podcast about: "${topic}"
    
Return as a JSON array of strings. Example: ["question1", "question2", ...]

Respond ONLY with valid JSON.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return [];

  } catch (error) {
    console.error('❌ Failed to generate research suggestions:', error.message);
    return [];
  }
}
