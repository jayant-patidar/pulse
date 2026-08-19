import { z } from 'zod';

// ============================================================
// Project Validators — TRUNK Layer
// ============================================================
// These validate the CORE (trunk) fields only.
// Branch-specific `extensions` are validated by the Branch plugin.
// ============================================================

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(200),
  description: z.string().max(5000).optional(),
  startDate: z.string().datetime().optional(),
  targetEndDate: z.string().datetime().optional(),
  budget: z.number().int().nonnegative().optional(),
  location: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    coordinates: z.tuple([z.number(), z.number()]).optional(),
  }).optional(),
  managerIds: z.array(z.string()).optional(),
  industry: z.enum(['CONSTRUCTION', 'AGRICULTURE', 'ENERGY', 'MAINTENANCE', 'GOVERNMENT', 'INSPECTION']).default('CONSTRUCTION'),
  extensions: z.record(z.unknown()).optional(),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  status: z.enum(['DRAFT', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED']).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
