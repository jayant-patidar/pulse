# Doc 17 — Security & Compliance

**Document ID:** PULSE-DOC-17
**Version:** 1.0
**Status:** Draft
**Last Updated:** August 3, 2026
**Author:** Pulse Engineering Team
**Depends On:** [Doc 07 (Auth & Authorization)](./07_Auth_and_Authorization.md), [Doc 08 (Cloud Infrastructure)](./08_Cloud_Infrastructure.md)

---

## Table of Contents

1. [Security Philosophy (Zero Trust)](#1-security-philosophy-zero-trust)
2. [Data Encryption (At Rest & In Transit)](#2-data-encryption-at-rest--in-transit)
3. [OWASP Top 10 Mitigation](#3-owasp-top-10-mitigation)
4. [Secrets Management](#4-secrets-management)
5. [Compliance (SOC 2 & ISO 27001)](#5-compliance-soc-2--iso-27001)

---

## 1. Security Philosophy (Zero Trust)

Because Pulse manages sensitive legal contracts, financial budgets, and OSHA compliance data, security cannot be an afterthought. We operate on a **Zero Trust** architecture:
- Microservices must authenticate with each other.
- The database rejects connections from anything outside the EKS Worker Node Security Group.
- **Tenant Isolation is Ironclad:** (See Doc 07) A missing `organizationId` filter in a database query is considered a critical P0 security incident.

---

## 2. Data Encryption (At Rest & In Transit)

### 2.1 Encryption In Transit
- All traffic between the client and the Edge (CloudFront) is forced over **TLS 1.3**.
- Internal traffic between the Application Load Balancer and EKS Pods is encrypted.
- Internal database traffic (EKS to MongoDB Atlas) is encrypted over TLS.

### 2.2 Encryption At Rest
- **Database:** MongoDB Atlas encrypts the underlying EBS volumes using AWS KMS (Key Management Service).
- **Object Storage:** S3 buckets utilize AES-256 server-side encryption (SSE-S3).
- **Field-Level Encryption (Enterprise):** Extremely sensitive fields (e.g., HR employee ID numbers) can optionally be encrypted at the application level using a unique KMS key per tenant before being stored in MongoDB.

---

## 3. OWASP Top 10 Mitigation

| Threat | Pulse Mitigation Strategy |
|---|---|
| **Broken Access Control** | Enforced by the dual-layered RBAC Engine (Doc 07). Missing `organizationId` in JWT rejects request immediately. |
| **Cryptographic Failures** | TLS 1.3 only. Argon2id for password hashing. No custom crypto. |
| **Injection (SQL/NoSQL)** | Mongoose ODM sanitizes all queries. Raw queries are banned. AWS WAF blocks malicious payloads. |
| **Insecure Design** | Strict separation of Trunk and Branch. Feature flags decouple deployments from releases. |
| **Security Misconfiguration** | IaC (Terraform) ensures immutable, peer-reviewed infrastructure changes. No ClickOps. |
| **Vulnerable Dependencies** | Snyk/Trivy runs on every CI pipeline run (Doc 09). Fails build on High/Critical CVEs. |

---

## 4. Secrets Management

Passwords, API Keys, and JWT signing certificates are never hardcoded and never stored in `.env` files on developer machines.

### 4.1 Production Secrets
- Stored exclusively in **AWS Secrets Manager**.
- The Kubernetes cluster uses the External Secrets Operator (ESO) to sync AWS Secrets into temporary, in-memory K8s Secrets that pods can mount as environment variables.
- Secrets are rotated every 90 days.

### 4.2 Local Development Secrets
- Managed via a secure vault tool (e.g., Doppler or HashiCorp Vault).
- Developers run `doppler run -- npm run dev` to inject short-lived credentials into their local process memory.

---

## 5. Compliance (SOC 2 & ISO 27001)

Enterprise general contractors require strict compliance audits. Pulse is designed from day one to pass SOC 2 Type II audits.

- **Audit Logging (Doc 05):** Every mutate action (POST/PATCH/DELETE) creates an immutable record in the `audit_logs` collection, tracking `userId`, `action`, `ipAddress`, and `changes`.
- **Access Reviews:** Admins can instantly export a matrix of who has access to what project.
- **Disaster Recovery (Doc 08):** Documented and tested multi-region failover.
- **Data Deletion:** Soft deletes are permanently scrubbed after 90 days to comply with GDPR/CCPA "Right to be Forgotten" mandates.

---

> **Previous Document:** [Doc 16 — Monitoring & Observability](./16_Monitoring_and_Observability.md)
> **Next Document:** [Doc 18 — UI/UX Design System](./18_UI_UX_Design_System.md)
