import { z } from 'zod';

export const createCertificationSchema = z.object({
  projectId: z.string().min(1, 'Site ID is required'),
  certificationType: z.enum([
    'OCCUPANCY_PERMIT', 'FIRE_CLEARANCE', 'HEALTH_PERMIT', 
    'ELEVATOR_CERT', 'ENVIRONMENTAL_CLEARANCE', 'CODE_COMPLIANCE', 'OTHER'
  ]),
  certificationNumber: z.string().optional(),
  issuedDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Valid date is required' }),
  expiryDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Valid expiry date is required' }).optional(),
  issuedBy: z.string().min(1, 'Issuing authority is required'),
  conditions: z.string().optional(),
  documents: z.array(z.string()).optional(),
  status: z.enum(['ACTIVE', 'EXPIRED', 'SUSPENDED', 'REVOKED']).optional(),
});

export const updateCertificationSchema = createCertificationSchema.partial().omit({ projectId: true });

export type CreateCertificationInput = z.infer<typeof createCertificationSchema>;
export type UpdateCertificationInput = z.infer<typeof updateCertificationSchema>;
