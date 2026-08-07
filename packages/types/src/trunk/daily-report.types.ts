// ============================================================
// Daily Report Types — TRUNK Layer
// ============================================================
export type ReportStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED';

export interface ReportWeather {
  condition?: string;
  temperatureF?: number;
  windMph?: number;
  precipitationInches?: number;
}

export interface ReportIssue {
  category: 'DELAY' | 'SAFETY' | 'QUALITY' | 'MATERIAL' | 'EQUIPMENT';
  description: string;
  impactLevel?: string;
}

export interface ReportDelay {
  cause: string;
  hoursLost: number;
  description?: string;
}

export interface DailyReport {
  _id: string;
  organizationId: string;
  projectId: string;
  date: Date;
  status: ReportStatus;
  weather?: ReportWeather;
  totalWorkerCount?: number;
  totalHoursWorked?: number;
  activitiesDescription?: string;
  issues: ReportIssue[];
  delays: ReportDelay[];
  photos: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  createdBy: string;
  approvedBy?: string;
  industry: string;
  extensions: Record<string, unknown>;
}
