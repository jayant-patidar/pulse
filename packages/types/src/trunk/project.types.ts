// ============================================================
// Project Types — TRUNK Layer
// ============================================================
// Core work organization entity. Extensions are validated
// dynamically by the active Branch plugin.
// See: Doc 05 §5.1
// ============================================================

export type ProjectStatus = 'DRAFT' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';

export interface ProjectLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export interface Project {
  _id: string;
  organizationId: string;
  name: string;
  description?: string;
  status: ProjectStatus;

  location?: ProjectLocation;

  // Schedule
  startDate?: Date;
  targetEndDate?: Date;
  actualEndDate?: Date;

  // Financials (stored in cents)
  budget?: number;
  committedCost?: number;
  actualCost?: number;

  // Team & Client
  clientId?: string;
  managerIds: string[];

  // Audit
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  createdBy: string;
  industry: string;

  // 🌿 Branch-specific data (validated dynamically)
  extensions: Record<string, unknown>;
}

export type CreateProjectPayload = Pick<Project, 'name' | 'description' | 'startDate' | 'targetEndDate' | 'budget'> & {
  location?: Partial<ProjectLocation>;
  managerIds?: string[];
  extensions?: Record<string, unknown>;
};

export type UpdateProjectPayload = Partial<CreateProjectPayload> & {
  status?: ProjectStatus;
};
