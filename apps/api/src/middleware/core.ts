import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { jwtVerify } from 'jose';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: 'USER' | 'ADMIN' };
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

const accessKey = new TextEncoder().encode(env.JWT_ACCESS_SECRET);

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export const validate =
  (schema: z.ZodTypeAny, source: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, _: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(new AppError(400, 'VALIDATION_ERROR', 'Invalid request', result.error.flatten()));
    }
    (req as unknown as Record<string, unknown>)[source] = result.data;
    next();
  };

export async function requireAuth(req: Request, _: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) throw new Error('missing token');
    const { payload } = await jwtVerify(token, accessKey);
    req.user = {
      id: String(payload.sub),
      role: payload.role === 'ADMIN' ? 'ADMIN' : 'USER',
    };
    next();
  } catch {
    next(new AppError(401, 'UNAUTHORIZED', 'Authentication is required'));
  }
}

export const csrf = (req: Request, _: Response, next: NextFunction) => {
  if (
    ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) &&
    req.cookies.csrf !== req.get('x-csrf-token')
  ) {
    return next(new AppError(403, 'CSRF_FAILED', 'Invalid CSRF token'));
  }
  next();
};

export const requireRole =
  (role: 'ADMIN') => (req: Request, _: Response, next: NextFunction) =>
    req.user?.role === role
      ? next()
      : next(new AppError(403, 'FORBIDDEN', 'Insufficient permissions'));
