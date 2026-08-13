import express from 'express';
import dotenv from 'dotenv';
import { apiRouter } from '../server/apiRouter';

dotenv.config();

const app = express();

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Mount apiRouter at both /api and / to handle all rewritten /api/* requests on Vercel
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
