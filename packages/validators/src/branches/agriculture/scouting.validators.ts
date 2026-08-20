import { z } from 'zod';

export const createScoutingReportSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  cropCycleId: z.string().optional(),
  scoutDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Valid date is required' }).transform((val) => new Date(val).toISOString()),
  fieldZone: z.string().optional(),
  observationType: z.enum(['PEST', 'DISEASE', 'WEED', 'NUTRIENT_DEFICIENCY', 'WEATHER_DAMAGE']),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  description: z.string().min(1, 'Description is required'),
  recommendation: z.string().optional(),
  photos: z.array(z.string()).optional(),
  status: z.enum(['OPEN', 'TREATED', 'RESOLVED']).optional(),
});

export const updateScoutingReportSchema = createScoutingReportSchema.partial().omit({ projectId: true });

export type CreateScoutingReportInput = z.infer<typeof createScoutingReportSchema>;
export type UpdateScoutingReportInput = z.infer<typeof updateScoutingReportSchema>;
