import { z } from 'zod';

// ============================================================
// Document Validators — TRUNK Layer
// ============================================================

export const createDocumentSchema = z.object({
  projectId: z.string().optional(),
  name: z.string().min(1, 'Document name is required').max(500),
  originalFilename: z.string().min(1).max(500),
  fileType: z.string().min(1).max(200),
  sizeBytes: z.number().int().nonnegative(),
  folderId: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  metadata: z.object({
    gpsCoordinates: z.tuple([z.number(), z.number()]).optional(),
    captureDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid datetime').transform((val) => new Date(val).toISOString()).optional(),
    cameraMake: z.string().max(200).optional(),
  }).optional(),
  extensions: z.record(z.unknown()).optional(),
});

export const updateDocumentSchema = z.object({
  name: z.string().min(1).max(500).optional(),
  folderId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  extensions: z.record(z.unknown()).optional(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
