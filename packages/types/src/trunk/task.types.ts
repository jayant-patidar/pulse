// ============================================================
// Task Types — TRUNK Layer
// ============================================================
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  _id: string;
  organizationId: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeIds: string[];
  teamId?: string;
  parentTaskId?: string;
  dependencies: string[];
  dueDate?: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  attachments: string[];
  blockedReason?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  createdBy: string;
  industry: string;
  extensions: Record<string, unknown>;
}
