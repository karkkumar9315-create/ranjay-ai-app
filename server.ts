import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { apiRouter } from './server/apiRouter.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Attach API Router
app.use('/api', apiRouter);

// Serve static frontend files in production
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return;
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath);
});

app.listen(PORT, () => {
  console.log(`[RANJAY AI] Server listening on port ${PORT}`);
});
