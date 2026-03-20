import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z
    .string()
    .min(1, '프로젝트 제목을 입력해주세요')
    .max(200, '프로젝트 제목은 200자 이내로 입력해주세요'),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const projectStatusSchema = z.enum([
  'uploaded',
  'analyzing',
  'direction_set',
  'strategy_set',
  'outline_ready',
  'generating',
  'sections_ready',
  'reviewing',
  'completed',
]);

export const projectFilterSchema = z.object({
  status: projectStatusSchema.optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ProjectFilterInput = z.infer<typeof projectFilterSchema>;
