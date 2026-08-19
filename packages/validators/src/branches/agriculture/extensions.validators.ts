import { z } from 'zod';

export const agrProjectExtensionsSchema = z.object({
  cropType: z.string().optional(),
  fieldSizeAcres: z.number().nonnegative().optional(),
  soilType: z.string().optional(),
  growingSeason: z.string().optional(),
  irrigationMethod: z.enum(['DRIP', 'SPRINKLER', 'FLOOD', 'DRYLAND', 'OTHER']).optional(),
}).passthrough();

export const agrReportExtensionsSchema = z.object({
  soilMoisturePercent: z.number().nonnegative().max(100).optional(),
  precipitationInches: z.number().nonnegative().optional(),
  growthStageObserved: z.string().optional(),
  pestPressureLevel: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
}).passthrough();

export const agrTaskExtensionsSchema = z.object({
  activityType: z.enum(['PLANTING', 'IRRIGATING', 'SPRAYING', 'HARVESTING', 'TILLING', 'SCOUTING', 'OTHER']).optional(),
  applicationRate: z.string().optional(),
  fieldZone: z.string().optional(),
}).passthrough();

export const agrEquipmentExtensionsSchema = z.object({
  equipmentClass: z.enum(['TRACTOR', 'HARVESTER', 'SPRAYER', 'IRRIGATION_SYSTEM', 'IMPLEMENT', 'OTHER']).optional(),
  implementAttached: z.string().optional(),
  gpsGuidanceEnabled: z.boolean().optional(),
}).passthrough();

export type AgrProjectExtensions = z.infer<typeof agrProjectExtensionsSchema>;
export type AgrReportExtensions = z.infer<typeof agrReportExtensionsSchema>;
export type AgrTaskExtensions = z.infer<typeof agrTaskExtensionsSchema>;
export type AgrEquipmentExtensions = z.infer<typeof agrEquipmentExtensionsSchema>;
