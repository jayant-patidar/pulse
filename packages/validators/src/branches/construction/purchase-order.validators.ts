import { z } from 'zod';

export const createPurchaseOrderSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  poNumber: z.string().min(1, 'PO Number is required'),
  supplierName: z.string().min(1, 'Supplier Name is required').max(200),
  supplierContact: z.string().max(200).optional(),
  totalAmountCents: z.number().int().nonnegative(),
  deliveryDateExpected: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid datetime').transform((val) => new Date(val).toISOString()).optional(),
  deliveryLocation: z.string().max(300).optional(),
  paymentTerms: z.string().max(200).optional(),
  lineItems: z.array(z.any()).default([]),
});

export const updatePurchaseOrderSchema = createPurchaseOrderSchema.partial().omit({ projectId: true }).extend({
  status: z.enum(['DRAFT', 'ISSUED', 'ACKNOWLEDGED', 'PARTIALLY_DELIVERED', 'DELIVERED', 'CANCELLED']).optional(),
});

export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>;
export type UpdatePurchaseOrderInput = z.infer<typeof updatePurchaseOrderSchema>;
