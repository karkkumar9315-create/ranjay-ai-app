import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { apiRouter } from './apiRouter.js';

dotenv.config();

const app = express();

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Mount apiRouter at both /api and / to handle all rewritten /api/* requests on Vercel
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Fallback 404 handler for unknown API endpoints - ALWAYS returns valid JSON
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `API endpoint not found: ${req.method} ${req.originalUrl || req.url}`,
  });
});

// Global error handling middleware - GUARANTEES valid JSON error on uncaught server exceptions
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error('[Vercel API Uncaught Error]', err);
  res.status(500).json({
    success: false,
    error: err?.message || 'A server error occurred while processing your request.',
  });
});

export default app;
