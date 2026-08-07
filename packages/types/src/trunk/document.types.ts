// ============================================================
// Document Types — TRUNK Layer
// ============================================================
export type ApprovalStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
export type AiProcessingStatus = 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED' | 'SKIPPED';

export interface DocumentMeta {
  gpsCoordinates?: [number, number];
  captureDate?: Date;
  cameraMake?: string;
}

export interface DocumentEntity {
  _id: string;
  organizationId: string;
  projectId?: string;
  name: string;
  originalFilename: string;
  fileType: string;
  sizeBytes: number;
  s3Key: string;
  version: number;
  parentDocumentId?: string;
  isLatest: boolean;
  folderId?: string;
  tags: string[];
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
  metadata?: DocumentMeta;
  aiStatus: AiProcessingStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  createdBy: string;
  industry: string;
  extensions: Record<string, unknown>;
}
