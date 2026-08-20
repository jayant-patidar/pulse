import { z } from 'zod';

export const createInspectionSchema = z.object({
  projectId: z.string().min(1, 'Site ID is required'),
  inspectionType: z.enum([
    'STRUCTURAL', 'ELECTRICAL', 'PLUMBING', 'FIRE_SAFETY',
    'ENVIRONMENTAL', 'ELEVATOR', 'HEALTH', 'CODE_ENFORCEMENT',
  ]),
  scheduledDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Valid date is required' }).transform((val) => new Date(val).toISOString()),
  scope: z.string().optional(),
  inspectorNotes: z.string().optional(),
  checklistId: z.string().optional(),
  overallResult: z.enum(['PASS', 'FAIL', 'CONDITIONAL', 'PENDING']).optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
});

export const updateInspectionSchema = createInspectionSchema.partial().omit({ projectId: true });

export type CreateInspectionInput = z.infer<typeof createInspectionSchema>;
export type UpdateInspectionInput = z.infer<typeof updateInspectionSchema>;
