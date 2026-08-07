import { z } from 'zod';

// ============================================================
// Daily Report Validators — TRUNK Layer
// ============================================================

const weatherSchema = z.object({
  condition: z.string().max(100).optional(),
  temperatureF: z.number().optional(),
  windMph: z.number().nonnegative().optional(),
  precipitationInches: z.number().nonnegative().optional(),
}).optional();

const issueSchema = z.object({
  category: z.enum(['DELAY', 'SAFETY', 'QUALITY', 'MATERIAL', 'EQUIPMENT']),
  description: z.string().min(1).max(5000),
  impactLevel: z.string().max(50).optional(),
});

const delaySchema = z.object({
  cause: z.string().min(1).max(500),
  hoursLost: z.number().nonnegative(),
  description: z.string().max(2000).optional(),
});

export const createDailyReportSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  date: z.string().datetime({ message: 'Valid date is required' }),
  weather: weatherSchema,
  totalWorkerCount: z.number().int().nonnegative().optional(),
  totalHoursWorked: z.number().nonnegative().optional(),
  activitiesDescription: z.string().max(20000).optional(),
  issues: z.array(issueSchema).optional().default([]),
  delays: z.array(delaySchema).optional().default([]),
  notes: z.string().max(10000).optional(),
  extensions: z.record(z.unknown()).optional(),
});

export const updateDailyReportSchema = createDailyReportSchema.partial().omit({ projectId: true });

export type CreateDailyReportInput = z.infer<typeof createDailyReportSchema>;
export type UpdateDailyReportInput = z.infer<typeof updateDailyReportSchema>;
