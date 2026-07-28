import { z } from 'zod';

export const contentTypes = ['IMAGE', 'VIDEO', 'TEXT'] as const;
export const alertStatuses = ['NEW', 'REVIEWING', 'DISMISSED', 'CONFIRMED'] as const;
export const signupSchema = z.object({ email: z.string().email().max(254), password: z.string().min(12).max(128), name: z.string().min(2).max(80) });
export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1).max(128) });

const contentBaseSchema = z.object({
  title: z.string().trim().min(1).max(140),
  description: z.string().trim().max(2000).optional(),
  type: z.enum(contentTypes),
  textBody: z.string().max(50000).optional(),
});

export const contentCreateSchema = contentBaseSchema.superRefine((value, ctx) => {
  if (value.type === 'TEXT' && !value.textBody) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Text content requires textBody', path: ['textBody'] });
  }
});

export const contentUpdateSchema = contentBaseSchema.omit({ type: true }).partial();
export const paginationSchema = z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20), search: z.string().max(140).optional() });
export const alertUpdateSchema = z.object({ status: z.enum(alertStatuses) });
export const contentUploadSchema = z.object({
  title: z.string().trim().min(1).max(140),
  description: z.string().trim().max(2000).optional(),
  type: z.enum(['IMAGE', 'VIDEO']),
});
export type ContentType = z.infer<typeof contentBaseSchema>['type'];
export type ApiSuccess<T> = { success: true; data: T; meta?: Record<string, unknown> };
export type ApiFailure = { success: false; error: { code: string; message: string; details?: unknown } };
