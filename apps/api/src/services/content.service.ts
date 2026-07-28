import type { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/errors.js';

type ContentCreateData = Omit<Prisma.ContentUncheckedCreateInput, 'ownerId'>;

function listWhere(ownerId: string, search?: string): Prisma.ContentWhereInput {
  const base: Prisma.ContentWhereInput = { ownerId, NOT: { status: 'DELETED' } };
  if (!search) return base;
  return { ...base, title: { contains: search } };
}

export const contentService = {
  list: (ownerId: string, page: number, limit: number, search?: string) =>
    prisma.content.findMany({
      where: listWhere(ownerId, search),
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),

  count: (ownerId: string, search?: string) =>
    prisma.content.count({ where: listWhere(ownerId, search) }),

  create: (ownerId: string, data: ContentCreateData) =>
    prisma.content.create({ data: { ...data, ownerId } }),

  async owned(ownerId: string, id: string) {
    const content = await prisma.content.findFirst({
      where: { id, ownerId, NOT: { status: 'DELETED' } },
      include: {
        reports: { orderBy: { detectedAt: 'desc' }, include: { alert: true } },
        _count: { select: { reports: true } },
      },
    });
    if (!content) throw new AppError(404, 'CONTENT_NOT_FOUND', 'Content was not found');
    return content;
  },

  update: async (ownerId: string, id: string, data: Prisma.ContentUpdateInput) => {
    await contentService.owned(ownerId, id);
    return prisma.content.update({ where: { id }, data });
  },

  remove: async (ownerId: string, id: string) => {
    await contentService.owned(ownerId, id);
    return prisma.content.update({ where: { id }, data: { status: 'DELETED' } });
  },

  createMedia: (ownerId: string, data: ContentCreateData) =>
    prisma.content.create({ data: { ...data, ownerId, status: 'AVAILABLE' } }),
};
