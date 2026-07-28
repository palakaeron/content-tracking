import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import crypto from 'node:crypto';
import routes from './routes/index.js';
import { env } from './config/env.js';
import { errorHandler } from './utils/errors.js';

const allowedOrigins = env.WEB_ORIGIN.split(',').map((value) => value.trim()).filter(Boolean);

const corsOrigin = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, true);
    return;
  }

  if (env.NODE_ENV === 'development' && /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error(`Origin ${origin} is not allowed by CORS`));
};

const requestLogger = (pinoHttp as unknown as () => express.RequestHandler)();

export const app = express();

app.use((req, res, next) => {
  req.id = req.get('x-request-id') ?? crypto.randomUUID();
  res.setHeader('x-request-id', req.id);
  next();
});

app.use(requestLogger);
app.use(helmet({ hsts: env.NODE_ENV === 'production' ? undefined : false }));
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/health', (_, res) => res.json({ success: true, data: { status: 'ok' } }));
app.get('/api/v1/health', (_, res) => res.json({ success: true, data: { status: 'ok' } }));
app.use('/api/v1', routes);
app.use(errorHandler);
