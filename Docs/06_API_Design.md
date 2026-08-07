# Doc 06 — API Design

**Document ID:** PULSE-DOC-06
**Version:** 1.0
**Status:** Draft
**Last Updated:** August 3, 2026
**Author:** Pulse Engineering Team
**Depends On:** [Doc 04 (Architecture)](./04_System_Architecture.md), [Doc 05 (Database)](./05_Database_Design.md)

---

## Table of Contents

1. [API Paradigm & Standards](#1-api-paradigm--standards)
2. [Authentication & Multi-Tenancy](#2-authentication--multi-tenancy)
3. [Routing Architecture (The Tree)](#3-routing-architecture-the-tree)
4. [Standard Request & Response Formats](#4-standard-request--response-formats)
5. [Pagination, Filtering, & Sorting](#5-pagination-filtering--sorting)
6. [Endpoint Examples by Layer](#6-endpoint-examples-by-layer)
7. [Error Handling Codes](#7-error-handling-codes)
8. [Rate Limiting](#8-rate-limiting)

---

## 1. API Paradigm & Standards

Pulse provides a **RESTful JSON API** built on NestJS. 

- **Base URL:** `https://api.pulseos.com`
- **Versioning:** All endpoints must be versioned in the URL path (e.g., `/api/v1/...`).
- **Stateless:** The API is completely stateless. No session state is held on the server; all required state is embedded in the JWT.
- **Content-Type:** All requests and responses must use `application/json` (except for direct file uploads which use `multipart/form-data` or pre-signed S3 URLs).
- **Naming Conventions:** 
  - URLs must use kebab-case (e.g., `/daily-reports`).
  - JSON payloads must use camelCase (e.g., `startDate`, `targetEndDate`).

---

## 2. Authentication & Multi-Tenancy

### 2.1 Authentication Header
Every secure endpoint requires a JWT access token passed via the Authorization header:
```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

### 2.2 Implicit Multi-Tenancy
To guarantee security and prevent tenant data leakage, **clients must NEVER send `organizationId` in the JSON payload or URL parameters** (unless querying across multiple organizations as a global admin).

1. The user logs in and selects an organization.
2. The server issues a JWT containing `{ "sub": "userId", "org": "organizationId", "role": "MANAGER" }`.
3. The NestJS API middleware extracts `org` from the token and injects it into the Request Context.
4. All database queries and writes automatically append this `organizationId`.

If a client includes `"organizationId": "123"` in a `POST /projects` payload, the API validation layer must **strip and ignore it**.

---

## 3. Routing Architecture (The Tree)

To maintain the physical separation of the Tree Architecture (Root, Trunk, Branch), API routes are strictly prefixed based on their layer.

### 3.1 `root/` Namespace
Handles global concepts that span across organizations or manage the organization itself.
- `POST /api/v1/root/auth/login`
- `GET /api/v1/root/users/me`
- `POST /api/v1/root/organizations`
- `GET /api/v1/root/organizations/:id/memberships`

### 3.2 `trunk/` Namespace
Handles shared domain objects used by all industries.
- `GET /api/v1/trunk/projects`
- `POST /api/v1/trunk/tasks`
- `PATCH /api/v1/trunk/daily-reports/:id`
- `GET /api/v1/trunk/documents`

### 3.3 `branch/{industry}/` Namespace
Handles logic completely specific to one industry.
- `POST /api/v1/branch/construction/safety-incidents`
- `GET /api/v1/branch/construction/change-orders/:id`
- `PATCH /api/v1/branch/construction/coi/:id`

---

## 4. Standard Request & Response Formats

### 4.1 Success Response Wrapper
All `2xx` responses must be wrapped in a standard Envelope:

```json
{
  "success": true,
  "data": { ... }, 
  "meta": { ... } // Optional (used for pagination, rate limit info, etc.)
}
```

### 4.2 Error Response Wrapper
All `4xx` and `5xx` responses must follow RFC 7807 (Problem Details for HTTP APIs) format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED", // Machine-readable string code
    "message": "Invalid payload provided.", // Human-readable fallback
    "details": [
      {
        "field": "budget",
        "issue": "Must be an integer representing cents."
      },
      {
        "field": "extensions.contractType",
        "issue": "Must be one of [LUMP_SUM, GMP, COST_PLUS]."
      }
    ]
  }
}
```

---

## 5. Pagination, Filtering, & Sorting

### 5.1 Pagination
All list endpoints (`GET` returning arrays) must support pagination. We use **Offset/Limit pagination** for standard lists and **Cursor pagination** for high-volume streams (like the audit log or task feeds).

**Query Params:**
- `?page=1` (default: 1)
- `?limit=20` (default: 20, max: 100)

**Response Meta Object:**
```json
"meta": {
  "pagination": {
    "total": 145,
    "page": 1,
    "limit": 20,
    "totalPages": 8,
    "hasNextPage": true
  }
}
```

### 5.2 Filtering
Filters are passed as URL query parameters. For exact matches, use standard keys. For operators, use bracket syntax `[operator]`.

- **Exact match:** `?status=ACTIVE&priority=HIGH`
- **Operators:** `?budget[gte]=1000000&createdAt[lt]=2026-01-01`
- **In Array:** `?assigneeIds[in]=user_1,user_2`

### 5.3 Sorting
Sort is defined by the `sort` query parameter, using a comma-separated list. Prefix with `-` for descending order.
- `?sort=-createdAt,priority` (Sort by newest first, then by priority ascending)

---

## 6. Endpoint Examples by Layer

### 6.1 TRUNK: Create a Project (Demonstrating Extensions)

**Request:** `POST /api/v1/trunk/projects`
Notice how the client sends both generic trunk fields and the `extensions` object. The API validates `extensions` dynamically based on the user's organization industry.

```json
{
  "name": "Downtown Highrise",
  "description": "50-story commercial building",
  "startDate": "2026-09-01T00:00:00Z",
  "budget": 5000000000,
  "managerIds": ["user_123"],
  "extensions": {
    "buildingType": "COMMERCIAL",
    "contractType": "GMP",
    "totalAreaSqFt": 450000
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "proj_999",
    "organizationId": "org_789",
    "name": "Downtown Highrise",
    "status": "DRAFT",
    "budget": 5000000000,
    "extensions": {
      "buildingType": "COMMERCIAL",
      "contractType": "GMP",
      "totalAreaSqFt": 450000
    },
    "createdAt": "2026-08-04T01:30:00Z",
    "updatedAt": "2026-08-04T01:30:00Z"
  }
}
```

### 6.2 BRANCH: Log a Construction Safety Incident

**Request:** `POST /api/v1/branch/construction/safety-incidents`

```json
{
  "projectId": "proj_999",
  "incidentType": "INJURY",
  "severity": "HIGH",
  "dateOccurred": "2026-08-03T14:30:00Z",
  "description": "Worker fell from scaffolding on level 3.",
  "oshaRecordable": true,
  "injuryDetails": {
    "bodyPartAffected": "Right Leg",
    "injuryType": "Fracture",
    "wasHospitalized": true,
    "daysAwayFromWork": 14
  }
}
```

---

## 7. Error Handling Codes

Standard HTTP status codes are strictly enforced.

| Status Code | When to use |
|---|---|
| `200 OK` | Successful GET, PUT, PATCH, or DELETE (if returning data). |
| `201 Created` | Successful POST creating a new resource. |
| `204 No Content` | Successful DELETE (when returning no data). |
| `400 Bad Request` | Payload validation failed (e.g., Zod schema rejection). |
| `401 Unauthorized` | Missing, expired, or invalid JWT. |
| `403 Forbidden` | Valid JWT, but user lacks RBAC permission for this specific action. |
| `404 Not Found` | Resource doesn't exist, OR it exists but belongs to a different Organization (to prevent ID enumeration). |
| `409 Conflict` | E.g., Creating an organization slug that already exists, or editing an approved Daily Report without amendment rights. |
| `429 Too Many Requests` | Rate limit exceeded. |
| `500 Internal Server Error` | Unhandled exception (logs to Sentry/Datadog). |

---

## 8. Rate Limiting

Rate limiting is enforced at the API Gateway level (e.g., using Redis).

- **Global Limit:** 300 requests per minute per IP.
- **Auth Endpoints:** (`/login`, `/register`, `/forgot-password`): 10 requests per minute per IP.
- **Heavy Endpoints:** (e.g., PDF generation, AI querying): 30 requests per minute per User ID.
- **Headers:** All responses include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` headers.

---

## Document Changelog

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | August 3, 2026 | Pulse Engineering Team | Initial document creation |

---

> **Previous Document:** [Doc 05 — Database Design](./05_Database_Design.md)
> **Next Document:** [Doc 07 — Auth & Authorization](./07_Auth_and_Authorization.md)
