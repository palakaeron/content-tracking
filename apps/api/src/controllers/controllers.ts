import type { Request, Response } from 'express';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileTypeFromBuffer } from 'file-type';
import { authService } from '../services/auth.service.js';
import { contentService } from '../services/content.service.js';
import { prisma } from '../config/prisma.js';
import { scanContent } from '../services/detection.service.js';
import { audit } from '../services/audit.service.js';
import { storeUpload } from '../services/upload.service.js';
import { AppError } from '../utils/errors.js';

const send = (res: Response, data: unknown, meta?: object) =>
  res.json({ success: true, data, ...(meta ? { meta } : {}) });

const csrfCookie = (res: Response) =>
  res.cookie('csrf', crypto.randomUUID(), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 6048e5,
  });

const refreshCookie = (res: Response, token: string) =>
  res.cookie('refresh_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/v1/auth',
    maxAge: 6048e5,
  });

function paramId(req: Request): string {
  return String(req.params.id);
}

export const authController = {
  signup: async (req: Request, res: Response) => {
    const result = await authService.signup(req.body, req.ip);
    refreshCookie(res, result.refresh);
    csrfCookie(res);
    send(res, { user: result.user, accessToken: result.access });
  },
  login: async (req: Request, res: Response) => {
    const result = await authService.login(req.body.email, req.body.password, req.ip);
    refreshCookie(res, result.refresh);
    csrfCookie(res);
    send(res, { user: result.user, accessToken: result.access });
  },
  refresh: async (req: Request, res: Response) => {
    const result = await authService.rotate(req.cookies.refresh_token, req.ip);
    refreshCookie(res, result.refresh);
    send(res, { accessToken: result.access });
  },
  logout: async (req: Request, res: Response) => {
    await authService.logout(req.cookies.refresh_token, req.ip);
    res.clearCookie('refresh_token', { path: '/api/v1/auth' });
    send(res, {});
  },
};

export const contentController = {
  list: async (req: Request, res: Response) => {
    const query = req.query as unknown as { page: number; limit: number; search?: string };
    const [data, total] = await Promise.all([
      contentService.list(req.user!.id, query.page, query.limit, query.search),
      contentService.count(req.user!.id, query.search),
    ]);
    send(res, data, { page: query.page, limit: query.limit, total });
  },
  create: async (req: Request, res: Response) =>
    send(res, await contentService.create(req.user!.id, req.body)),
  upload: async (req: Request, res: Response) => {
    if (!req.file) throw new AppError(400, 'FILE_REQUIRED', 'Please choose an image or video file');

    const type = req.body.type as 'IMAGE' | 'VIDEO';
    const detected = await fileTypeFromBuffer(req.file.buffer);
    const mimeType = detected?.mime ?? req.file.mimetype;
    const isImage = mimeType.startsWith('image/');
    const isVideo = mimeType.startsWith('video/');

    if (type === 'IMAGE' && !isImage) {
      throw new AppError(400, 'INVALID_FILE_TYPE', 'Images require an image file');
    }
    if (type === 'VIDEO' && !isVideo) {
      throw new AppError(400, 'INVALID_FILE_TYPE', 'Videos require a video file');
    }

    const extension =
      detected?.ext ? `.${detected.ext}` : path.extname(req.file.originalname) || (isImage ? '.png' : '.mp4');

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
      storageLocation: stored.storageLocation,
    });

    send(res, updated);
  },
  get: async (req: Request, res: Response) =>
    send(res, await contentService.owned(req.user!.id, paramId(req))),
  update: async (req: Request, res: Response) =>
    send(res, await contentService.update(req.user!.id, paramId(req), req.body)),
  remove: async (req: Request, res: Response) => {
    const id = paramId(req);
    await contentService.owned(req.user!.id, id);
    await audit(req.user!.id, 'CONTENT_DELETED', req.ip, { contentId: id });
    await contentService.remove(req.user!.id, id);
    send(res, {});
  },
  scan: async (req: Request, res: Response) =>
    send(res, { created: await scanContent(req.user!.id, paramId(req)) }),
};

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'unknown';
  }
}

