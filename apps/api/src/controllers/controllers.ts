import type { Request, Response } from 'express';
import path from 'node:path';
import { fileTypeFromBuffer } from 'file-type';
import { authService } from '../services/auth.service.js';
import { contentService } from '../services/content.service.js';
import { prisma } from '../config/prisma.js';
import { scanContent } from '../services/detection.service.js';
import { audit } from '../services/audit.service.js';
import { storeUpload } from '../services/upload.service.js';
import { AppError } from '../utils/errors.js';

const send = (res: Response, data: unknown, meta?: object) => res.json({ success: true, data, ...(meta ? { meta } : {}) });
const cookie = (res: Response, token: string) =>
  res.cookie('refresh_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/v1/auth',
    maxAge: 6048e5,
  });

export const authController = {
  signup: async (req: Request, res: Response) => {
    const r = await authService.signup(req.body, req.ip);
    cookie(res, r.refresh);
    send(res, { user: r.user, accessToken: r.access });
  },
  login: async (req: Request, res: Response) => {
    const r = await authService.login(req.body.email, req.body.password, req.ip);
    cookie(res, r.refresh);
    send(res, { user: r.user, accessToken: r.access });
  },
  refresh: async (req: Request, res: Response) => {
    const r = await authService.rotate(req.cookies.refresh_token, req.ip);
    cookie(res, r.refresh);
    send(res, { accessToken: r.access });
  },
  logout: async (req: Request, res: Response) => {
    await authService.logout(req.cookies.refresh_token, req.ip);
    res.clearCookie('refresh_token', { path: '/api/v1/auth' });
    send(res, {});
  },
};

export const contentController = {
  list: async (req: Request, res: Response) => {
    const q = req.query as { page: number; limit: number; search?: string };
    const [data, total] = await Promise.all([
      contentService.list(req.user!.id, q.page, q.limit, q.search),
      contentService.count(req.user!.id, q.search),
    ]);
    send(res, data, { page: q.page, limit: q.limit, total });
  },
  create: async (req: Request, res: Response) => send(res, await contentService.create(req.user!.id, req.body), {}),
  upload: async (req: Request, res: Response) => {
    if (!req.file) throw new AppError(400, 'FILE_REQUIRED', 'Please choose an image or video file');

    const type = req.body.type as 'IMAGE' | 'VIDEO';
    const detected = await fileTypeFromBuffer(req.file.buffer);
    const mimeType = detected?.mime ?? req.file.mimetype;
    const isImage = mimeType.startsWith('image/');
    const isVideo = mimeType.startsWith('video/');

    if (type === 'IMAGE' && !isImage) throw new AppError(400, 'INVALID_FILE_TYPE', 'Images require an image file');
    if (type === 'VIDEO' && !isVideo) throw new AppError(400, 'INVALID_FILE_TYPE', 'Videos require a video file');

    const extension = detected ? `.${detected.ext}` : path.extname(req.file.originalname) || (isImage ? '.png' : '.mp4');
    const content = await contentService.createMedia(req.user!.id, {
      title: req.body.title,
      description: req.body.description || undefined,
      type,
      mimeType,
      byteSize: req.file.size,
      storageKey: '',
    });

    const stored = await storeUpload({
      ownerId: req.user!.id,
      contentId: content.id,
      buffer: req.file.buffer,
      mimeType,
      extension,
    });

    const updated = await prisma.content.update({
      where: { id: content.id },
      data: { storageKey: stored.storageKey, status: 'AVAILABLE' },
    });

    await audit(req.user!.id, 'CONTENT_UPLOADED', req.ip, {
      contentId: content.id,
      mimeType,
      byteSize: req.file.size,
    });

    send(res, updated);
  },
  get: async (req: Request, res: Response) => send(res, await contentService.owned(req.user!.id, req.params.id)),
  update: async (req: Request, res: Response) => send(res, await contentService.update(req.user!.id, req.params.id, req.body)),
  remove: async (req: Request, res: Response) => {
    await contentService.owned(req.user!.id, req.params.id);
    await audit(req.user!.id, 'CONTENT_DELETED', req.ip);
    await contentService.remove(req.user!.id, req.params.id);
    send(res, {});
  },
  scan: async (req: Request, res: Response) => send(res, { created: await scanContent(req.user!.id, req.params.id) }),
};

export const analyticsController = {
  summary: async (req: Request, res: Response) => {
    const id = req.user!.id;
    const [total, reports, alerts, avg, ranking, activity] = await Promise.all([
      prisma.content.count({ where: { ownerId: id, status: { not: 'DELETED' } } }),
      prisma.report.count({ where: { content: { ownerId: id } } }),
      prisma.alert.count({ where: { ownerId: id, status: { in: ['NEW', 'REVIEWING'] } } }),
      prisma.report.aggregate({ where: { content: { ownerId: id } }, _avg: { confidence: true } }),
      prisma.content.findMany({ where: { ownerId: id }, include: { _count: { select: { reports: true } } }, take: 5, orderBy: { reports: { _count: 'desc' } } }),
      prisma.alert.findMany({ where: { ownerId: id }, take: 8, orderBy: { createdAt: 'desc' }, include: { report: { include: { content: true } } } }),
    ]);
    send(res, { totalContent: total, totalUses: reports, activeAlerts: alerts, averageConfidence: avg._avg.confidence ?? 0, ranking, activity });
  },
};

export const alertController = {
  list: async (req: Request, res: Response) =>
    send(
      res,
      await prisma.alert.findMany({
        where: { ownerId: req.user!.id },
        include: { report: { include: { content: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ),
  update: async (req: Request, res: Response) => {
    const alert = await prisma.alert.findFirst({ where: { id: req.params.id, ownerId: req.user!.id } });
    if (!alert) return res.status(404).json({ success: false, error: { code: 'ALERT_NOT_FOUND', message: 'Alert was not found' } });
    const updated = await prisma.alert.update({ where: { id: alert.id }, data: req.body });
    await audit(req.user!.id, 'ALERT_STATUS_CHANGED', req.ip, { alertId: alert.id });
    send(res, updated);
  },
};
