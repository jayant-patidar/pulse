import { z } from 'zod';

export const createChangeOrderSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  coNumber: z.string().min(1, 'CO Number is required'),
  title: z.string().min(1, 'Title is required').max(300),
  description: z.string().max(2000).optional(),
  reasonCode: z.enum(['OWNER_REQUEST', 'DESIGN_CHANGE', 'UNFORESEEN_CONDITION', 'CODE_REQUIREMENT', 'ERROR_OMISSION']),
  costImpactCents: z.number().int(),
  scheduleImpactDays: z.number().int(),
  requestedBy: z.string().min(1, 'Requested By is required'),
});

export const updateChangeOrderSchema = createChangeOrderSchema.partial().omit({ projectId: true }).extend({
  status: z.enum(['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'REVISE', 'APPROVED', 'REJECTED']).optional(),
  approvedBy: z.string().optional(),
});

export type CreateChangeOrderInput = z.infer<typeof createChangeOrderSchema>;
export type UpdateChangeOrderInput = z.infer<typeof updateChangeOrderSchema>;
