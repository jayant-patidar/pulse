# Doc 21 — Deployment Guide

**Document ID:** PULSE-DOC-21
**Version:** 1.0
**Status:** Draft
**Last Updated:** August 3, 2026
**Author:** Pulse Engineering Team
**Depends On:** [Doc 09 (DevOps & CI/CD)](./09_DevOps_and_CICD.md)

---

## Table of Contents

1. [Environment Overview](#1-environment-overview)
2. [Deployment Pipeline (The GitOps Flow)](#2-deployment-pipeline-the-gitops-flow)
3. [Database Migrations](#3-database-migrations)
4. [Rollback Procedures](#4-rollback-procedures)
5. [Zero-Downtime Verification](#5-zero-downtime-verification)

---

## 1. Environment Overview

Pulse code flows strictly through three environments. No code bypasses this chain.

| Environment | Purpose | URL | Data Tier |
|---|---|---|---|
| **Development (`dev`)** | Engineer validation and quick iteration. | `dev.pulseos.com` | Ephemeral, scrubbed mock data. Destructible. |
| **Staging (`stg`)** | QA, Load Testing, User Acceptance Testing (UAT). | `stg.pulseos.com` | Sanitized snapshot of Prod data. Highly stable. |
| **Production (`prod`)** | Live customer traffic. | `app.pulseos.com` | Live, multi-AZ MongoDB Cluster. |

---

## 2. Deployment Pipeline (The GitOps Flow)

As established in Doc 09, deployment is handled by ArgoCD polling an `infrastructure` repository.

### 2.1 The Flow to Production
1. **Merge to `main`:** Developer merges a PR into the `main` branch of the app repo.
2. **CI Pipeline:** GitHub Actions tests the code, builds `pulse-api:sha-123`, and pushes to AWS ECR.
3. **Auto-Deploy to Staging:** The CI pipeline automatically updates the Staging manifest in the `infra` repo. ArgoCD immediately deploys `sha-123` to the Staging EKS cluster.
4. **QA Approval:** QA verifies the feature on `stg.pulseos.com`.
5. **Promote to Prod:** A release manager triggers the "Promote to Production" GitHub Action.
6. **Prod Deploy:** The Action updates the Production manifest in the `infra` repo. ArgoCD deploys `sha-123` to the Production EKS cluster via a Rolling Update.

---

## 3. Database Migrations

Because Pulse uses MongoDB (NoSQL), traditional schema migrations (like `ALTER TABLE`) are less frequent, but data normalization scripts are still required.

### 3.1 Migration Strategy
- **Tool:** `migrate-mongo` or a custom NestJS script runner.
- **Rule of Thumb:** **Never lock the database.** Migrations must be non-destructive and backward compatible.
- **Execution:** Migrations are executed as Kubernetes `Jobs` via Helm Hooks *before* the new API pods spin up.

### 3.2 Two-Phase Rollouts (Zero-Downtime Data Changes)
If renaming a field from `firstName` to `givenName`:
1. **Deploy 1:** API writes to *both* `firstName` and `givenName`, but reads from `firstName`. Run background script to copy old data to `givenName`.
2. **Deploy 2:** API reads from `givenName` and writes to both.
3. **Deploy 3:** API writes *only* to `givenName`. Background script drops `firstName`.

---

## 4. Rollback Procedures

If a bad commit reaches production, speed is critical.

### 4.1 GitOps Rollback (Preferred)
1. Navigate to the `infrastructure` repo in GitHub.
2. Hit "Revert" on the PR that bumped the image tag to the bad version (e.g., reverting back to `sha-abc`).
3. Merge the revert. ArgoCD instantly detects the change and rolls the K8s cluster back to the previous stable image.

### 4.2 Emergency ArgoCD UI Rollback
If GitHub is down, an Admin can log into the ArgoCD dashboard, select the `pulse-api-prod` application, click "History and Rollback", and select the previous healthy ReplicaSet.

### 4.3 Database Rollback
If a database migration corrupted data, a point-in-time recovery (PITR) is triggered via the MongoDB Atlas console (RTO: ~15 mins depending on data size). This is a "break glass" scenario.

---

## 5. Zero-Downtime Verification

Every deployment utilizes Kubernetes Readiness and Liveness probes.
- A new API pod is spun up alongside the old ones.
- K8s pings `GET /health`.
- The API checks its connection to MongoDB and Redis.
- If it returns `200 OK`, K8s routes traffic to it and safely terminates one old pod.
- Users experience zero dropped connections.

---

> **Previous Document:** [Doc 20 — Testing Strategy](./20_Testing_Strategy.md)
> **Next Document:** [Doc 22 — Coding Standards](./22_Coding_Standards.md)
