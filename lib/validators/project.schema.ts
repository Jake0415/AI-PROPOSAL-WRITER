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
  'completed',
]);
