# Doc 02 — Functional Requirements Document (FRD)

**Document ID:** PULSE-DOC-02
**Version:** 1.0
**Status:** Draft
**Last Updated:** August 3, 2026
**Author:** Pulse Engineering Team
**Depends On:** [Doc 01 — Product Requirements Document (PRD)](./01_Product_Requirements_Document.md)

---

## Table of Contents

1. [Document Purpose](#1-document-purpose)
2. [State Machines & Entity Lifecycles](#2-state-machines--entity-lifecycles)
3. [Root Layer Functional Logic](#3-root-layer-functional-logic)
4. [Trunk Layer Functional Logic](#4-trunk-layer-functional-logic)
5. [Branch Layer (Construction) Functional Logic](#5-branch-layer-construction-functional-logic)
6. [Data Validation Rules](#6-data-validation-rules)
7. [System Interactions & Webhooks](#7-system-interactions--webhooks)
8. [Error Handling & Edge Cases](#8-error-handling--edge-cases)

---

## 1. Document Purpose

While the PRD (Doc 01) explains **what** we are building and **why** from a user perspective, this Functional Requirements Document (FRD) details **how** the system must behave. It defines state transitions, calculation logic, data validations, and strict system rules that developers must implement. 

All requirements here strictly follow the **Tree Architecture**: Root (Foundation), Trunk (Shared Domain), and Branch (Industry-specific).

---

## 2. State Machines & Entity Lifecycles

Many entities in Pulse follow strict state transitions. The system must enforce these transitions and reject invalid state changes.

### 2.1 Project Lifecycle (Trunk)

**Valid States:** `Draft` → `Active` ↔ `On Hold` → `Completed` → `Archived`

| Current State | Valid Next States | Required Conditions for Transition |
|---|---|---|
| `Draft` | `Active`, `Archived` | Must have at least 1 Manager assigned to move to `Active`. |
| `Active` | `On Hold`, `Completed`, `Archived` | Cannot move to `Completed` if there are open `High`/`Urgent` tasks. |
| `On Hold` | `Active`, `Archived` | None. |
| `Completed` | `Active`, `Archived` | Cannot move to `Archived` until final progress billing is paid (Branch rule). |
| `Archived` | `Active` (Restore) | Can only be restored by Org Admin. |

### 2.2 Task Lifecycle (Trunk)

**Valid States:** `To Do` ↔ `In Progress` ↔ `Blocked` / `On Hold` → `Completed` → `Archived` (Implicit)

| State Change | System Triggers & Logic |
|---|---|
| `To Do` → `In Progress` | Automatically sets `actualStartDate` to current timestamp. |
| Any → `Blocked` | Must require a `reason` text field. Triggers notification to Project Manager. |
| Any → `Completed` | Automatically sets `actualEndDate` to current timestamp. Triggers evaluation of dependent tasks (if Task B depends on Task A, Task B moves to `To Do`). |
| `Completed` → Any | Not allowed for standard users. PMs can reopen within 48 hours. After 48 hours, a new task must be created. |

### 2.3 Daily Report Workflow (Trunk)

**Valid States:** `Draft` → `Submitted` ↔ `Under Review` → `Approved`

| Rule ID | Functional Logic |
|---|---|
| DR-F01 | A `Draft` is local to the creator. It does not appear in global searches. |
| DR-F02 | Moving to `Submitted` locks the form for the creator. An audit log is generated. |
| DR-F03 | If the Org requires approval, state becomes `Under Review`. If not, it skips to `Approved`. |
| DR-F04 | If `Approved`, the record becomes immutable. Modifying an approved report requires the `report:amend` permission and creates a new version, preserving the original. |
| DR-F05 | GPS metadata from photos attached during submission must be validated against the project's geofence. If outside geofence, flag as `Location Warning`. |

### 2.4 Change Order Lifecycle (Construction Branch)

**Valid States:** `Draft` → `Submitted` → `Under Review` ↔ `Revise` → `Approved` / `Rejected`

| Rule ID | Functional Logic |
|---|---|
| CO-F01 | Moving to `Approved` triggers a synchronized update to the Project Budget (adds/subtracts `costImpact`). |
| CO-F02 | Moving to `Approved` triggers a synchronized update to the Project Timeline (adds/subtracts `scheduleImpact` days). |
| CO-F03 | If `Rejected`, the CO is locked. A new CO must be drafted. |

---

## 3. Root Layer Functional Logic

These rules govern the industry-agnostic foundation of the platform.

### 3.1 Multi-Tenancy Data Isolation (Root)

The most critical functional requirement of the platform is strict data isolation between organizations.

| Rule ID | Functional Logic |
|---|---|
| MT-F01 | **Injection Middleware:** Every incoming HTTP request must have its JWT verified. The `organizationId` claim from the JWT must be automatically injected into every database query filter by the ORM/ODM middleware. |
| MT-F02 | **Creation Stamping:** Whenever a new record is created, the system must automatically attach the user's current session `organizationId`. Client-provided `organizationId` payload fields must be ignored and stripped. |
| MT-F03 | **Cross-Tenant Prevention:** An API request attempting to access a resource ID belonging to `Org B` using a token from `Org A` must return `404 Not Found`, NOT `403 Forbidden` (to prevent ID enumeration). |

### 3.2 Role-Based Access Control (RBAC) Evaluation (Root)

RBAC evaluation happens at two levels: Organization and Project.

| Rule ID | Functional Logic |
|---|---|
| RB-F01 | **Org-Level Override:** If a user possesses the `Owner` or `Admin` role at the Organization level, the system bypasses Project-level permission checks for that user within that organization. |
| RB-F02 | **Project-Level Scoping:** For a standard user, the system evaluates: "Does this user have permission X on project Y?" using a composite key evaluation `(userId, projectId, permission)`. |
| RB-F03 | **Permission Denied Handling:** The API must return a standardized JSON structure for `403 Forbidden` indicating the exact missing permission string (e.g., `{"error": "Missing permission: task:delete"}`). |

### 3.3 JWT & Session Management (Root)

| Rule ID | Functional Logic |
|---|---|
| AU-F01 | Access tokens must have a TTL of exactly 15 minutes. |
| AU-F02 | Refresh tokens must be rotated upon use. When `/auth/refresh` is called, the old refresh token is invalidated, and a new one is issued. |
| AU-F03 | **Compromise Detection:** If an invalidated refresh token is used, the system must immediately revoke ALL active sessions for that user and trigger a security email. |

---

## 4. Trunk Layer Functional Logic

These rules govern the shared domains used by all industries.

### 4.1 RAG (Retrieval-Augmented Generation) Pipeline (Trunk)

When a document is uploaded, it must be asynchronously processed for AI search.

| Rule ID | Functional Logic |
|---|---|
| AI-F01 | **Trigger:** S3 `ObjectCreated` event triggers a BullMQ background job. |
| AI-F02 | **Chunking Logic:** Text is extracted and chunked with a maximum of 1000 tokens per chunk, with a 200-token overlap to preserve context. |
| AI-F03 | **Metadata Appending:** Every vector stored in the Vector DB must include `organizationId` and `projectId` metadata to ensure vector searches adhere to tenant isolation (MT-F01). |
| AI-F04 | **Retrieval Logic:** When an AI query is made, the system must filter the vector search space by the user's accessible `projectId`s BEFORE performing cosine similarity matching. |

### 4.2 Tree Architecture "Extensions" Handling (Trunk)

The core mechanism allowing trunk collections to store branch data.

| Rule ID | Functional Logic |
|---|---|
| EX-F01 | All Trunk API endpoints (e.g., `POST /api/projects`) accept an `extensions` JSON object in the payload. |
| EX-F02 | **Dynamic Validation:** The system must read the Organization's `industry` setting (e.g., `CONSTRUCTION`). It must then load the corresponding branch validation schema (e.g., `ConstructionProjectSchema`) to validate the contents of the `extensions` object. |
| EX-F03 | If the `extensions` object fails branch validation, the Trunk API must reject the entire request with `400 Bad Request` and return the specific branch schema errors. |

### 4.3 Notification Engine Logic (Trunk)

| Rule ID | Functional Logic |
|---|---|
| NT-F01 | **Debouncing:** If a user receives >5 notifications of the same type within 5 minutes, the system must debounce and aggregate them into a single notification ("You have 5 new task assignments"). |
| NT-F02 | **Timezone Awareness:** Push and Email notifications (unless marked `Urgent`) must not be sent between 10:00 PM and 6:00 AM in the recipient's configured timezone. They must be queued and delivered at 6:01 AM. |

---

## 5. Branch Layer (Construction) Functional Logic

These functional rules apply strictly to the Construction branch. They must NOT be evaluated if the organization's industry is not set to `CONSTRUCTION`.

### 5.1 Finance: Budget & Cost Calculations (Branch)

| Rule ID | Functional Logic |
|---|---|
| FN-C01 | **Committed Cost:** `Committed Cost` = Sum of all `Approved` Purchase Orders + Sum of all `Approved` Subcontractor Work Orders. |
| FN-C02 | **Actual Cost:** `Actual Cost` = Sum of all `Approved` Expenses + Sum of all `Paid` Invoices. |
| FN-C03 | **Remaining Budget:** `Remaining Budget` = `Total Budget` + (Sum of `Approved` Change Orders) - `Committed Cost` - `Actual Cost`. |
| FN-C04 | **Retainage Calculation:** When a subcontractor invoice is generated, `Retainage Amount` = (`Work Completed This Period` * `Retainage Percentage`). The `Payment Due` = `Work Completed This Period` - `Retainage Amount`. |

### 5.2 Contractor Portal: Compliance & Lien Waivers (Branch)

| Rule ID | Functional Logic |
|---|---|
| CP-C01 | **Auto-Status Update:** A nightly CRON job must evaluate all subcontractor COIs (Certificates of Insurance). If `expiryDate` < `Current Date`, the subcontractor status changes to `Non-Compliant (Red)`. |
| CP-C02 | **Assignment Block:** The API must prevent assigning a `Non-Compliant` subcontractor to any new Work Order. |
| CP-C03 | **Lien Waiver Generation:** When a Progress Payment is marked `Approved`, the system must generate a PDF Conditional Lien Waiver populated with the payment amount, subcontractor name, and project details, and queue it for digital signature. |

### 5.3 Safety: OSHA 300 Logging Logic (Branch)

| Rule ID | Functional Logic |
|---|---|
| SF-C01 | If a Safety Incident is logged with severity `High` or `Critical` and involves an injury, the system must enforce completion of all OSHA 300 required fields before the incident report can be closed. |
| SF-C02 | The system must calculate the **Incident Rate** for the dashboard using the standard formula: `(Total Number of Recordable Cases x 200,000) / Total Employee Hours Worked`. |

---

## 6. Data Validation Rules

Critical validation constraints implemented at the API/Model layer.

### 6.1 Generic Inputs (Root/Trunk)

- **Dates:** All dates must be stored in UTC format (`ISO 8601`). The frontend handles localization based on the organization's timezone setting.
- **Amounts:** All monetary values must be stored as integers in the smallest currency unit (e.g., cents) to prevent floating-point arithmetic errors. (e.g., $1,000.50 is stored as `100050`).
- **File Sizes:** Max upload chunk size via pre-signed URL is 5MB. Total file limit is 500MB.
- **Pagination:** All `GET` list endpoints must implement cursor-based or offset/limit pagination with a hard maximum `limit` of 100 to prevent database DoS.

### 6.2 Industry Discriminator (Branch)

- **Immutability:** Once an Organization creates a Project with `industry: "CONSTRUCTION"`, the industry for that specific project cannot be changed.
- **Schema Mapping:** The `extensions` field must strictly deny unknown properties (no flexible JSON dumps; it must adhere to the specific branch schema).

---

## 7. System Interactions & Webhooks

### 7.1 Real-time Engine (WebSockets)

| Interaction | Logic |
|---|---|
| Connection | Client connects with `?token=JWT`. Server validates token. |
| Room Joining | Server automatically subscribes the socket to: `org_{orgId}`, `user_{userId}`, and `project_{projectId}` for all projects the user is a member of. |
| Event Broadcasting | When an entity is updated via REST API, a service layer event is emitted. The WebSocket gateway catches this and broadcasts to the relevant room (e.g., Task update broadcasts to `project_{projectId}`). |

### 7.2 Webhooks (Enterprise Tier)

Organizations on the Enterprise tier can configure webhooks to integrate with ERPs (like Viewpoint or Sage).

| Interaction | Logic |
|---|---|
| Payload | POST requests containing the event type and entity JSON payload. |
| Security | Webhooks must be signed using HMAC SHA-256 with an organization-specific secret. The signature is placed in the `X-Pulse-Signature` header. |
| Retries | Failed deliveries (HTTP status != 2xx) are retried with exponential backoff (1m, 5m, 30m, 2h, 12h) before being marked as `Failed`. |

---

## 8. Error Handling & Edge Cases

| Edge Case | System Behavior |
|---|---|
| **Offline Mode Conflict**<br>User A and User B edit the same Daily Report offline. Both come online. | The system implements Last-Write-Wins based on the local timestamp attached to the payload. A soft warning notification is sent to both users indicating a sync conflict occurred. |
| **Cascade Deletion Prevention**<br>Admin attempts to archive an Organization. | Organization archiving is a background job. It must first archive all Projects, then disable all User logins for that org, then mark the org as `Archived`. It is never hard-deleted. |
| **Missing AI Credentials**<br>OpenAI API rate limits are hit during document processing. | The RAG processing job catches the `429` error, puts the job back in the BullMQ queue with a 5-minute delay, and updates the document processing status to `Rate Limited - Retrying`. |
| **Storage Quota Exceeded**<br>Org reaches its 1TB storage limit. | The API must return `402 Payment Required` on the request for a pre-signed S3 URL. |

---

## Document Changelog

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | August 3, 2026 | Pulse Engineering Team | Initial document creation |

---

> **Previous Document:** [Doc 01 — Product Requirements Document (PRD)](./01_Product_Requirements_Document.md)
> **Next Document:** [Doc 03 — Non-Functional Requirements](./03_Non_Functional_Requirements.md)
