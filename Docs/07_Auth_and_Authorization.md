# Doc 07 — Auth & Authorization

**Document ID:** PULSE-DOC-07
**Version:** 1.1
**Status:** Draft
**Last Updated:** August 3, 2026
**Author:** Pulse Engineering Team
**Depends On:** [Doc 04 (Architecture)](./04_System_Architecture.md), [Doc 05 (Database)](./05_Database_Design.md)

---

## Table of Contents

1. [Authentication Strategy & Flows](#1-authentication-strategy--flows)
2. [Session Management (JWT & Cookies)](#2-session-management-jwt--cookies)
3. [Two-Factor Authentication (2FA)](#3-two-factor-authentication-2fa)
4. [Industry-Agnostic RBAC Engine](#4-industry-agnostic-rbac-engine)
5. [The Role Hierarchy (Global vs. Project)](#5-the-role-hierarchy-global-vs-project)
6. [Team-Based Access Control](#6-team-based-access-control)
7. [Comprehensive Permission Matrix](#7-comprehensive-permission-matrix)
8. [Composite Permission Evaluation (The Guard)](#8-composite-permission-evaluation-the-guard)

---

## 1. Authentication Strategy & Flows

Pulse supports multiple authentication vectors, designed for both small contractors and enterprise conglomerates.

### 1.1 Standard Email & Password
- **Registration:** Open to the public. Creates a new `User` and a new `Organization`.
- **Security:** Passwords hashed using `Argon2id` (memory-hard, resistant to GPU cracking).
- **Verification:** Requires email verification before the account becomes active (via magic link).

### 1.2 OAuth 2.0 (Social/Business SSO)
- **Providers:** Google Workspace, Microsoft Entra ID (Azure AD), Apple.
- **Account Linking:** If a user logs in via Google with `david@mitchell.com` and an account already exists for that email, the system automatically links the `googleId` to the existing account rather than throwing an error.

### 1.3 Enterprise SAML / SSO
- **Providers:** Okta, PingIdentity, Active Directory.
- **JIT (Just-In-Time) Provisioning:** When an enterprise user logs in via SAML for the first time, Pulse automatically creates their `User` record, assigns them to their enterprise `Organization`, and maps their SAML groups to Pulse `Roles` (e.g., AD Group "Project Managers" = Pulse Role "MANAGER").

### 1.4 The Multi-Tenant Login Flow
Because a single `User` can belong to multiple `Organizations` (e.g., a subcontractor working for multiple GCs), the login flow is bifurcated:
1. Client sends credentials or OAuth code to `/api/v1/auth/login`.
2. Backend authenticates the user and checks the `memberships` collection.
3. **If 1 Membership:** The server immediately issues an Access Token and Refresh Token scoped to that organization.
4. **If > 1 Memberships:** The server returns a `202 Accepted` with an "Org-Selection Token". The UI displays an organization picker. The user selects an org, sends the Org-Selection Token + `organizationId` to `/api/v1/auth/select-org`, and receives the final Access/Refresh tokens.

---

## 2. Session Management (JWT & Cookies)

Pulse is strictly stateless on the API level. State is managed via tokens.

### 2.1 The Access Token
- **Format:** JWT signed using RS256 (asymmetric keys) so microservices can verify tokens using the public key without hitting the auth service.
- **Lifespan:** 15 Minutes.
- **Storage:** Kept only in client-side memory.
- **Payload:**
```json
{
  "sub": "user_123",            // The global User ID
  "org": "org_789",             // The active Organization ID
  "role": "MANAGER",            // The Organization-level default role
  "iat": 1700000000,
  "exp": 1700000900
}
```

### 2.2 The Refresh Token
- **Format:** Opaque cryptographic string (e.g., `rt_8f9a2b...`).
- **Lifespan:** 7 Days (Sliding window: resets to 7 days upon use).
- **Storage:** `HttpOnly`, `Secure`, `SameSite=Strict` Cookie. (Impervious to XSS attacks).
- **Rotation:** Every time `/api/v1/auth/refresh` is called, the old token is deleted from the DB and a new cookie is issued.
- **Revocation:** Because refresh tokens are stored in the database (`refresh_tokens` collection), admins can instantly kill a user's session by deleting their token.

---

## 3. Two-Factor Authentication (2FA)

Given the sensitive nature of financial data, 2FA is critical.

### 3.1 TOTP (Time-Based One-Time Password)
- Generated via Authenticator apps. 
- During setup, the backend generates a secret, stores it encrypted in the `users.twoFactorSecret` field, and returns a QR code (otpauth URI).

### 3.2 Administrative Enforcement
- In Org Settings, an owner can toggle `enforce2FAForAdmins: true`.
- If true, any user possessing the `OWNER`, `ADMIN`, or `MANAGER` role will be intercepted upon login. If `users.twoFactorEnabled` is false, they are forced to complete setup before being issued a valid Access Token.

---

## 4. Industry-Agnostic RBAC Engine

The permission engine is completely decoupled from the Tree Architecture branches. **The engine only evaluates strings.** It does not know what "Construction" or "Agriculture" is.

- A permission is a string: `resource:action`.
- A role is just an array of these strings.
- If the Construction branch creates a new feature (e.g., Change Orders), the branch simply registers new strings (e.g., `con_change_order:create`) into the global RBAC registry on startup.
- The Core RBAC engine simply checks if the user's role array includes the required string.

---

## 5. The Role Hierarchy (Global vs. Project)

Access control operates on two distinct axes: Organization (Global) and Project (Local).

### 5.1 The 6 Immutable Default Roles

| Role | Scope | Description |
|---|---|---|
| **OWNER** | Global | Full access. Can manage billing and delete the workspace. Automatically bypasses all permission checks. |
| **ADMIN** | Global | Full access (except billing/delete org). Manages users, integrations, and global settings. |
| **MANAGER** | Project | Can view budgets, financials, and manage team assignments within their projects. |
| **SUPERVISOR**| Project | Field leadership. Manages tasks, daily reports, equipment, and documents. Cannot see financials. |
| **WORKER** | Project | Field execution. Can view their own tasks, submit daily reports, and view documents. |
| **CONTRACTOR**| Project | External users. Can only see tasks/documents explicitly shared with them. Can submit invoices. |

### 5.2 Contextual Override (How Global & Local interact)
A user is assigned a Global Role in the `memberships` collection. However, they can also be explicitly assigned a Local Role on a specific project.

**Example Scenario:**
- David is a `WORKER` globally (he shouldn't see all company data).
- But David is assigned as the `SUPERVISOR` on "Project Delta".
- When David requests a resource for "Project Delta", the RBAC engine uses the `SUPERVISOR` role.
- When David requests a resource for "Project Echo", the engine falls back to his global `WORKER` role.

---

## 6. Team-Based Access Control

Managing permissions for 500 individual users is impossible. Pulse supports **Teams**.

### 6.1 Team Structure
- A `Team` is an entity (e.g., "Concrete Crew A", "Electrical Supervisors").
- Users are assigned to Teams.
- Teams are assigned to Projects with a specific Role.

### 6.2 Permission Inheritance
If User A is in "Concrete Crew A", and "Concrete Crew A" is assigned to "Project Delta" with the role `SUPERVISOR`, then User A effectively has the `SUPERVISOR` role on "Project Delta".
- If a user has a direct project role AND a team project role, the **most permissive** role wins.

---

## 7. Comprehensive Permission Matrix

Below is the exhaustive list of granular permissions evaluated by the engine. Custom Roles (Enterprise tier) are built by selecting from this list.

### 7.1 ROOT Layer (Platform Foundation)
| Permission | Description | Assigned Defaults |
|---|---|---|
| `org:read` | View organization profile | ALL |
| `org:update` | Update organization settings | OWNER, ADMIN |
| `org:delete` | Delete the workspace | OWNER |
| `billing:manage` | Access Stripe billing portal | OWNER |
| `user:invite` | Send email invitations | OWNER, ADMIN, MANAGER |
| `user:manage_roles`| Change user or team roles | OWNER, ADMIN |
| `team:manage` | Create/edit teams | OWNER, ADMIN |

### 7.2 TRUNK Layer (Shared Core)
| Permission | Description | Assigned Defaults |
|---|---|---|
| `project:create` | Create a new project | OWNER, ADMIN, MANAGER |
| `project:read` | View project details | ALL |
| `project:update` | Edit project metadata | OWNER, ADMIN, MANAGER |
| `project:delete` | Archive/delete project | OWNER, ADMIN |
| `task:create` | Create tasks | ADMIN, MANAGER, SUPERVISOR |
| `task:read` | View tasks | ALL |
| `task:update` | Edit/assign tasks | ADMIN, MANAGER, SUPERVISOR |
| `task:delete` | Delete tasks | ADMIN, MANAGER |
| `report:create` | Submit daily reports | ALL (except CONTRACTOR) |
| `report:read` | View daily reports | ALL |
| `report:approve` | Approve a submitted report | ADMIN, MANAGER |
| `report:amend` | Edit an approved report | ADMIN |
| `document:upload` | Upload files | ADMIN, MANAGER, SUPERVISOR |
| `document:read` | View/download files | ALL |
| `document:delete` | Delete files | ADMIN, MANAGER |
| `document:approve`| Approve workflow docs | ADMIN, MANAGER |
| `equipment:manage`| Add/edit/delete equipment | ADMIN, MANAGER |

### 7.3 BRANCH Layer (Construction Vertical)
*These permissions are registered dynamically by the branch on startup.*
| Permission | Description | Assigned Defaults |
|---|---|---|
| `con_finance:read` | View budget, actuals, committed | OWNER, ADMIN, MANAGER |
| `con_finance:write`| Edit cost codes, budget | OWNER, ADMIN, MANAGER |
| `con_co:create` | Create change orders | ADMIN, MANAGER |
| `con_co:approve` | Approve change orders | OWNER, ADMIN |
| `con_safety:create`| Log safety incidents | ALL (except CONTRACTOR) |
| `con_safety:investigate`| Fill OSHA 300 details | ADMIN, MANAGER, SUPERVISOR |
| `con_coi:manage` | Manage sub insurance | ADMIN, MANAGER |
| `con_po:manage` | Manage purchase orders | ADMIN, MANAGER |

---

## 8. Composite Permission Evaluation (The Guard)

In NestJS, authorization is enforced via a Custom Guard (`@RequirePermissions('task:delete')`). The evaluation logic is complex but highly optimized.

### 8.1 The Evaluation Algorithm

When a request hits `DELETE /api/v1/trunk/tasks/123`:

1. **Guard Intercepts:** Reads required permission (`task:delete`).
2. **Extract Context:** Pulls `userId`, `orgId`, and `globalRole` from JWT.
3. **Owner/Admin Bypass:** If `globalRole` == `OWNER` or `ADMIN`, grant access immediately.
4. **Determine Scope:** Parses the request (URL/body) to find the `projectId` the task belongs to.
5. **Resolve Role:**
   - Query Redis cache for the user's explicit Project Role on that `projectId`.
   - Query Redis cache for the user's Team-based Project Roles on that `projectId`.
   - If no project-level roles exist, fall back to the `globalRole`.
6. **Evaluate Permission:** Does the resolved Role contain `task:delete`?
   - If YES → `Next()` (Proceed to controller).
   - If NO → Throw `403 Forbidden` (`{"error": "Missing permission: task:delete"}`).

### 8.2 Redis Caching for Performance
To prevent RBAC checks from adding 50ms of database latency to every API call, a user's entire permission matrix (Global Role + all explicit Project Roles + all Team Roles) is calculated at login and cached in Redis. 

- **Key:** `permissions:{orgId}:{userId}`
- **Invalidation:** Automatically flushed if an Admin changes the user's role, adds them to a team, or modifies a custom role definition.

---

## Document Changelog

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | August 3, 2026 | Pulse Engineering Team | Initial document creation |
| 1.1 | August 3, 2026 | Pulse Engineering Team | Expanded Teams, SSO flows, and full Permission Matrix. |

---

> **Previous Document:** [Doc 06 — API Design](./06_API_Design.md)
> **Next Document:** [Doc 08 — Cloud Infrastructure](./08_Cloud_Infrastructure.md)
