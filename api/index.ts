import 'dotenv/config';
import express from 'express';
import { registerRoutes } from '../server/routes';
import cors from 'cors';

const app = express();

// CORS configuration - now same-origin on Vercel, but still allow localhost for dev
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (same-origin, mobile apps, etc.)
    if (!origin) return callback(null, true);
    const isLocal = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    const isHttps = /^https:\/\//.test(origin);
    if (isLocal || isHttps) return callback(null, true);
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Register API routes
registerRoutes(app);

// Export for Vercel serverless
export default app;
