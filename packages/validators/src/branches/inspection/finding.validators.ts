import { z } from 'zod';

export const createFindingSchema = z.object({
  inspectionId: z.string().min(1, 'Inspection ID is required'),
  projectId: z.string().min(1, 'Site ID is required'),
  findingType: z.enum(['VIOLATION', 'DEFICIENCY', 'OBSERVATION', 'RECOMMENDATION']),
  severity: z.enum(['CRITICAL', 'MAJOR', 'MINOR', 'INFO']),
  codeReference: z.string().optional(),
  location: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  photosRequired: z.boolean().optional(),
  photos: z.array(z.string()).optional(),
  status: z.enum(['OPEN', 'IN_REMEDIATION', 'REINSPECTION_NEEDED', 'RESOLVED', 'WAIVED']).optional(),
});

export const updateFindingSchema = createFindingSchema.partial().omit({ inspectionId: true, projectId: true });

export type CreateFindingInput = z.infer<typeof createFindingSchema>;
export type UpdateFindingInput = z.infer<typeof updateFindingSchema>;
