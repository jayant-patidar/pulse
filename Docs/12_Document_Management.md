# Doc 12 — Document Management

**Document ID:** PULSE-DOC-12
**Version:** 1.0
**Status:** Draft
**Last Updated:** August 3, 2026
**Author:** Pulse Engineering Team
**Depends On:** [Doc 04 (Architecture)](./04_System_Architecture.md), [Doc 05 (Database)](./05_Database_Design.md), [Doc 10 (AI Architecture)](./10_AI_Architecture.md)

---

## Table of Contents

1. [Storage Strategy (S3 & Pre-Signed URLs)](#1-storage-strategy-s3--pre-signed-urls)
2. [Folder Hierarchy & Organization](#2-folder-hierarchy--organization)
3. [Version Control](#3-version-control)
4. [Approval Workflows](#4-approval-workflows)
5. [OCR & AI Pipeline Integration](#5-ocr--ai-pipeline-integration)
6. [Access Control (RBAC)](#6-access-control-rbac)

---

## 1. Storage Strategy (S3 & Pre-Signed URLs)

Field operations generate massive files (e.g., 500MB BIM models or blueprint sets). Passing these through the Node.js API memory space is an anti-pattern. 

1. **Upload Request:** Client requests to upload `blueprints_v2.pdf`.
2. **Pre-Signed URL Generation:** API validates RBAC (`document:upload`) and generates a short-lived (15 min) AWS S3 Pre-Signed URL.
3. **Direct Upload:** Client uploads directly to the S3 bucket using `PUT`.
4. **Finalization:** Client notifies the API that the upload is complete. API creates the MongoDB `documents` record.

### 1.1 Object Keys (S3 Pathing)
S3 keys strictly follow the tenant hierarchy to allow for easy bucket-level isolation and archiving.
`s3://pulse-prod-docs/org_{orgId}/proj_{projectId}/{documentId}.pdf`

---

## 2. Folder Hierarchy & Organization

Documents are organized in a virtual folder tree. Folders are simply documents with `type: "FOLDER"`.

- **Root Level:** Every project has a `Root` folder.
- **Pathing:** A materialized path pattern is used for fast subtree queries. (e.g., `path: ",root_id,folder_a_id,folder_b_id,"`).
- **Default Folders:** When a `CONSTRUCTION` project is created, the system automatically provisions: `Safety`, `Blueprints`, `Contracts`, and `Submittals`.

---

## 3. Version Control

In construction, building off an outdated blueprint is a multimillion-dollar mistake. Pulse enforces strict, immutable versioning.

- **Immutability:** Once a document is uploaded, the physical S3 file is immutable.
- **New Versions:** Uploading a new version creates a *new* document record in MongoDB where `parentDocumentId` points to `v1`, and `version` increments to `2`.
- **isLatest Flag:** Only the newest version has `isLatest: true`. The UI hides previous versions behind a "Version History" dropdown.
- **Archiving:** Deleting a document soft-deletes the current version and all its children.

---

## 4. Approval Workflows

Documents often represent legal boundaries (contracts, RFIs).

### 4.1 State Machine
Documents can have an `approvalStatus`: `NONE` → `PENDING` → `APPROVED` / `REJECTED`.

### 4.2 Routing
- A user uploads a Submittal (Construction Branch extension).
- They click "Submit for Approval" and select a Manager.
- System sets status to `PENDING` and triggers an event (`document.approval_requested`) which BullMQ routes to the Notification Engine.
- Manager reviews and clicks "Approve". Status becomes `APPROVED`. The document is now locked and cannot be deleted or modified without Admin intervention.

---

## 5. OCR & AI Pipeline Integration

As detailed in Doc 10 (AI Architecture), documents are the fuel for the RAG pipeline.

### 5.1 Triggering
Upon successful upload finalization (Step 1.4), the API emits `document.uploaded`. The Python AI service picks this up from Redis.

### 5.2 Processing
1. **File Type Detection:** 
   - If PDF/Word: Extracts text directly.
   - If Image (JPG/PNG) or Scanned PDF: Runs Tesseract OCR.
2. **Vectorization:** Text is chunked and embedded.
3. **DB Update:** The Python worker updates the document's `aiStatus` from `PENDING` to `PROCESSED`.

---

## 6. Access Control (RBAC)

- `document:read`: Allows downloading/viewing. Evaluated using the standard Project/Org override logic.
- `document:upload`: Allows creating new documents or folders.
- `document:delete`: Only granted to Admins/Managers by default.
- **Client/Contractor Limitation:** Users with `CLIENT` or `CONTRACTOR` roles can *only* see documents inside folders explicitly marked `sharedWithExternal: true`. 

---

> **Previous Document:** [Doc 11 — Event-Driven Architecture](./11_Event_Driven_Architecture.md)
> **Next Document:** [Doc 13 — Notification System](./13_Notification_System.md)
