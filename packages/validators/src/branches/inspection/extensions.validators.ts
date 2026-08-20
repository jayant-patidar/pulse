import { z } from 'zod';

// ============================================================
// Inspection Services Extension Validators — BRANCH Layer
// ============================================================
// Validates the `extensions` subdocument when industry = INSPECTION_SERVICES.
// ============================================================

export const insProjectExtensionsSchema = z.object({
  propertyType: z.enum(['COMMERCIAL', 'RESIDENTIAL', 'INDUSTRIAL', 'GOVERNMENT', 'MIXED_USE']).optional(),
  jurisdictionCode: z.string().optional(),
  licensedSquareFootage: z.number().nonnegative().optional(),
  yearBuilt: z.number().int().min(1800).max(2100).optional(),
  occupancyType: z.string().optional(),
  zoningClassification: z.string().optional(),
  lastInspectionDate: z.string().optional(),
}).passthrough();

export const insReportExtensionsSchema = z.object({
  inspectionCount: z.number().int().nonnegative().optional(),
  findingsCount: z.number().int().nonnegative().optional(),
  passRate: z.number().nonnegative().max(100).optional(),
  weatherConditions: z.string().optional(),
  accessIssues: z.string().optional(),
}).passthrough();

export const insTaskExtensionsSchema = z.object({
  assignmentType: z.enum(['ROUTINE', 'FOLLOW_UP', 'COMPLAINT', 'EMERGENCY', 'PERMIT_REVIEW']).optional(),
  inspectorCertLevel: z.string().optional(),
  jurisdictionRef: z.string().optional(),
  estimatedDurationMinutes: z.number().int().nonnegative().optional(),
}).passthrough();

export const insEquipmentExtensionsSchema = z.object({
  instrumentType: z.enum(['THERMAL_CAMERA', 'MOISTURE_METER', 'GAS_DETECTOR', 'LOAD_TESTER', 'MANOMETER', 'MULTIMETER', 'OTHER']).optional(),
  calibrationDate: z.string().optional(),
  calibrationDueDate: z.string().optional(),
  certificationNumber: z.string().optional(),
  accuracyRating: z.string().optional(),
}).passthrough();

export type InsProjectExtensions = z.infer<typeof insProjectExtensionsSchema>;
export type InsReportExtensions = z.infer<typeof insReportExtensionsSchema>;
export type InsTaskExtensions = z.infer<typeof insTaskExtensionsSchema>;
export type InsEquipmentExtensions = z.infer<typeof insEquipmentExtensionsSchema>;
