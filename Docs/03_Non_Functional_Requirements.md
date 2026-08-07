# Doc 03 — Non-Functional Requirements (NFR)

**Document ID:** PULSE-DOC-03
**Version:** 1.0
**Status:** Draft
**Last Updated:** August 3, 2026
**Author:** Pulse Engineering Team
**Depends On:** [Doc 00](./00_Vision_and_Product_Strategy.md), [Doc 01](./01_Product_Requirements_Document.md), [Doc 02](./02_Functional_Requirements.md)

---

## Table of Contents

1. [Document Purpose](#1-document-purpose)
2. [Performance & Scalability](#2-performance--scalability)
3. [Availability & Reliability](#3-availability--reliability)
4. [Security & Privacy](#4-security--privacy)
5. [Usability & Field Conditions](#5-usability--field-conditions)
6. [Data Retention & Compliance](#6-data-retention--compliance)
7. [Maintainability & Architecture Constraints](#7-maintainability--architecture-constraints)
8. [Observability & Monitoring](#8-observability--monitoring)

---

## 1. Document Purpose

Non-Functional Requirements (NFRs) define system attributes such as performance, security, usability, and reliability. While Functional Requirements dictate *what* the system does, NFRs dictate *how well* it performs those functions. 

Because Pulse is a Field Operations Management Platform (FOMP), our NFRs must specifically address the realities of construction sites: poor cellular connectivity, offline usage, mobile-first interaction, and enterprise-grade security for B2B data isolation.

---

## 2. Performance & Scalability

The system must remain highly responsive to ensure adoption by field workers who have low tolerance for slow applications.

### 2.1 Response Times

| Metric | Target | Maximum (p95) | Notes |
|---|---|---|---|
| **API Read Requests** | < 100ms | < 300ms | Standard CRUD operations (cached where possible). |
| **API Write Requests** | < 200ms | < 500ms | E.g., submitting a daily report. |
| **Complex Queries/Search** | < 500ms | < 1.5s | Global search across multiple collections. |
| **AI (RAG) Queries** | < 3s | < 5s | Dependent on LLM provider latency. |
| **Document Upload (Start)** | < 100ms | < 200ms | Time to generate pre-signed S3 URL. |
| **Web App Initial Load** | < 1.5s | < 3s | Time to Interactive (TTI) on a standard 4G connection. |

### 2.2 Concurrency & Scalability

- **Concurrent Users:** The architecture must support scaling to 50,000 Concurrent Active Users (CCU) globally without performance degradation.
- **WebSocket Connections:** The real-time engine must support up to 100,000 simultaneous open WebSockets.
- **Auto-Scaling:** Application servers must automatically scale horizontally based on CPU utilization (> 70% sustained for 3 minutes) or queue depth.
- **Database Scaling:** MongoDB Atlas cluster must be configured for auto-scaling of storage and compute based on load.

---

## 3. Availability & Reliability

Field operations do not stop; therefore, Pulse cannot stop. Downtime costs construction companies money.

### 3.1 Uptime SLA

- **Target Availability:** 99.95% (Approx. 21.6 minutes of allowed downtime per month).
- **Maintenance Windows:** Planned maintenance requiring downtime must be scheduled between 01:00 and 04:00 UTC on Sundays and communicated 7 days in advance. (Zero-downtime deployments are the standard; maintenance windows are for critical infrastructure changes only).

### 3.2 Disaster Recovery (DR)

- **Recovery Point Objective (RPO):** < 5 minutes. (Maximum acceptable data loss in case of a catastrophic database failure). Achieved via continuous MongoDB OpLog backups.
- **Recovery Time Objective (RTO):** < 1 hour. (Maximum acceptable time to restore the system in a secondary region if the primary region goes offline).

### 3.3 Fault Tolerance

- **Multi-AZ Deployment:** All services (compute, database, cache) must be deployed across at least 3 Availability Zones within the primary cloud region.
- **Graceful Degradation:** If the AI Engine goes down, the core platform (tasks, reports, documents) must continue to function normally. If WebSockets fail, the client must automatically fall back to HTTP polling.

---

## 4. Security & Privacy

As a B2B SaaS, data isolation and security are paramount. Pulse will handle sensitive financial data, contracts, and PII.

### 4.1 Data Isolation (Multi-Tenancy)

- **Logical Isolation:** All database records must contain an `organizationId`.
- **Enforcement:** Tenant isolation must be enforced at the ORM/Middleware level, not left to individual controller logic. (See FRD Doc 02).

### 4.2 Encryption

- **Data in Transit:** All network traffic must be encrypted using TLS 1.3. No HTTP traffic allowed (must redirect to HTTPS).
- **Data at Rest:** All databases, object storage (S3), and backups must be encrypted at rest using AES-256. 
- **Secrets Management:** Passwords must be hashed using Argon2id or bcrypt (cost factor >= 12). API keys, external tokens, and DB credentials must be stored in a dedicated Secrets Manager (e.g., AWS Secrets Manager or HashiCorp Vault), never in code or plaintext `.env` files.

### 4.3 Application Security

- **OWASP Top 10:** The application must be protected against standard web vulnerabilities (SQL/NoSQL Injection, XSS, CSRF).
- **Rate Limiting:** Global rate limiting (e.g., 100 requests / minute / IP) and specific rate limiting for sensitive endpoints (e.g., login, password reset).
- **Input Validation:** All incoming API payloads must be strictly validated against schemas (e.g., using Zod or class-validator). Unrecognized fields must be stripped.

### 4.4 Compliance Readiness

While certification may happen post-launch, the architecture must be designed to support:
- **SOC 2 Type II:** Requires comprehensive audit logging, access controls, and change management.
- **GDPR / CCPA:** Requires the ability to hard-delete user PII upon request ("Right to be Forgotten") and export user data.

---

## 5. Usability & Field Conditions

Pulse is built for users working outside the office. The interface and network handling must reflect this.

### 5.1 Mobile-First & Responsive

- **UI/UX Strategy:** All screens must be designed for mobile (375px width) *first*, then scaled up to tablet (768px) and desktop (1920px). 
- **Touch Targets:** Minimum interactive touch target size is 44x44 CSS pixels (to accommodate users wearing gloves or using ruggedized tablets).
- **Contrast:** UI must meet WCAG 2.1 Level AA contrast requirements (minimum 4.5:1 for text) to ensure readability in bright, direct sunlight.

### 5.2 Offline & Poor Network Capabilities

- **Offline Support:** The mobile web/native app must utilize service workers (PWA) or local SQLite to cache critical data. 
- **Queued Writes:** If a user loses connection while submitting a daily report, the payload must be queued locally and automatically synced when connection is restored.
- **Timeouts:** API clients must have sensible timeouts (e.g., 30s) and implement exponential backoff for retries on network failures (5xx errors or network drops).

---

## 6. Data Retention & Compliance

### 6.1 Retention Policies

- **Active Data:** Kept indefinitely while the organization is an active customer.
- **Soft Deletion:** When a user deletes a resource (e.g., a project or document), it is marked `deletedAt: [Timestamp]`. It is hidden from the UI but remains in the database.
- **Permanent Purge:** Soft-deleted data is permanently deleted after 90 days via an automated background job.
- **Audit Logs:** Immutable audit logs are retained for 7 years for compliance and dispute resolution.

### 6.2 Data Export

- Organizations must be able to export their own data (CSV, JSON, PDF) to prevent vendor lock-in and support their own internal compliance needs.

---

## 7. Maintainability & Architecture Constraints

To ensure long-term velocity, the codebase must adhere to strict architectural rules.

### 7.1 Tree Architecture Adherence

- **Strict Boundaries:** Code in the `branch` directory (e.g., Construction logic) must **never** be imported into `trunk` or `root` modules.
- **Extensibility:** The system must use an interface/plugin pattern so that adding a new industry branch (e.g., Agriculture) requires zero modifications to existing trunk files.

### 7.2 Code Quality

- **Type Safety:** 100% strict TypeScript. `any` types are prohibited in production code.
- **Test Coverage:** Minimum 80% unit test coverage for backend services. 100% coverage for Root layer security and multi-tenancy middleware.
- **CI/CD:** No code can be merged to the `main` branch without passing automated linting, unit tests, and security scans.

---

## 8. Observability & Monitoring

The system must be fully observable so the engineering team can detect issues before customers report them.

### 8.1 Logging

- **Structured Logging:** All backend logs must be output in structured JSON format for easy ingestion by log aggregators (e.g., Datadog, ELK).
- **Correlation IDs:** Every incoming HTTP request is assigned a unique `x-request-id`. This ID must be passed down to all microservices, database queries, and background jobs related to that request to trace execution.
- **PII Scrubbing:** Logs must never contain passwords, JWTs, PII (emails, names), or sensitive financial data.

### 8.2 Metrics & Alerting

- **APM:** Application Performance Monitoring must track endpoint latency, error rates, and throughput.
- **Infrastructure Metrics:** CPU, Memory, Disk I/O, and Network traffic must be monitored.
- **Alerts:** Critical alerts (e.g., 5xx error rate > 1%, Database CPU > 85%, API latency p95 > 2s) must trigger PagerDuty/Slack notifications to the on-call engineering team.

---

## Document Changelog

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | August 3, 2026 | Pulse Engineering Team | Initial document creation |

---

> **Previous Document:** [Doc 02 — Functional Requirements Document (FRD)](./02_Functional_Requirements.md)
> **Next Document:** [Doc 04 — System Architecture](./04_System_Architecture.md)
