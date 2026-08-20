import { z } from 'zod';

export const createCropCycleSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  fieldName: z.string().min(1, 'Field Name is required'),
  cropType: z.string().min(1, 'Crop Type is required'),
  variety: z.string().optional(),
  plantingDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Valid date is required' }).transform((val) => new Date(val).toISOString()),
  expectedHarvestDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Valid date is required' }).transform((val) => new Date(val).toISOString()).optional(),
  acreage: z.number().nonnegative().optional(),
  seedRatePerAcre: z.number().nonnegative().optional(),
  rowSpacingInches: z.number().nonnegative().optional(),
  status: z.enum(['PLANNED', 'PLANTED', 'GROWING', 'HARVESTING', 'COMPLETED', 'ABANDONED']).optional(),
});

export const updateCropCycleSchema = createCropCycleSchema.partial().omit({ projectId: true });

export type CreateCropCycleInput = z.infer<typeof createCropCycleSchema>;
export type UpdateCropCycleInput = z.infer<typeof updateCropCycleSchema>;
