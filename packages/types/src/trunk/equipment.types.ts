// ============================================================
// Equipment Types — TRUNK Layer
// ============================================================
export type EquipmentStatus = 'AVAILABLE' | 'IN_USE' | 'UNDER_MAINTENANCE' | 'OUT_OF_SERVICE' | 'RETIRED';

export interface MaintenanceSchedule {
  intervalType: 'CALENDAR_DAYS' | 'ENGINE_HOURS' | 'MILEAGE';
  intervalValue: number;
  lastMaintenanceDate?: Date;
  lastMaintenanceMetric?: number;
}

export interface Equipment {
  _id: string;
  organizationId: string;
  name: string;
  assetTag?: string;
  make?: string;
  model?: string;
  year?: number;
  serialNumber?: string;
  status: EquipmentStatus;
  currentProjectId?: string;
  currentAssigneeId?: string;
  purchaseDate?: Date;
  purchasePriceCents?: number;
  hourlyInternalCostCents?: number;
  maintenanceSchedule?: MaintenanceSchedule;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  createdBy: string;
  industry: string;
  extensions: Record<string, unknown>;
}
