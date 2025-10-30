import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import searchRoutes from './routes/search.js';
import healthRoutes from './routes/health.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*', // In production, specify your frontend domain
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(rateLimiter);

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/search', searchRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🎙️ AI-Powered Podcast Search Backend',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      search: '/api/search/intelligent (POST)',
      basicSearch: '/api/search/basic (POST)'
    },
    documentation: 'https://github.com/yourusername/podcast-backend'
  });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 SERP API Key: ${process.env.SERP_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`🤖 Gemini API Key: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`\n📚 API Endpoints:`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Search: http://localhost:${PORT}/api/search/intelligent`);
  console.log(`\n✨ Ready to handle requests!\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received. Shutting down gracefully...');
  process.exit(0);
});
