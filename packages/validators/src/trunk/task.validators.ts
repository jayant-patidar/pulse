import { z } from 'zod';

// ============================================================
// Task Validators — TRUNK Layer
// ============================================================

export const createTaskSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  title: z.string().min(1, 'Task title is required').max(300),
  description: z.string().max(10000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  assigneeIds: z.array(z.string()).optional().default([]),
  teamId: z.string().optional(),
  parentTaskId: z.string().optional(),
  dependencies: z.array(z.string()).optional().default([]),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid datetime').transform((val) => new Date(val).toISOString()).optional(),
  estimatedHours: z.number().nonnegative().optional(),
  tags: z.array(z.string()).optional().default([]),
  extensions: z.record(z.unknown()).optional(),
});

export const updateTaskSchema = createTaskSchema.partial().omit({ projectId: true }).extend({
  status: z.enum(['TODO', 'IN_PROGRESS', 'BLOCKED', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
  actualStartDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid datetime').transform((val) => new Date(val).toISOString()).optional(),
  actualEndDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid datetime').transform((val) => new Date(val).toISOString()).optional(),
  actualHours: z.number().nonnegative().optional(),
  blockedReason: z.string().max(2000).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
