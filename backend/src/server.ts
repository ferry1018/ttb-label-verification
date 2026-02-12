import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import apiRouter from './routes/api';

dotenv.config();

// Usage counter to protect API credits
let totalRequestCount = 0;
const MAX_TOTAL_REQUESTS = 200; // Adjust based on your needs

// Middleware to check and count usage
const usageCounter = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Only count verification endpoints
  if (req.path === '/api/verify-label' || req.path === '/api/verify-batch') {
    if (totalRequestCount >= MAX_TOTAL_REQUESTS) {
      return res.status(429).json({
        success: false,
        error: `Demo quota exceeded (${MAX_TOTAL_REQUESTS} requests). This is a prototype with limited API credits. For production use, please contact the developer.`,
      });
    }
    totalRequestCount++;
    console.log(`Total API requests used: ${totalRequestCount}/${MAX_TOTAL_REQUESTS}`);
  }
  return next();
};

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' })); // Larger limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Apply usage counter before routes
app.use(usageCounter);

// Rate limiting - 10 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Routes
app.use('/api', apiRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'TTB Label Verification API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: 'GET /api/health',
      verifyLabel: 'POST /api/verify-label',
      verifyBatch: 'POST /api/verify-batch',
    },
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`TTB Label Verification API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`OpenAI API Key configured: ${process.env.OPENAI_API_KEY ? 'Yes' : 'No'}`);
  console.log(`Request limit: ${MAX_TOTAL_REQUESTS} total verifications`);

  if (!process.env.OPENAI_API_KEY) {
    console.warn('WARNING: OPENAI_API_KEY not set. Label extraction will fail.');
  }
});

export default app;