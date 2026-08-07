// ============================================================
// Construction Extensions Types — BRANCH Layer
// ============================================================
// Defines the shape of the `extensions` subdocument for each
// Trunk entity when the organization's industry is CONSTRUCTION.
// ============================================================

export interface ConstructionProjectExtensions {
  phases?: Array<{ name: string; startDate?: Date; endDate?: Date; status?: string }>;
  buildingType?: 'COMMERCIAL' | 'RESIDENTIAL' | 'INDUSTRIAL' | 'INFRASTRUCTURE';
  contractType?: 'LUMP_SUM' | 'GMP' | 'COST_PLUS' | 'UNIT_PRICE';
  totalAreaSqFt?: number;
  floors?: number;
  permitNumber?: string;
  permitStatus?: string;
  architect?: { name?: string; firm?: string; contact?: string };
  engineer?: { name?: string; firm?: string; contact?: string };
  tradesInvolved?: string[];
}

export type ConstructionTaskType = 'RFI' | 'SUBMITTAL' | 'PUNCH_LIST' | 'STANDARD' | 'INSPECTION';

export interface ConstructionTaskExtensions {
  taskType?: ConstructionTaskType;
  rfiNumber?: string;
  specSection?: string;
  drawingReference?: string;
  responseRequiredBy?: Date;
  rfiResponse?: string;
  locationOnSite?: string;
  tradeResponsible?: string;
  deficiencyType?: string;
}

export interface ConstructionReportExtensions {
  concretePouredVolumeYd3?: number;
  steelInstalledTons?: number;
  craneHours?: number;
  tradeBreakdown?: Array<{ trade: string; workerCount: number; hours: number }>;
  deliveries?: Array<{ material: string; quantity: number; supplier: string; accepted: boolean }>;
  visitors?: Array<{ name: string; company: string; purpose: string; timeIn?: string; timeOut?: string }>;
  safetyToolboxTalk?: { topic: string; attendeesCount: number; conductedBy: string };
}

export type ConstructionDocType = 'BLUEPRINT' | 'SPECIFICATION' | 'CONTRACT' | 'PERMIT' | 'PHOTO' | 'RFI_RESPONSE' | 'SUBMITTAL';
export type BlueprintDiscipline = 'ARCHITECTURAL' | 'STRUCTURAL' | 'MECHANICAL' | 'ELECTRICAL' | 'PLUMBING' | 'CIVIL';

export interface ConstructionDocumentExtensions {
  docType?: ConstructionDocType;
  drawingNumber?: string;
  revisionDate?: Date;
  discipline?: BlueprintDiscipline;
  specSection?: string;
  submittalStatus?: string;
}

export type ConstructionEquipmentClass = 'HEAVY' | 'VEHICLE' | 'POWER_TOOL' | 'LIFT';

export interface ConstructionEquipmentExtensions {
  equipmentClass?: ConstructionEquipmentClass;
  loadCapacity?: string;
  requiresCertifiedOperator?: boolean;
  fuelType?: string;
  rentalDetails?: {
    isRented: boolean;
    vendor?: string;
    dailyRateCents?: number;
    rentalEndDate?: Date;
  };
}
