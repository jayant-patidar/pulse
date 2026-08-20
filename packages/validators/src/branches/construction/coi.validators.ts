import { z } from 'zod';

export const createCoiSchema = z.object({
  subcontractorName: z.string().max(200).optional(),
  policyType: z.enum(['GENERAL_LIABILITY', 'WORKERS_COMP', 'AUTO', 'UMBRELLA', 'PROFESSIONAL']),
  carrierName: z.string().min(1, 'Carrier Name is required').max(200),
  policyNumber: z.string().min(1, 'Policy Number is required').max(100),
  perOccurrenceLimitCents: z.number().int().nonnegative().optional(),
  aggregateLimitCents: z.number().int().nonnegative().optional(),
  effectiveDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Valid date is required').transform((val) => new Date(val).toISOString()),
  expiryDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Valid date is required').transform((val) => new Date(val).toISOString()),
});

export const updateCoiSchema = createCoiSchema.partial().extend({
  status: z.enum(['COMPLIANT', 'EXPIRING_SOON', 'EXPIRED', 'REJECTED']).optional(),
  verifiedBy: z.string().optional(),
});

export type CreateCoiInput = z.infer<typeof createCoiSchema>;
export type UpdateCoiInput = z.infer<typeof updateCoiSchema>;
