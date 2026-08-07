# Doc 05 — Database Design

**Document ID:** PULSE-DOC-05
**Version:** 1.0
**Status:** Draft
**Last Updated:** August 3, 2026
**Author:** Pulse Engineering Team
**Depends On:** [Doc 01 (PRD)](./01_Product_Requirements_Document.md), [Doc 04 (Architecture)](./04_System_Architecture.md)

---

## Table of Contents

1. [Database Strategy](#1-database-strategy)
2. [Collection Architecture (Root, Trunk, Branch)](#2-collection-architecture-root-trunk-branch)
3. [The Extensions Pattern (Schema Design)](#3-the-extensions-pattern-schema-design)
4. [ROOT Schema Definitions](#4-root-schema-definitions)
5. [TRUNK Schema Definitions](#5-trunk-schema-definitions)
6. [BRANCH Schema Definitions (Construction)](#6-branch-schema-definitions-construction)
7. [Indexing Strategy](#7-indexing-strategy)
8. [Audit & Soft Delete Strategy](#8-audit--soft-delete-strategy)

---

## 1. Database Strategy

Pulse utilizes **MongoDB Atlas** as its primary operational database. 

### Why MongoDB?
1. **The Extensions Pattern:** MongoDB's document model perfectly handles the Tree Architecture's requirement to store variable, industry-specific data inside a generic trunk entity (the `extensions` subdocument).
2. **Schema Flexibility:** Field operations workflows change frequently; MongoDB allows rapid iteration without expensive schema migrations.
3. **Vector Search:** Native integration via Atlas Vector Search eliminates the need for a separate vector database (like Pinecone) for our AI features.
4. **Change Streams:** Native support for real-time WebSockets and asynchronous event triggering.

---

## 2. Collection Architecture (Root, Trunk, Branch)

Our collections mirror the Tree Architecture.

| Layer | Collection Name | Purpose |
|---|---|---|
| **Root** | `users` | Global identity, auth, MFA. |
| **Root** | `organizations` | Multi-tenant workspaces, billing, settings. |
| **Root** | `memberships` | Maps users to orgs + roles + teams. |
| **Root** | `audit_logs` | Immutable system change history. |
| **Trunk** | `projects` | Core project metadata + extensions. |
| **Trunk** | `tasks` | Work assignments + extensions. |
| **Trunk** | `daily_reports` | Field logs + extensions. |
| **Trunk** | `documents` | File metadata, versions, vectors. |
| **Trunk** | `equipment` | Asset tracking + extensions. |
| **Branch** | `con_safety_incidents` | *Construction only:* OSHA safety tracking. |
| **Branch** | `con_change_orders` | *Construction only:* Contract modifications. |
| **Branch** | `con_coi` | *Construction only:* Subcontractor insurance. |
| **Branch** | `con_purchase_orders` | *Construction only:* Material procurement. |

> [!NOTE]
> All Branch-specific collections MUST be prefixed with an industry identifier (e.g., `con_` for construction, `agr_` for agriculture) to prevent naming collisions as the platform grows.

---

## 3. The Extensions Pattern (Schema Design)

The core mechanism for extending Trunk collections without modifying them.

### 3.1 Base Entity Schema
Every Trunk collection inherits from this Base Entity:

```typescript
{
  _id: ObjectId,
  organizationId: ObjectId, // CRITICAL: Multi-tenant isolation
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date | null,   // Soft delete
  createdBy: ObjectId,
  
  // ... Core Trunk Fields ...

  // The Discriminator Field (derived from Organization)
  industry: String, // e.g., "CONSTRUCTION"

  // The Flexible Subdocument
  extensions: Object
}
```

### 3.2 Polymorphic Validation
The backend ODM (Mongoose) validates the Trunk fields normally. Before saving, it checks the `industry` field and passes the `extensions` object to the corresponding Branch plugin for strict validation (e.g., Zod schema). **The database stores it as unstructured JSON, but the API enforces strict schemas.**

---

## 4. ROOT Schema Definitions

These collections exist in the Root layer and manage the foundation of the platform: identity, multi-tenancy, and access control.

### 4.1 `users`
**Purpose:** Global identity. A user exists exactly once across the whole system.
```typescript
{
  _id: ObjectId,
  email: { type: String, unique: true, index: true },
  passwordHash: String,
  firstName: String,
  lastName: String,
  phone: String,
  avatarUrl: String,
  
  // Auth & Security
  isVerified: Boolean,
  verificationToken: String,
  verificationExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  twoFactorEnabled: Boolean,
  twoFactorSecret: String,
  backupCodes: [String],
  
  // OAuth Linking
  oauth: {
    googleId: String,
    microsoftId: String,
    appleId: String
  },

  // Audit
  lastLoginAt: Date,
  lastActiveAt: Date,
  loginCount: Number,
  acceptedTermsVersion: String,
  
  createdAt: Date,
  updatedAt: Date
  // Note: NO organizationId here - Users span organizations
}
```

### 4.2 `organizations`
**Purpose:** The Tenant. Represents a paying customer.
```typescript
{
  _id: ObjectId,
  name: String,
  slug: { type: String, unique: true, index: true },
  industry: { type: String, enum: ["CONSTRUCTION", "AGRICULTURE", "ENERGY", "HVAC"], required: true },
  
  // Profile & Branding
  logoUrl: String,
  contactEmail: String,
  contactPhone: String,
  website: String,
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
  },
  
  // Settings
  timezone: { type: String, default: "UTC" },
  currency: { type: String, default: "USD" },
  settings: {
    defaultDateFormat: { type: String, default: "MM/DD/YYYY" },
    fiscalYearStartMonth: { type: Number, default: 1 },
    requireApprovalForReports: { type: Boolean, default: true },
    enforce2FAForAdmins: { type: Boolean, default: false }
  },

  // Billing & Subscription (B2B SaaS)
  billing: {
    stripeCustomerId: String,
    subscriptionId: String,
    tier: { type: String, enum: ["FREE", "STARTER", "PROFESSIONAL", "ENTERPRISE"] },
    status: { type: String, enum: ["ACTIVE", "PAST_DUE", "CANCELED", "TRIAL"] },
    trialEndsAt: Date,
    maxUsers: Number,
    storageQuotaBytes: Number,
    storageUsedBytes: Number
  },

  createdAt: Date,
  updatedAt: Date
}
```

### 4.3 `memberships`
**Purpose:** Junction collection linking Users to Organizations with Roles, managing team structures and project-specific overrides.
```typescript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User' },
  organizationId: { type: ObjectId, ref: 'Organization' },
  
  // Role & Status
  role: { type: String, enum: ["OWNER", "ADMIN", "MANAGER", "SUPERVISOR", "WORKER", "CONTRACTOR"] },
  customRoleId: { type: ObjectId, ref: 'CustomRole' }, // Nullable, if using custom roles
  status: { type: String, enum: ["PENDING", "ACTIVE", "INACTIVE", "DECLINED"] },
  invitationToken: String,
  invitationExpiresAt: Date,
  
  // Profile overrides specific to this organization
  orgSpecificTitle: String,
  orgSpecificDepartment: String,
  orgSpecificEmployeeId: String,
  
  // Team Assignments
  teamIds: [{ type: ObjectId, ref: 'Team' }],
  
  // Project-specific Role Overrides
  projectRoles: [{
    projectId: { type: ObjectId, ref: 'Project' },
    role: String
  }],
  
  // Notifications Preferences (User settings within this Org)
  notificationPreferences: {
    emailDigest: { type: String, enum: ["DAILY", "WEEKLY", "NEVER"] },
    pushEnabled: Boolean,
    smsEnabled: Boolean,
    mutedEntities: [{ type: ObjectId }] // E.g., muting a specific task thread
  },

  createdAt: Date,
  updatedAt: Date
}
// Index: { organizationId: 1, userId: 1 }, { unique: true }
```

---

## 5. TRUNK Schema Definitions

All Trunk collections implicitly include multi-tenant isolation and audit fields. The `extensions` object is generic in the DB but validated strictly by the API layer based on `organization.industry`.

### 5.1 `projects`
**Purpose:** Core work organization entity.
```typescript
{
  _id: ObjectId,
  organizationId: ObjectId, // Multi-tenant isolation
  name: String,
  description: String,
  status: { type: String, enum: ["DRAFT", "ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"] },
  
  // Location
  location: {
    type: "Point", // GeoJSON
    coordinates: [Number, Number], // [longitude, latitude]
    address: String,
    city: String,
    state: String,
    zip: String
  },
  
  // Schedule
  startDate: Date,
  targetEndDate: Date,
  actualEndDate: Date,
  
  // Financials (Stored in cents to prevent float errors)
  budget: Number,
  committedCost: Number, 
  actualCost: Number,
  
  // Team & Client
  clientId: { type: ObjectId, ref: 'User' }, // Or reference to a 'Clients' collection
  managerIds: [{ type: ObjectId, ref: 'User' }],

  // Standard Audit Fields
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date,
  createdBy: ObjectId,
  industry: String, // e.g., "CONSTRUCTION"

  // 🌿 BRANCH DATA: Construction Extensions
  extensions: {
    phases: [{ 
      name: String, 
      startDate: Date, 
      endDate: Date, 
      status: String 
    }],
    buildingType: { type: String, enum: ["COMMERCIAL", "RESIDENTIAL", "INDUSTRIAL", "INFRASTRUCTURE"] },
    contractType: { type: String, enum: ["LUMP_SUM", "GMP", "COST_PLUS", "UNIT_PRICE"] },
    totalAreaSqFt: Number,
    floors: Number,
    permitNumber: String,
    permitStatus: String,
    architect: { name: String, firm: String, contact: String },
    engineer: { name: String, firm: String, contact: String },
    tradesInvolved: [String]
  }
}
```

### 5.2 `tasks`
**Purpose:** Work assignments, tracking, and dynamic workflows.
```typescript
{
  _id: ObjectId,
  organizationId: ObjectId,
  projectId: ObjectId,
  
  title: String,
  description: String,
  status: { type: String, enum: ["TODO", "IN_PROGRESS", "BLOCKED", "ON_HOLD", "COMPLETED", "CANCELLED"] },
  priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "URGENT"] },
  
  // Assignment & Hierarchy
  assigneeIds: [{ type: ObjectId, ref: 'User' }],
  teamId: { type: ObjectId, ref: 'Team' },
  parentTaskId: { type: ObjectId, ref: 'Task' },
  dependencies: [{ type: ObjectId, ref: 'Task' }], // Task IDs that must be completed before this one
  
  // Schedule & Tracking
  dueDate: Date,
  actualStartDate: Date,
  actualEndDate: Date,
  estimatedHours: Number,
  actualHours: Number,
  
  // Metadata
  tags: [String],
  attachments: [{ type: ObjectId, ref: 'Document' }],
  
  // Blocking
  blockedReason: String,
  
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date,
  createdBy: ObjectId,
  industry: String,

  // 🌿 BRANCH DATA: Construction Extensions
  extensions: {
    taskType: { type: String, enum: ["RFI", "SUBMITTAL", "PUNCH_LIST", "STANDARD", "INSPECTION"] },
    // If RFI
    rfiNumber: String,
    specSection: String,
    drawingReference: String,
    responseRequiredBy: Date,
    rfiResponse: String,
    // If Punch List
    locationOnSite: String,
    tradeResponsible: String,
    deficiencyType: String
  }
}
```

### 5.3 `daily_reports`
**Purpose:** Immutable, contemporaneous legal record of job site activities.
```typescript
{
  _id: ObjectId,
  organizationId: ObjectId,
  projectId: ObjectId,
  
  date: Date,
  status: { type: String, enum: ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED"] },
  
  // Weather
  weather: {
    condition: String, // e.g., "Clear", "Rain", "Snow"
    temperatureF: Number,
    windMph: Number,
    precipitationInches: Number
  },
  
  // Labor
  totalWorkerCount: Number,
  totalHoursWorked: Number,
  
  // Activities & Issues
  activitiesDescription: String,
  issues: [{
    category: { type: String, enum: ["DELAY", "SAFETY", "QUALITY", "MATERIAL", "EQUIPMENT"] },
    description: String,
    impactLevel: String
  }],
  delays: [{
    cause: String,
    hoursLost: Number,
    description: String
  }],
  
  photos: [{ type: ObjectId, ref: 'Document' }], // GPS tagging handled in Document metadata
  notes: String,

  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date,
  createdBy: ObjectId,
  approvedBy: ObjectId,
  industry: String,

  // 🌿 BRANCH DATA: Construction Extensions
  extensions: {
    concretePouredVolumeYd3: Number,
    steelInstalledTons: Number,
    craneHours: Number,
    tradeBreakdown: [{ trade: String, workerCount: Number, hours: Number }],
    deliveries: [{ material: String, quantity: Number, supplier: String, accepted: Boolean }],
    visitors: [{ name: String, company: String, purpose: String, timeIn: String, timeOut: String }],
    safetyToolboxTalk: { topic: String, attendeesCount: Number, conductedBy: String }
  }
}
```

### 5.4 `documents`
**Purpose:** Centralized file storage with version control and AI RAG integration.
```typescript
{
  _id: ObjectId,
  organizationId: ObjectId,
  projectId: ObjectId, // Nullable if Org-level document
  
  name: String,
  originalFilename: String,
  fileType: String, // MIME type
  sizeBytes: Number,
  s3Key: String, // Path in object storage
  
  // Versioning
  version: Number,
  parentDocumentId: { type: ObjectId, ref: 'Document' }, // Points to v1 if this is v2+
  isLatest: Boolean,
  
  // Organization
  folderId: ObjectId,
  tags: [String],
  
  // Approval Workflow
  approvalStatus: { type: String, enum: ["NONE", "PENDING", "APPROVED", "REJECTED"] },
  approvedBy: ObjectId,
  
  // EXIF / Metadata (Crucial for Daily Report Photos)
  metadata: {
    gpsCoordinates: [Number, Number],
    captureDate: Date,
    cameraMake: String
  },
  
  // AI Vector Data (Atlas Vector Search)
  aiStatus: { type: String, enum: ["PENDING", "PROCESSING", "PROCESSED", "FAILED", "SKIPPED"] },
  textChunks: [{
    text: String,
    pageNumber: Number,
    embedding: [Number] // e.g., 1536-dimensional array
  }],

  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date,
  createdBy: ObjectId,
  industry: String,

  // 🌿 BRANCH DATA: Construction Extensions
  extensions: {
    docType: { type: String, enum: ["BLUEPRINT", "SPECIFICATION", "CONTRACT", "PERMIT", "PHOTO", "RFI_RESPONSE", "SUBMITTAL"] },
    // If Blueprint
    drawingNumber: String,
    revisionDate: Date,
    discipline: { type: String, enum: ["ARCHITECTURAL", "STRUCTURAL", "MECHANICAL", "ELECTRICAL", "PLUMBING", "CIVIL"] },
    // If Submittal
    specSection: String,
    submittalStatus: String
  }
}
```

### 5.5 `equipment`
**Purpose:** Asset tracking, assignment, and maintenance scheduling.
```typescript
{
  _id: ObjectId,
  organizationId: ObjectId,
  
  name: String,
  assetTag: { type: String, unique: true, sparse: true },
  make: String,
  model: String,
  year: Number,
  serialNumber: String,
  
  status: { type: String, enum: ["AVAILABLE", "IN_USE", "UNDER_MAINTENANCE", "OUT_OF_SERVICE", "RETIRED"] },
  
  // Current Assignment
  currentProjectId: { type: ObjectId, ref: 'Project' },
  currentAssigneeId: { type: ObjectId, ref: 'User' },
  
  // Financials
  purchaseDate: Date,
  purchasePriceCents: Number,
  hourlyInternalCostCents: Number,
  
  // Maintenance Tracking
  maintenanceSchedule: {
    intervalType: { type: String, enum: ["CALENDAR_DAYS", "ENGINE_HOURS", "MILEAGE"] },
    intervalValue: Number,
    lastMaintenanceDate: Date,
    lastMaintenanceMetric: Number // e.g., hours at last service
  },

  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date,
  createdBy: ObjectId,
  industry: String,

  // 🌿 BRANCH DATA: Construction Extensions
  extensions: {
    equipmentClass: { type: String, enum: ["HEAVY", "VEHICLE", "POWER_TOOL", "LIFT"] },
    loadCapacity: String,
    requiresCertifiedOperator: Boolean,
    fuelType: String,
    rentalDetails: {
      isRented: Boolean,
      vendor: String,
      dailyRateCents: Number,
      rentalEndDate: Date
    }
  }
}
```

---

## 6. BRANCH Schema Definitions (Construction)

These collections exist **outside** the Trunk because they are entirely unique to the Construction industry. They do not use the `extensions` pattern; they are strictly typed Mongoose schemas used only by the Construction Branch.

### 6.1 `con_safety_incidents`
**Purpose:** OSHA-compliant tracking of workplace accidents and near-misses.
```typescript
{
  _id: ObjectId,
  organizationId: ObjectId,
  projectId: ObjectId,
  
  incidentType: { type: String, enum: ["INJURY", "NEAR_MISS", "PROPERTY_DAMAGE", "ENVIRONMENTAL", "EQUIPMENT_FAILURE"] },
  severity: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
  dateOccurred: Date,
  timeOccurred: String,
  locationOnSite: String,
  
  description: String,
  immediateActionsTaken: String,
  
  // People Involved
  involvedParties: [{
    userId: { type: ObjectId, ref: 'User' },
    externalName: String, // If not a platform user
    role: String
  }],
  witnesses: [{
    name: String,
    contactInfo: String,
    statement: String
  }],
  
  photos: [{ type: ObjectId, ref: 'Document' }],
  
  // OSHA 300 / Regulatory Compliance Fields
  oshaRecordable: Boolean,
  injuryDetails: {
    bodyPartAffected: String,
    injuryType: String, // e.g., "Laceration", "Fracture"
    wasHospitalized: Boolean,
    daysAwayFromWork: Number,
    daysRestrictedTransfer: Number
  },
  
  // Investigation
  rootCauseAnalysis: String,
  preventativeActions: String,
  investigatedBy: { type: ObjectId, ref: 'User' },
  status: { type: String, enum: ["OPEN", "UNDER_INVESTIGATION", "CLOSED"] },

  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date
}
```

### 6.2 `con_change_orders`
**Purpose:** Contract modifications affecting scope, cost, and schedule.
```typescript
{
  _id: ObjectId,
  organizationId: ObjectId,
  projectId: ObjectId,
  
  coNumber: String,
  title: String,
  description: String,
  reasonCode: { type: String, enum: ["OWNER_REQUEST", "DESIGN_CHANGE", "UNFORESEEN_CONDITION", "CODE_REQUIREMENT", "ERROR_OMISSION"] },
  
  status: { type: String, enum: ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "REVISE", "APPROVED", "REJECTED"] },
  
  // Impacts
  costImpactCents: Number, // Can be negative
  scheduleImpactDays: Number, // Can be negative
  
  lineItems: [{
    description: String,
    costCode: String,
    quantity: Number,
    unitPriceCents: Number,
    totalCents: Number
  }],
  
  attachments: [{ type: ObjectId, ref: 'Document' }],
  
  // Workflow tracking
  requestedBy: { type: ObjectId, ref: 'User' },
  approvedBy: { type: ObjectId, ref: 'User' },
  clientApprovalRequired: Boolean,
  clientApprovedAt: Date,

  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date
}
```

### 6.3 `con_coi` (Certificates of Insurance)
**Purpose:** Subcontractor compliance tracking to mitigate GC liability.
```typescript
{
  _id: ObjectId,
  organizationId: ObjectId, // The GC's organization
  subcontractorOrgId: ObjectId, // If sub is on platform
  subcontractorName: String, // If sub is not on platform
  
  policyType: { type: String, enum: ["GENERAL_LIABILITY", "WORKERS_COMP", "AUTO", "UMBRELLA", "PROFESSIONAL"] },
  carrierName: String,
  policyNumber: String,
  
  // Coverage Limits
  perOccurrenceLimitCents: Number,
  aggregateLimitCents: Number,
  
  // Dates & Compliance
  effectiveDate: Date,
  expiryDate: Date,
  status: { type: String, enum: ["COMPLIANT", "EXPIRING_SOON", "EXPIRED", "REJECTED"] },
  
  // Project specifics
  projectSpecificIds: [{ type: ObjectId, ref: 'Project' }], // If empty, covers all projects
  
  documentId: { type: ObjectId, ref: 'Document' }, // The actual scanned PDF
  verifiedBy: { type: ObjectId, ref: 'User' },

  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date
}
```

### 6.4 `con_purchase_orders`
**Purpose:** Material procurement and budget commitment tracking.
```typescript
{
  _id: ObjectId,
  organizationId: ObjectId,
  projectId: ObjectId,
  
  poNumber: String,
  supplierName: String,
  supplierContact: String,
  
  status: { type: String, enum: ["DRAFT", "ISSUED", "ACKNOWLEDGED", "PARTIALLY_DELIVERED", "DELIVERED", "CANCELLED"] },
  
  lineItems: [{
    materialDescription: String,
    costCode: String,
    quantity: Number,
    unitOfMeasure: String,
    unitPriceCents: Number,
    totalCents: Number,
    quantityReceived: { type: Number, default: 0 }
  }],
  
  totalAmountCents: Number,
  deliveryDateExpected: Date,
  deliveryLocation: String,
  paymentTerms: String,
  
  issuedBy: { type: ObjectId, ref: 'User' },
  attachments: [{ type: ObjectId, ref: 'Document' }],

  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date
}
```

---

## 7. Indexing Strategy

To guarantee performance and strict multi-tenant data isolation, our indexing strategy is highly standardized.

### 7.1 Multi-Tenant Compound Indexes
Almost every query in the system will filter by `organizationId`. Therefore, **every Trunk and Branch collection** must have a compound index starting with `organizationId`.

**Examples:**
- `projects`: `{ organizationId: 1, status: 1 }`
- `tasks`: `{ organizationId: 1, projectId: 1, assigneeId: 1 }`
- `daily_reports`: `{ organizationId: 1, projectId: 1, date: -1 }`

### 7.2 Unique Constraints
Because data is isolated by organization, uniqueness is usually scoped to the organization.
- **Wrong:** Unique index on `project.name` (prevents Org B from creating "Site A" if Org A already has it).
- **Correct:** Compound Unique Index: `{ organizationId: 1, name: 1 }` (Allows Org B to have "Site A", but prevents Org A from having two "Site A"s).

### 7.3 Vector Search Index
For RAG capabilities, an Atlas Vector Search index is created on the `documents` collection:
```json
{
  "mappings": {
    "dynamic": true,
    "fields": {
      "textChunks.embedding": {
        "dimensions": 1536,
        "similarity": "cosine",
        "type": "knnVector"
      },
      "organizationId": { "type": "token" },
      "projectId": { "type": "token" }
    }
  }
}
```
*Note: The `organizationId` and `projectId` are included as filter tokens in the vector index to ensure tenant isolation during AI queries.*

---

## 8. Audit & Soft Delete Strategy

### 8.1 Audit Log Collection (`audit_logs`)
Every state change via the API triggers an asynchronous insert into `audit_logs`.

```typescript
{
  _id: ObjectId,
  organizationId: ObjectId,
  userId: ObjectId,
  action: { type: String, enum: ["CREATE", "UPDATE", "DELETE"] },
  resourceType: String, // e.g., "Project", "Task"
  resourceId: ObjectId,
  timestamp: Date,
  ipAddress: String,
  changes: {
    before: Object, // JSON state before (null if CREATE)
    after: Object   // JSON state after (null if DELETE)
  }
}
```
**Index:** `{ organizationId: 1, resourceType: 1, resourceId: 1, timestamp: -1 }`

### 8.2 Soft Deletes
- The backend API overrides the default `delete` methods.
- Instead of dropping the document, it sets `deletedAt: new Date()`.
- The multi-tenant injection middleware (MT-F01) automatically appends `{ deletedAt: null }` to all standard `find()` queries.
- A background worker permanently drops documents where `deletedAt < (now - 90 days)`.

---

## Document Changelog

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | August 3, 2026 | Pulse Engineering Team | Initial document creation |
| 1.1 | August 3, 2026 | Pulse Engineering Team | Expanded schemas to exhaustive production-grade definitions based on PRD. |

---

> **Previous Document:** [Doc 04 — System Architecture](./04_System_Architecture.md)
> **Next Document:** [Doc 06 — API Design](./06_API_Design.md)
