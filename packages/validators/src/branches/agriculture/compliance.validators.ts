import { z } from 'zod';

export const createAgrComplianceSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  complianceType: z.enum(['ORGANIC_CERTIFICATION', 'EPA_REPORT', 'WATER_USE_PERMIT', 'SOIL_CONSERVATION_PLAN', 'CROP_INSURANCE', 'OTHER']),
  issuingAuthority: z.string().min(1, 'Issuing Authority is required'),
  certificationNumber: z.string().optional(),
  effectiveDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Valid date is required' }).transform((val) => new Date(val).toISOString()),
  expiryDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Valid date is required' }).transform((val) => new Date(val).toISOString()).optional(),
  status: z.enum(['ACTIVE', 'EXPIRED', 'PENDING_RENEWAL', 'SUSPENDED']).optional(),
  notes: z.string().optional(),
});

export const updateAgrComplianceSchema = createAgrComplianceSchema.partial().omit({ projectId: true });

export type CreateAgrComplianceInput = z.infer<typeof createAgrComplianceSchema>;
export type UpdateAgrComplianceInput = z.infer<typeof updateAgrComplianceSchema>;
