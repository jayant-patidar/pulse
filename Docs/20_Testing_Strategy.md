# Doc 20 — Testing Strategy

**Document ID:** PULSE-DOC-20
**Version:** 1.0
**Status:** Draft
**Last Updated:** August 3, 2026
**Author:** Pulse Engineering Team
**Depends On:** [Doc 09 (DevOps & CI/CD)](./09_DevOps_and_CICD.md)

---

## Table of Contents

1. [Testing Philosophy (The Test Pyramid)](#1-testing-philosophy-the-test-pyramid)
2. [Unit Testing](#2-unit-testing)
3. [Integration Testing](#3-integration-testing)
4. [End-to-End (E2E) Testing](#4-end-to-end-e2e-testing)
5. [Performance & Load Testing](#5-performance--load-testing)
6. [Security & Chaos Engineering](#6-security--chaos-engineering)

---

## 1. Testing Philosophy (The Test Pyramid)

Given the complexity of the Tree Architecture and strict multi-tenant isolation, Pulse relies on automated testing as the primary defense against regression.

- **Thresholds:** A hard minimum of **80% code coverage** is enforced by SonarQube in the CI pipeline. Pull Requests below this threshold will block the merge button.
- **TDD (Optional but encouraged):** Engineers are encouraged to write tests for bugs *before* fixing the code.

---

## 2. Unit Testing

Unit tests run in milliseconds. They test isolated logic without touching the database or external APIs.

### 2.1 Tooling
- **Node.js (Backend & Frontend):** Jest + React Testing Library.
- **Python (AI Service):** PyTest.

### 2.2 Critical Areas for Unit Tests
- **RBAC Guard (Doc 07):** Ensure the permissions evaluator correctly calculates roles based on `projectRoles` vs `globalRole`.
- **Validation Schemas (Doc 05):** Ensure Zod schemas properly reject invalid Branch extensions.
- **Business Logic Services:** e.g., Budget calculation functions, delay summarizers.

---

## 3. Integration Testing

Integration tests verify that the API, database, and Redis cache interact correctly.

### 3.1 Setup & Tooling
- **Tooling:** Supertest (HTTP assertions) + Jest.
- **Database:** Uses `mongodb-memory-server` or an ephemeral Docker container for real DB interactions during CI.

### 3.2 Critical Areas for Integration Tests
- **Tenant Isolation:** A test must explicitly verify that a user in `org_A` querying `GET /api/v1/trunk/projects` does **not** receive projects from `org_B`.
- **Event Bus:** Emitting a dummy `report.submitted` event and verifying that the BullMQ job is properly enqueued.

---

## 4. End-to-End (E2E) Testing

E2E tests simulate a real user driving the application via a browser or mobile device. They are slower and more brittle, so they are reserved for critical user journeys (CUJs).

### 4.1 Tooling
- **Web App:** Playwright (preferred for speed and multi-tab testing) or Cypress.
- **Mobile App:** Detox or Appium.

### 4.2 Critical User Journeys (CUJs)
1. **The Multi-Tenant Login:** User logs in, sees the Org Picker, selects an org, and accesses the dashboard.
2. **The Daily Report Flow:** User navigates to a project, fills out a daily report (including branch-specific extensions), and submits it.
3. **The Offline Sync:** (Detox) App is forced offline, user creates a task, app goes online, task syncs to the server.

---

## 5. Performance & Load Testing

Before major enterprise rollouts, we validate the system's capacity under stress.

### 5.1 Tooling & Strategy
- **Tooling:** `k6` (Grafana) or Artillery.
- **Scenarios:**
  - **The Morning Rush:** Simulating 10,000 workers logging in and querying their tasks simultaneously at 7:00 AM.
  - **WebSocket Flood:** Measuring memory consumption on the Node.js pods when 5,000 live updates are broadcast to active kanban boards.
- **Execution:** Run against the Staging environment pre-release.

---

## 6. Security & Chaos Engineering

### 6.1 Security Scans
- **SAST:** SonarQube scans the codebase for hardcoded secrets or bad patterns.
- **SCA:** Snyk/Trivy scans package dependencies (NPM/Pip) and Docker base images for CVEs during the CI pipeline.

### 6.2 Chaos Engineering (Game Days)
Once a quarter, engineering runs a "Game Day" in Staging to validate Disaster Recovery (Doc 08).
- Using AWS Fault Injection Simulator (FIS) or Gremlin to randomly terminate EKS nodes or severe network links to Redis to ensure the application fails over gracefully or degrading features safely without crashing the main UI.

---

> **Previous Document:** [Doc 19 — Development Roadmap](./19_Development_Roadmap.md)
> **Next Document:** [Doc 21 — Deployment Guide](./21_Deployment_Guide.md)
