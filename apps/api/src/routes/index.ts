import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import {
  authController,
  contentController,
  analyticsController,
  alertController,
  reportController,
} from '../controllers/controllers.js';
import { requireAuth, validate, csrf, asyncHandler } from '../middleware/core.js';
import {
  signupSchema,
  loginSchema,
  contentCreateSchema,
  contentUpdateSchema,
  paginationSchema,
  alertUpdateSchema,
  contentUploadSchema,
} from '@cut/shared';
import { z } from 'zod';

const r = Router();
const auth = Router();
const wrap = asyncHandler;
const id = z.object({ id: z.string().uuid() });
const limiter = rateLimit({ windowMs: 15 * 60_000, max: 10, standardHeaders: true, legacyHeaders: false });
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

auth.post('/signup', limiter, validate(signupSchema), wrap(authController.signup));
auth.post('/login', limiter, validate(loginSchema), wrap(authController.login));
auth.post('/refresh', wrap(authController.refresh));
auth.post('/logout', csrf, wrap(authController.logout));
r.use('/auth', auth);

r.use(requireAuth);
r.get('/auth/me', wrap(authController.me));
r.get('/content', validate(paginationSchema, 'query'), wrap(contentController.list));
r.post('/content', csrf, validate(contentCreateSchema), wrap(contentController.create));
r.post(
  '/content/upload',
  csrf,
  upload.single('file'),
  validate(contentUploadSchema),
  wrap(contentController.upload),
);
r.get('/content/:id', validate(id, 'params'), wrap(contentController.get));
r.patch('/content/:id', csrf, validate(id, 'params'), validate(contentUpdateSchema), wrap(contentController.update));
r.delete('/content/:id', csrf, validate(id, 'params'), wrap(contentController.remove));
r.post('/content/:id/scan', csrf, validate(id, 'params'), wrap(contentController.scan));
r.get('/analytics/summary', wrap(analyticsController.summary));
r.get('/alerts', wrap(alertController.list));
r.patch('/alerts/:id', csrf, validate(id, 'params'), validate(alertUpdateSchema), wrap(alertController.update));
r.get('/reports', validate(paginationSchema, 'query'), wrap(reportController.list));
r.get('/reports/:id', validate(id, 'params'), wrap(reportController.get));

export default r;
