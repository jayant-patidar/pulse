import { z } from 'zod';

// ============================================================
// Construction Extension Validators — BRANCH Layer
// ============================================================
// Validates the `extensions` subdocument when industry = CONSTRUCTION.
// Called by the ConstructionProjectPlugin at runtime.
// ============================================================

export const conProjectExtensionsSchema = z.object({
  phases: z.array(z.object({
    name: z.string().min(1),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid datetime').transform((val) => new Date(val).toISOString()).optional(),
    endDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid datetime').transform((val) => new Date(val).toISOString()).optional(),
    status: z.string().optional(),
  })).optional(),
  buildingType: z.enum(['COMMERCIAL', 'RESIDENTIAL', 'INDUSTRIAL', 'INFRASTRUCTURE']).optional(),
  contractType: z.enum(['LUMP_SUM', 'GMP', 'COST_PLUS', 'UNIT_PRICE']).optional(),
  totalAreaSqFt: z.number().nonnegative().optional(),
  floors: z.number().int().nonnegative().optional(),
  permitNumber: z.string().optional(),
  permitStatus: z.string().optional(),
  tradesInvolved: z.array(z.string()).optional(),
}).passthrough(); // Allow future construction-specific fields gracefully

export const conReportExtensionsSchema = z.object({
  concretePouredVolumeYd3: z.number().nonnegative().optional(),
  steelInstalledTons: z.number().nonnegative().optional(),
  craneHours: z.number().nonnegative().optional(),
  tradeBreakdown: z.array(z.object({
    trade: z.string(),
    workerCount: z.number().int().nonnegative(),
    hours: z.number().nonnegative(),
  })).optional(),
  deliveries: z.array(z.object({
    material: z.string(),
    quantity: z.number(),
    supplier: z.string(),
    accepted: z.boolean(),
  })).optional(),
}).passthrough();

export const conTaskExtensionsSchema = z.object({
  taskType: z.enum(['RFI', 'SUBMITTAL', 'PUNCH_LIST', 'STANDARD', 'INSPECTION']).optional(),
  rfiNumber: z.string().optional(),
  specSection: z.string().optional(),
  drawingReference: z.string().optional(),
  responseRequiredBy: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid datetime').transform((val) => new Date(val).toISOString()).optional(),
  rfiResponse: z.string().optional(),
  locationOnSite: z.string().optional(),
  tradeResponsible: z.string().optional(),
  deficiencyType: z.string().optional(),
}).passthrough();

export const conEquipmentExtensionsSchema = z.object({
  equipmentClass: z.enum(['HEAVY', 'VEHICLE', 'POWER_TOOL', 'LIFT']).optional(),
  loadCapacity: z.string().optional(),
  requiresCertifiedOperator: z.boolean().optional(),
  fuelType: z.string().optional(),
  rentalDetails: z.object({
    isRented: z.boolean(),
    vendor: z.string().optional(),
    dailyRateCents: z.number().nonnegative().optional(),
    rentalEndDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid datetime').transform((val) => new Date(val).toISOString()).optional(),
  }).optional(),
}).passthrough();

export type ConProjectExtensions = z.infer<typeof conProjectExtensionsSchema>;
export type ConReportExtensions = z.infer<typeof conReportExtensionsSchema>;
export type ConTaskExtensions = z.infer<typeof conTaskExtensionsSchema>;
export type ConEquipmentExtensions = z.infer<typeof conEquipmentExtensionsSchema>;
