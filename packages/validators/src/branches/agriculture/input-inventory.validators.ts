import { z } from 'zod';

export const createInputInventorySchema = z.object({
  inputType: z.enum(['SEED', 'FERTILIZER', 'HERBICIDE', 'INSECTICIDE', 'FUNGICIDE', 'FUEL', 'OTHER']),
  productName: z.string().min(1, 'Product Name is required'),
  manufacturer: z.string().optional(),
  quantityOnHand: z.number().nonnegative(),
  unit: z.string().min(1, 'Unit is required'),
  costPerUnitCents: z.number().nonnegative().optional(),
  expirationDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Valid date is required' }).transform((val) => new Date(val).toISOString()).optional(),
  epaRegistrationNumber: z.string().optional(),
  status: z.enum(['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK']).optional(),
  notes: z.string().optional(),
});

export const updateInputInventorySchema = createInputInventorySchema.partial();

export type CreateInputInventoryInput = z.infer<typeof createInputInventorySchema>;
export type UpdateInputInventoryInput = z.infer<typeof updateInputInventorySchema>;
