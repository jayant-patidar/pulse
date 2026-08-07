// ============================================================
// Safety Incident Types — BRANCH Layer (Construction)
// ============================================================
export type IncidentType = 'INJURY' | 'NEAR_MISS' | 'PROPERTY_DAMAGE' | 'ENVIRONMENTAL' | 'EQUIPMENT_FAILURE';
export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'OPEN' | 'UNDER_INVESTIGATION' | 'CLOSED';

export interface InvolvedParty {
  userId?: string;
  externalName?: string;
  role?: string;
}

export interface InjuryDetails {
  bodyPartAffected?: string;
  injuryType?: string;
  wasHospitalized?: boolean;
  daysAwayFromWork?: number;
  daysRestrictedTransfer?: number;
}

export interface SafetyIncident {
  _id: string;
  organizationId: string;
  projectId: string;
  incidentType: IncidentType;
  severity: IncidentSeverity;
  dateOccurred: Date;
  timeOccurred?: string;
  locationOnSite?: string;
  description: string;
  immediateActionsTaken?: string;
  involvedParties: InvolvedParty[];
  witnesses: Array<{ name: string; contactInfo?: string; statement?: string }>;
  photos: string[];
  oshaRecordable?: boolean;
  injuryDetails?: InjuryDetails;
  rootCauseAnalysis?: string;
  preventativeActions?: string;
  investigatedBy?: string;
  status: IncidentStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
