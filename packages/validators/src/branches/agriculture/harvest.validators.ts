import { z } from 'zod';

export const createHarvestLogSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  cropCycleId: z.string().optional(),
  harvestDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Valid date is required' }).transform((val) => new Date(val).toISOString()),
  fieldZone: z.string().optional(),
  acresHarvested: z.number().nonnegative(),
  yieldBushelsPerAcre: z.number().nonnegative().optional(),
  moisturePercent: z.number().nonnegative().max(100).optional(),
  grainQualityGrade: z.string().optional(),
  storageLocation: z.string().optional(),
  notes: z.string().optional(),
});

export const updateHarvestLogSchema = createHarvestLogSchema.partial().omit({ projectId: true });

export type CreateHarvestLogInput = z.infer<typeof createHarvestLogSchema>;
export type UpdateHarvestLogInput = z.infer<typeof updateHarvestLogSchema>;
