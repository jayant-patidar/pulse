# Doc 11 — Event-Driven Architecture

**Document ID:** PULSE-DOC-11
**Version:** 1.0
**Status:** Draft
**Last Updated:** August 3, 2026
**Author:** Pulse Engineering Team
**Depends On:** [Doc 04 (Architecture)](./04_System_Architecture.md), [Doc 08 (Cloud Infrastructure)](./08_Cloud_Infrastructure.md)

---

## Table of Contents

1. [Event-Driven Philosophy](#1-event-driven-philosophy)
2. [Event Typology (The Tree)](#2-event-typology-the-tree)
3. [Transport Mechanisms](#3-transport-mechanisms)
4. [Durable Jobs & Queues (BullMQ)](#4-durable-jobs--queues-bullmq)
5. [Idempotency & Retries](#5-idempotency--retries)
6. [Real-Time WebSocket Mapping](#6-real-time-websocket-mapping)

---

## 1. Event-Driven Philosophy

In a Modular Monolith dealing with thousands of concurrent field workers, synchronous API calls create tight coupling and massive bottlenecks. 

If a user submits a Daily Report, the API should **not** wait to:
1. Generate a PDF.
2. Send 5 notification emails.
3. Update the project analytics dashboard.
4. Process photos for AI.

Instead, the API simply saves the report to the database, emits a `report.submitted` event, and immediately returns `201 Created` to the user. All other logic is handled asynchronously by independent modules listening for that event.

---

## 2. Event Typology (The Tree)

Following the Tree Architecture, events are strictly categorized and typed.

### 2.1 Root Events (Foundation)
Triggered by core platform services. These can be listened to by Trunk and Branch modules.
- `org.created`
- `user.registered`
- `user.deleted`
- `membership.role_changed`

### 2.2 Trunk Events (Core Domain)
Triggered by shared modules. Branches heavily rely on listening to these.
- `project.created`, `project.status_changed`
- `task.created`, `task.completed`, `task.blocked`
- `report.submitted`, `report.approved`
- `document.uploaded`

### 2.3 Branch Events (Industry Specific)
Triggered by industry-specific modules. **Trunk modules cannot listen to Branch events.**
- `con_co.approved` (Construction Change Order)
- `con_safety.logged` (Construction Safety Incident)
- `con_po.delivered` (Construction Purchase Order)

---

## 3. Transport Mechanisms

We utilize two distinct transport layers depending on the event's requirements.

### 3.1 Redis Pub/Sub (Fast, Ephemeral)
Used for real-time memory synchronization and WebSocket broadcasting across multiple Node.js instances.
- **Characteristics:** "Fire and forget." If a listener is down, the message is lost.
- **Use Case:** Broadcasting a `task.updated` event so that User B's screen instantly updates while they are looking at the Kanban board.

### 3.2 BullMQ (Durable, Persistent)
Used for critical business logic that must survive server crashes.
- **Characteristics:** Backed by Redis. Messages are persisted until explicitly acknowledged.
- **Use Case:** PDF generation, sending emails, processing AI vectors, syncing with external ERPs.

---

## 4. Durable Jobs & Queues (BullMQ)

Critical asynchronous tasks are routed to specific BullMQ queues.

### 4.1 Queue Definitions
| Queue Name | Priority | Purpose |
|---|---|---|
| `notifications_q` | High | Emails, Push notifications, SMS. |
| `webhooks_q` | High | Delivering payloads to external customer ERP integrations. |
| `ai_processing_q` | Medium | Python workers chunking and embedding documents. |
| `pdf_generation_q`| Medium | Heavy PDF rendering for reports and contracts. |
| `archive_q` | Low | Nightly jobs moving soft-deleted records to cold storage. |

### 4.2 The Branch Listener Pattern
How a Branch reacts to a Trunk event without coupling:
1. `TrunkReportService` saves a report to DB.
2. Emits `report.submitted` via Node's internal `EventEmitter`.
3. `ConstructionSafetyService` (Branch) is listening. It reads the payload.
4. If it detects safety keywords in the report, it pushes a job to `con_safety_audit_q`.
*The Trunk remains completely ignorant that the Construction Branch exists.*

---

## 5. Idempotency & Retries

Because durable events can fail (network timeouts, 3rd party API limits), the system must handle retries gracefully.

### 5.1 Retry Strategy (Exponential Backoff)
If a worker fails to process a job, it returns an Error. BullMQ automatically retries based on queue configuration:
- 1st Retry: After 30 seconds.
- 2nd Retry: After 2 minutes.
- 3rd Retry: After 10 minutes.
- 4th Retry: Fails and moves to DLQ.

### 5.2 Dead Letter Queue (DLQ)
When a job exhausts all retries, it is moved to the DLQ. Admins can view the DLQ via a dashboard (Bull-Board), inspect the stack trace, fix the bug, and manually replay the job.

### 5.3 Idempotency
Because jobs might retry, **all event handlers must be idempotent**.
- *Wrong:* `budget += 500` (If retried, budget becomes +1000).
- *Right:* `budget = 5000` (Absolute setting), or checking a unique `processed_event_id` before applying a delta change.

---

## 6. Real-Time WebSocket Mapping

Internal system events are automatically mapped to WebSocket rooms to provide a "live" feel to the UI.

### 6.1 The Mapping Flow
1. API Controller updates a Task in MongoDB.
2. Controller emits internal event: `task.updated` (Payload: `{ taskId: "123", projectId: "456", data: {...} }`).
3. The WebSocket Gateway listens for `task.*` events.
4. Gateway translates the event and broadcasts it via Socket.io to the Redis Adapter:
   `io.to("project_456").emit("task.updated", payload)`
5. All connected clients looking at `project_456` instantly see the task update on their screen.

---

## Document Changelog

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | August 3, 2026 | Pulse Engineering Team | Initial document creation |

---

> **Previous Document:** [Doc 10 — AI Architecture](./10_AI_Architecture.md)
> **Next Document:** [Doc 12 — Document Management](./12_Document_Management.md)