export const analyticsController = {
  summary: async (req: Request, res: Response) => {
    const ownerId = req.user!.id;
    const [total, reports, alerts, avg, ranking, activity, reportsList, alertStats] = await Promise.all([
      prisma.content.count({ where: { ownerId, status: { not: 'DELETED' } } }),
      prisma.report.count({ where: { content: { ownerId } } }),
      prisma.alert.count({ where: { ownerId, status: { in: ['NEW', 'REVIEWING'] } } }),
      prisma.report.aggregate({ where: { content: { ownerId } }, _avg: { confidence: true } }),
      prisma.content.findMany({
        where: { ownerId },
        include: { _count: { select: { reports: true } } },
        take: 5,
        orderBy: { reports: { _count: 'desc' } },
      }),
      prisma.alert.findMany({
        where: { ownerId },
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { report: { include: { content: true } } },
      }),
      prisma.report.findMany({
        where: { content: { ownerId } },
        select: { detectedAt: true, sourceUrl: true },
        orderBy: { detectedAt: 'desc' },
        take: 90,
      }),
      prisma.alert.groupBy({
        by: ['severity'],
        where: { ownerId },
        _count: { _all: true },
      }),
    ]);

    const highRisk = alertStats
      .filter((row) => row.severity === 'HIGH' || row.severity === 'CRITICAL')
      .reduce((sum, row) => sum + row._count._all, 0);

    const takedowns = await prisma.alert.count({
      where: { ownerId, status: 'CONFIRMED' },
    });

    const platformMap = new Map<string, number>();
    for (const report of reportsList) {
      const domain = extractDomain(report.sourceUrl);
      platformMap.set(domain, (platformMap.get(domain) ?? 0) + 1);
    }

    const platformDistribution = [...platformMap.entries()]
      .map(([platform, count]) => ({ platform, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const trendMap = new Map<string, number>();
    for (const report of reportsList) {
      const day = report.detectedAt.toISOString().slice(0, 10);
      trendMap.set(day, (trendMap.get(day) ?? 0) + 1);
    }

    const detectionTrend = [...trendMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([date, count]) => ({ date, count }));

    const detectionRate =
      total > 0 ? Math.min(100, Number(((reports / total) * 100).toFixed(1))) : 0;

    send(res, {
      totalContent: total,
      totalUses: reports,
      activeAlerts: alerts,
      averageConfidence: avg._avg.confidence ?? 0,
      ranking,
      activity,
      detectionRate,
      highRiskViolations: highRisk,
      takedownsFiled: takedowns,
      platformDistribution,
      detectionTrend,
    });
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
    const id = paramId(req);
    const alert = await prisma.alert.findFirst({ where: { id, ownerId: req.user!.id } });
    if (!alert) {
      return res.status(404).json({
        success: false,
        error: { code: 'ALERT_NOT_FOUND', message: 'Alert was not found' },
      });
    }
    const updated = await prisma.alert.update({ where: { id: alert.id }, data: req.body });
    await audit(req.user!.id, 'ALERT_STATUS_CHANGED', req.ip, { alertId: alert.id });
    send(res, updated);
  },
};

export const reportController = {
  list: async (req: Request, res: Response) => {
    const query = req.query as unknown as { page: number; limit: number; search?: string };
    const where = {
      content: {
        ownerId: req.user!.id,
        ...(query.search ? { title: { contains: query.search } } : {}),
      },
    };

    const [data, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: { content: true, alert: true },
        orderBy: { detectedAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.report.count({ where }),
    ]);

    send(res, data, { page: query.page, limit: query.limit, total });
  },
  get: async (req: Request, res: Response) => {
    const report = await prisma.report.findFirst({
      where: { id: paramId(req), content: { ownerId: req.user!.id } },
      include: { content: true, alert: true },
    });
    if (!report) throw new AppError(404, 'REPORT_NOT_FOUND', 'Report was not found');
    send(res, report);
  },
};
