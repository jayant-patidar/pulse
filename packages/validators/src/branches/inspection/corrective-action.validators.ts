import { z } from 'zod';

export const createCorrectiveActionSchema = z.object({
  findingId: z.string().min(1, 'Finding ID is required'),
  inspectionId: z.string().min(1, 'Inspection ID is required'),
  projectId: z.string().min(1, 'Site ID is required'),
  assignedTo: z.string().optional(),
  description: z.string().min(1, 'Description of action is required'),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Valid deadline is required' }),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'WAIVED']).optional(),
  resolutionNotes: z.string().optional(),
  verifiedDate: z.string().optional(),
  verifiedBy: z.string().optional(),
});

export const updateCorrectiveActionSchema = createCorrectiveActionSchema.partial().omit({ findingId: true, inspectionId: true, projectId: true });

export type CreateCorrectiveActionInput = z.infer<typeof createCorrectiveActionSchema>;
export type UpdateCorrectiveActionInput = z.infer<typeof updateCorrectiveActionSchema>;
