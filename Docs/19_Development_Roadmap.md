# Doc 19 — Development Roadmap

**Document ID:** PULSE-DOC-19
**Version:** 1.0
**Status:** Draft
**Last Updated:** August 3, 2026
**Author:** Pulse Engineering Team
**Depends On:** [Doc 01 (PRD)](./01_Product_Requirements_Document.md)

---

## Table of Contents

1. [Roadmap Philosophy](#1-roadmap-philosophy)
2. [Phase 1: The Core Trunk (MVP)](#2-phase-1-the-core-trunk-mvp)
3. [Phase 2: The Construction Branch (V1)](#3-phase-2-the-construction-branch-v1)
4. [Phase 3: The Mobile Field Experience (V2)](#4-phase-3-the-mobile-field-experience-v2)
5. [Phase 4: AI Intelligence Layer (V3)](#5-phase-4-ai-intelligence-layer-v3)
6. [Phase 5: Enterprise & Expansion (V4)](#6-phase-5-enterprise--expansion-v4)

---

## 1. Roadmap Philosophy

We build Pulse sequentially to manage risk and validate value early. We cannot build the AI features until we have data. We cannot build the Construction Branch until the Trunk exists.

**Execution Rule:** Do not start a new Phase until the previous Phase is in production and stable.

---

## 2. Phase 1: The Core Trunk (MVP)
**Goal:** Build the agnostic foundation. Prove multi-tenancy, RBAC, and basic entity management.
**Duration:** Months 1-3

- [ ] **Infrastructure:** AWS VPC, EKS Cluster, MongoDB Atlas, CI/CD pipelines.
- [ ] **Root Layer:** Auth, JWT, Organizations, Users, Teams, Memberships.
- [ ] **RBAC Engine:** The dual-layered permission evaluator.
- [ ] **Trunk Core:** Projects, Tasks, Daily Reports (generic), Documents, Equipment.
- [ ] **UI:** Basic desktop React application (Dashboard, Kanban, Grids).

---

## 3. Phase 2: The Construction Branch (V1)
**Goal:** Prove the "Tree Architecture" works by successfully extending the Trunk without modifying core code. Make the product sellable to General Contractors.
**Duration:** Months 4-5

- [ ] **Extensions:** Wire up the backend dynamic validation logic for Trunk `extensions`.
- [ ] **Construction UI:** React components that inject construction fields (e.g., Contract Type, Square Footage).
- [ ] **Branch Collections:** Create `con_safety_incidents`, `con_change_orders`, `con_coi`, `con_po`.
- [ ] **Workflows:** RFI and Submittal approval state machines.
- [ ] **Finance:** Basic budget vs. actuals tracking.

---

## 4. Phase 3: The Mobile Field Experience (V2)
**Goal:** Capture data from the actual job site. (The product is useless if workers in the field can't use it).
**Duration:** Months 6-7

- [ ] **React Native App:** iOS and Android skeleton.
- [ ] **Offline Sync Engine:** WatermelonDB local state + queueing mechanism.
- [ ] **Hardware:** Camera integration (compression, document scanning).
- [ ] **GPS:** Stamping coordinates on photos and enforcing geofences.
- [ ] **Field UX:** Voice-to-text, high contrast, offline-first daily reports.

---

## 5. Phase 4: AI Intelligence Layer (V3)
**Goal:** Turn the mass of collected data into actionable intelligence.
**Duration:** Months 8-9

- [ ] **Python Microservice:** Spin up the FastAPI service and BullMQ worker.
- [ ] **Ingestion Pipeline:** OCR, Chunking, Embedding, MongoDB Vector Search indexing.
- [ ] **Retrieval Pipeline:** Node RBAC filtering -> Vector Search -> LLM Prompt assembly.
- [ ] **Features:** Smart Search (Cmd+K + AI), Daily Report Summarizer, Project Health Assistant.

---

## 6. Phase 5: Enterprise & Expansion (V4)
**Goal:** Move upmarket and prove the multi-vertical strategy.
**Duration:** Months 10-12

- [ ] **Enterprise Identity:** SAML / Okta SSO integration (JIT provisioning).
- [ ] **Enterprise Security:** Field-level KMS encryption, custom role builder.
- [ ] **New Industry Branch (e.g., Agriculture):**
  - Add `industry: "AGRICULTURE"` to Org.
  - Create `agr_crop_cycles`, `agr_pesticide_logs`.
  - Inject new UI fields into the Trunk.
  - *Prove that adding this branch required ZERO changes to the Construction branch.*

---

## Document Changelog

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | August 3, 2026 | Pulse Engineering Team | Initial document creation |

---

> **Previous Document:** [Doc 18 — UI/UX Design System](./18_UI_UX_Design_System.md)
> **End of Roadmap**
