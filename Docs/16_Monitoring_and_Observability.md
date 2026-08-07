# Doc 16 — Monitoring & Observability

**Document ID:** PULSE-DOC-16
**Version:** 1.0
**Status:** Draft
**Last Updated:** August 3, 2026
**Author:** Pulse Engineering Team
**Depends On:** [Doc 04 (Architecture)](./04_System_Architecture.md), [Doc 08 (Cloud Infrastructure)](./08_Cloud_Infrastructure.md)

---

## Table of Contents

1. [Observability Strategy](#1-observability-strategy)
2. [Structured Logging](#2-structured-logging)
3. [Distributed Tracing (x-request-id)](#3-distributed-tracing-x-request-id)
4. [Metrics & APM](#4-metrics--apm)
5. [Alerting & On-Call Routing](#5-alerting--on-call-routing)

---

## 1. Observability Strategy

In a distributed system managing critical field operations, "blind spots" lead to massive financial losses for customers. The observability stack answers three questions:
1. **Metrics:** Is there a problem? (Dashboards)
2. **Traces:** Where is the problem? (Distributed Tracing)
3. **Logs:** What exactly is the problem? (Structured Logging)

**Primary Tooling:** Datadog (or Grafana Cloud/Prometheus for open-source equivalent) serves as the single pane of glass.

---

## 2. Structured Logging

`console.log("User updated task")` is banned in production.

### 2.1 Winston / Pino JSON Formatting
All backend services use Pino (a fast JSON logger). Logs must be strictly formatted JSON so they can be parsed, indexed, and searched by the log aggregator.

```json
{
  "level": "info",
  "timestamp": "2026-08-04T12:00:00Z",
  "message": "Task status updated to COMPLETED",
  "context": {
    "organizationId": "org_789",
    "projectId": "proj_123",
    "userId": "user_456",
    "taskId": "task_999",
    "requestId": "req-a1b2c3d4"
  }
}
```

### 2.2 PII & Secret Scrubbing
Loggers are configured to automatically redact fields matching regex patterns for:
- Passwords, JWTs, and API Keys.
- Personal Identifiable Information (Emails, Phone numbers).
- Financial data (Credit card tokens).

---

## 3. Distributed Tracing (`x-request-id`)

Because a single user action (uploading a document) spans the Node.js API, BullMQ, and the Python AI service, tracking failures requires distributed tracing.

1. **Gateway:** The Load Balancer/API Gateway generates a UUID and attaches it to the `x-request-id` header.
2. **Node API:** Extracts the ID and attaches it to the local execution context (AsyncLocalStorage in Node).
3. **Database:** The ID is logged alongside any slow queries.
4. **Message Queue:** The ID is embedded in the BullMQ job payload.
5. **Python Service:** Extracts the ID from the job payload and includes it in all AI-related logs.

**Result:** A developer can paste `req-a1b2c3d4` into Datadog and see the exact lifecycle of the request across all microservices and databases.

---

## 4. Metrics & APM

### 4.1 Application Performance Monitoring (APM)
Datadog APM agents run as sidecars in the EKS pods. They automatically instrument HTTP requests and database queries to monitor:
- **P95 Latency:** Are 95% of API requests responding under 300ms?
- **Error Rates:** What percentage of HTTP requests return 5xx?
- **Throughput:** Requests per second (RPS).

### 4.2 Infrastructure Metrics
- EKS Node CPU/Memory utilization.
- MongoDB Atlas IOPS and connection counts.
- Redis memory usage and eviction rates.

---

## 5. Alerting & On-Call Routing

Alerts are configured to prevent alert fatigue. We only page engineers for actionable anomalies.

### 5.1 PagerDuty Integration
Critical monitors trigger PagerDuty, which calls the on-call engineer's phone.
- **Monitor 1:** Global 5xx Error Rate > 1% over 5 minutes.
- **Monitor 2:** AI Processing Queue (BullMQ) delay > 10 minutes.
- **Monitor 3:** MongoDB Atlas Primary Node CPU > 90% for 15 minutes.

### 5.2 Slack Integration
Non-critical warnings route to a `#dev-alerts` Slack channel.
- Failed background jobs that hit the Dead Letter Queue (DLQ).
- High volume of 429 (Rate Limit) responses (potential DDoS or abusive tenant).
- 2FA configuration errors.

---

> **Previous Document:** [Doc 15 — Mobile Strategy](./15_Mobile_Strategy.md)
> **Next Document:** [Doc 17 — Security](./17_Security.md)
