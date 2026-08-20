import { z } from 'zod';

// ============================================================
// Equipment Validators — TRUNK Layer
// ============================================================

const maintenanceScheduleSchema = z.object({
  intervalType: z.enum(['CALENDAR_DAYS', 'ENGINE_HOURS', 'MILEAGE']),
  intervalValue: z.number().positive(),
  lastMaintenanceDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid datetime').transform((val) => new Date(val).toISOString()).optional(),
  lastMaintenanceMetric: z.number().nonnegative().optional(),
}).optional();

export const createEquipmentSchema = z.object({
  name: z.string().min(1, 'Equipment name is required').max(200),
  assetTag: z.string().max(100).optional(),
  make: z.string().max(100).optional(),
  modelName: z.string().max(100).optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  serialNumber: z.string().max(200).optional(),
  purchaseDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid datetime').transform((val) => new Date(val).toISOString()).optional(),
  purchasePriceCents: z.number().int().nonnegative().optional(),
  hourlyInternalCostCents: z.number().int().nonnegative().optional(),
  maintenanceSchedule: maintenanceScheduleSchema,
  extensions: z.record(z.unknown()).optional(),
});

export const updateEquipmentSchema = createEquipmentSchema.partial().extend({
  status: z.enum(['AVAILABLE', 'IN_USE', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE', 'RETIRED']).optional(),
});

export type CreateEquipmentInput = z.infer<typeof createEquipmentSchema>;
export type UpdateEquipmentInput = z.infer<typeof updateEquipmentSchema>;
