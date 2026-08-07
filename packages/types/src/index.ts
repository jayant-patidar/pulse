// ============================================================
// @pulse/types — Shared TypeScript Interfaces
// ============================================================
// This package defines the canonical data shapes used across
// the entire Pulse monorepo (API, Web, Mobile).
//
// Structure mirrors the Tree Architecture:
//   root/   → Auth, Org, Membership, RBAC types
//   trunk/  → Project, Task, DailyReport, Document, Equipment
//   branches/construction/ → SafetyIncident, ChangeOrder, etc.
// ============================================================

// ---- ROOT TYPES ----
export * from './root/user.types';
export * from './root/organization.types';
export * from './root/membership.types';
export * from './root/auth.types';
export * from './root/rbac.types';

// ---- TRUNK TYPES ----
export * from './trunk/project.types';
export * from './trunk/task.types';
export * from './trunk/daily-report.types';
export * from './trunk/document.types';
export * from './trunk/equipment.types';

// ---- BRANCH TYPES (Construction) ----
export * from './branches/construction/safety-incident.types';
export * from './branches/construction/change-order.types';
export * from './branches/construction/purchase-order.types';
export * from './branches/construction/coi.types';
export * from './branches/construction/extensions.types';
