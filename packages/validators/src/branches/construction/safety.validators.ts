import { z } from 'zod';

export const createSafetyIncidentSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  incidentType: z.enum(['INJURY', 'NEAR_MISS', 'PROPERTY_DAMAGE', 'ENVIRONMENTAL', 'EQUIPMENT_FAILURE']),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  dateOccurred: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Valid date is required' }),
  timeOccurred: z.string().optional(),
  locationOnSite: z.string().optional(),
  description: z.string().min(1, 'Description is required').max(5000),
  immediateActionsTaken: z.string().max(2000).optional(),
  oshaRecordable: z.boolean().optional(),
});

export const updateSafetyIncidentSchema = createSafetyIncidentSchema.partial().omit({ projectId: true }).extend({
  status: z.enum(['OPEN', 'UNDER_INVESTIGATION', 'CLOSED']).optional(),
  rootCauseAnalysis: z.string().max(2000).optional(),
  preventativeActions: z.string().max(2000).optional(),
});

export type CreateSafetyIncidentInput = z.infer<typeof createSafetyIncidentSchema>;
export type UpdateSafetyIncidentInput = z.infer<typeof updateSafetyIncidentSchema>;
