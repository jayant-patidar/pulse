# Doc 01 — Product Requirements Document (PRD)

**Document ID:** PULSE-DOC-01
**Version:** 1.0
**Status:** Draft
**Last Updated:** August 3, 2026
**Author:** Pulse Engineering Team
**Depends On:** [Doc 00 — Vision & Product Strategy](./00_Vision_and_Product_Strategy.md)

---

## Table of Contents

1. [Document Purpose](#1-document-purpose)
2. [Architecture Layer Reference](#2-architecture-layer-reference)
3. [ROOT Layer — Platform Foundation](#3-root-layer--platform-foundation)
   - R1: Authentication & Identity
   - R2: Multi-Tenancy & Organization Management
   - R3: Role-Based Access Control (RBAC)
   - R4: Notification Engine
   - R5: Audit Logging
   - R6: File Storage Engine
   - R7: Real-Time Engine
4. [TRUNK Layer — Shared Domain Modules](#4-trunk-layer--shared-domain-modules)
   - T1: User & Workforce Management
   - T2: Project Management
   - T3: Site Operations (Daily Reports)
   - T4: Task & Workflow Management
   - T5: Document Management
   - T6: Equipment Management
   - T7: AI Engine
   - T8: Search Engine
   - T9: Dashboard & Analytics
5. [BRANCH Layer — Construction Vertical](#5-branch-layer--construction-vertical)
   - C1: Construction Safety
   - C2: Construction Procurement & Materials
   - C3: Construction Finance
   - C4: Contractor Portal (Subcontractor Management)
   - C5: Client Portal
   - C6: Construction-Specific Extensions
6. [Cross-Cutting Concerns](#6-cross-cutting-concerns)
7. [Feature Priority Matrix](#7-feature-priority-matrix)
8. [Glossary](#8-glossary)

---

## 1. Document Purpose

This Product Requirements Document defines **every feature, workflow, and module** in Pulse, organized by the Tree Architecture layers (Root, Trunk, Branch). Each feature includes:

- **Description** — What it does and why it matters
- **Real-World Problem** — The specific pain point it solves
- **User Stories** — Who needs it and how they use it
- **Acceptance Criteria** — How we know it's done correctly
- **Business Rules** — Constraints and logic that govern behavior

This PRD serves as the single source of truth for what Pulse does. All subsequent documents (functional requirements, database design, API design, etc.) derive from this document.

---

## 2. Architecture Layer Reference

| Layer | Code | What Lives Here | Rule |
|---|---|---|---|
| **Root** | R | Auth, multi-tenancy, RBAC, notifications, audit, file storage, real-time engine | Never changes when adding a new industry |
| **Trunk** | T | Users, projects, tasks, daily reports, documents, equipment, AI engine, search, dashboards | Never changes when adding a new industry |
| **Branch** | C | Construction-specific: safety, procurement, finance, contractor portal, client portal, extensions | Independent. Adding agriculture never touches construction. |

> [!IMPORTANT]
> Every requirement in this document is tagged with its layer (R, T, or C). If a requirement is tagged R or T, it **must** be industry-agnostic. If tagged C, it lives exclusively in the construction branch.

---

## 3. ROOT Layer — Platform Foundation

The Root layer contains foundational services that every industry vertical depends on. These services are completely industry-agnostic — they have no knowledge of construction, agriculture, or any specific domain.

---

### R1: Authentication & Identity

#### Real-World Problem

Field-based companies need secure access to operational data from the office, the job site, and on the road. Workers use shared tablets on-site, managers use laptops at the office, and owners check dashboards from their phones at dinner. Authentication must handle all of these scenarios securely while remaining simple enough that a tradesperson with muddy gloves can log in.

#### Features

##### R1.1 — Email/Password Registration

**Description:** Users can create an account using email and password.

**User Stories:**
- *As a company owner, I want to register my company on Pulse so that I can start managing my operations digitally.*
- *As an invited employee, I want to create my account using the invitation link I received so that I can access my company's workspace.*

**Acceptance Criteria:**
- [ ] User can register with email, password, first name, and last name
- [ ] Email must be unique across the entire platform
- [ ] Password must be at least 12 characters with at least one uppercase, one lowercase, one number, and one special character
- [ ] Email verification is required before the account is fully activated
- [ ] Verification email contains a time-limited token (expires in 24 hours)
- [ ] Registration creates a pending user record; activation completes it
- [ ] Rate limiting: maximum 5 registration attempts per IP per hour

**Business Rules:**
- A user can belong to multiple organizations (e.g., a subcontractor working with multiple GCs)
- Registration alone does not grant access to any organization — invitation or org creation is required
- Disposable email domains are blocked

---

##### R1.2 — Login & Session Management

**Description:** Authenticated login with JWT tokens and secure session handling.

**User Stories:**
- *As a site supervisor, I want to log in quickly on my phone at 6 AM so that I can check today's tasks before the crew arrives.*
- *As a project manager, I want to stay logged in on my work laptop so that I don't waste time re-authenticating throughout the day.*

**Acceptance Criteria:**
- [ ] Login accepts email + password and returns access token (JWT) + refresh token
- [ ] Access token expires in 15 minutes; refresh token expires in 7 days
- [ ] Refresh token rotation: each refresh invalidates the previous token
- [ ] Failed login attempts are rate-limited (5 attempts, then 15-minute lockout)
- [ ] User can log in from multiple devices simultaneously
- [ ] User can view active sessions and revoke any session
- [ ] "Remember me" option extends refresh token to 30 days

**Business Rules:**
- Tokens contain: userId, organizationId, role, permissions
- All tokens are signed with RS256
- Refresh tokens are stored securely (HTTP-only cookies or secure storage)

---

##### R1.3 — OAuth / Social Login

**Description:** Login via Google, Microsoft, and Apple for faster onboarding.

**User Stories:**
- *As a new user, I want to sign up with my Google account so that I don't need to remember another password.*

**Acceptance Criteria:**
- [ ] Google OAuth 2.0 login is supported
- [ ] Microsoft OAuth 2.0 login is supported
- [ ] Apple Sign In is supported
- [ ] OAuth users can optionally set a password later
- [ ] If an OAuth email matches an existing email/password account, the accounts are linked (with user consent)

---

##### R1.4 — Password Reset

**Description:** Self-service password recovery via email.

**User Stories:**
- *As a user who forgot my password, I want to reset it via email so that I can regain access to my account.*

**Acceptance Criteria:**
- [ ] "Forgot password" sends a reset link to the registered email
- [ ] Reset token expires in 1 hour
- [ ] Reset link is single-use — once used, it cannot be used again
- [ ] After reset, all existing sessions are invalidated
- [ ] Rate limiting: maximum 3 reset requests per email per hour

---

##### R1.5 — Two-Factor Authentication (2FA)

**Description:** Optional 2FA for enhanced security, required for admin roles.

**User Stories:**
- *As a company owner, I want to require 2FA for all admin users so that our company data is protected even if a password is compromised.*

**Acceptance Criteria:**
- [ ] Users can enable TOTP-based 2FA (Google Authenticator, Authy)
- [ ] Organization admins can enforce 2FA for specific roles
- [ ] Backup codes are generated (10 single-use codes) when 2FA is enabled
- [ ] 2FA can be disabled only by the user (with current password) or by an org admin

---

### R2: Multi-Tenancy & Organization Management

#### Real-World Problem

Every construction company, HVAC business, or solar installer is a separate entity with its own employees, projects, and data. A single Pulse instance serves thousands of these companies simultaneously. Each company must feel like they have their own private system while sharing infrastructure. Company owners need to manage their team — invite employees, assign roles, configure settings — without contacting Pulse support.

#### Features

##### R2.1 — Organization Creation

**Description:** When a user registers, they can create a new organization (company workspace).

**User Stories:**
- *As a construction company owner, I want to create my company's workspace on Pulse so that my team can start using the platform.*

**Acceptance Criteria:**
- [ ] User provides: company name, industry (selected from a predefined list), company size range, timezone, currency
- [ ] The creating user automatically becomes the Organization Owner (highest role)
- [ ] A unique organization slug is generated (e.g., `mitchell-construction`)
- [ ] Organization gets a default set of roles (Owner, Admin, Manager, Supervisor, Worker, Client)
- [ ] Default notification preferences are created
- [ ] The `industry` field is a discriminator used by the Tree Architecture to load the correct branch modules

**Business Rules:**
- One user can own multiple organizations
- Organization names are not required to be globally unique (slugs are)
- The `industry` field determines which branch modules, extensions, and UI components are loaded
- Industry can be changed only by the Owner (with a confirmation flow)

---

##### R2.2 — Organization Profile & Settings

**Description:** Admins can configure company-wide settings.

**User Stories:**
- *As a company admin, I want to set my company's timezone and currency so that all dates and financial data display correctly for my team.*

**Acceptance Criteria:**
- [ ] Editable fields: company name, logo, address, phone, email, website, timezone, currency, date format, fiscal year start
- [ ] Settings are applied globally to all users within the organization
- [ ] Logo upload supports PNG/JPG up to 5MB; image is cropped to square
- [ ] Changes to settings are audit-logged

---

##### R2.3 — User Invitation System

**Description:** Organization admins invite users to join the company workspace.

**User Stories:**
- *As a project manager, I want to invite my team members to Pulse so that they can access project data and submit daily reports.*
- *As an invited user, I want to accept the invitation and join my company's workspace so that I can start working.*

**Acceptance Criteria:**
- [ ] Admin sends invitation by entering: email address, role, and optional project assignments
- [ ] System sends an invitation email with a secure, time-limited link (expires in 7 days)
- [ ] If the invited email already has a Pulse account, they are added to the organization upon acceptance
- [ ] If the invited email does not have an account, they are prompted to register and are then added
- [ ] Pending invitations are visible to admins (with status: pending, accepted, expired)
- [ ] Admins can resend or revoke pending invitations
- [ ] Bulk invitation via CSV upload is supported (email, role, name)
- [ ] Maximum 500 pending invitations per organization

**Business Rules:**
- A user can be a member of multiple organizations simultaneously
- Each membership has its own role (user can be Admin in Org A, Worker in Org B)
- Invitation email includes the organization name, inviter's name, and role being assigned

---

##### R2.4 — Team Management

**Description:** Users can be organized into teams within an organization.

**User Stories:**
- *As a project manager, I want to create teams (e.g., "Electrical Team", "Concrete Crew") so that I can assign work to groups instead of individuals.*

**Acceptance Criteria:**
- [ ] Admins and managers can create, edit, and archive teams
- [ ] Teams have: name, description, team lead (user reference), members (user references)
- [ ] A user can belong to multiple teams
- [ ] Teams can be assigned to projects (team-project association)
- [ ] Team membership changes are audit-logged

---

##### R2.5 — Data Isolation

**Description:** Each organization's data is completely isolated from other organizations.

**Acceptance Criteria:**
- [ ] Every database document includes an `organizationId` field
- [ ] All API queries are automatically scoped to the requesting user's organization
- [ ] No API endpoint can return data from a different organization
- [ ] Organization isolation is enforced at the middleware level (not dependent on individual developers)
- [ ] Cross-organization data access is impossible even with direct database access (except by system admins)

---

### R3: Role-Based Access Control (RBAC)

#### Real-World Problem

In a construction company, the owner needs to see everything. The project manager needs to see their projects. The site supervisor needs to manage daily reports and tasks. The worker needs to see their assignments. The client needs to see progress and invoices — but nothing else. A subcontractor needs to see only the work orders assigned to them. Permissions must be granular enough to handle these scenarios without being so complex that admins can't manage them.

#### Features

##### R3.1 — Default Role System

**Description:** Every organization has a default set of roles with pre-configured permissions.

**User Stories:**
- *As a company owner, I want my organization to come with sensible default roles so that I don't need to configure permissions from scratch.*

**Default Roles:**

| Role | Level | Description |
|---|---|---|
| **Owner** | Organization | Full access to everything. Can delete the organization. Can manage billing. |
| **Admin** | Organization | Full access except organization deletion and billing. Can manage users, roles, settings. |
| **Manager** | Organization/Project | Can manage projects, view all project data, manage team members within assigned projects. |
| **Supervisor** | Project | Can manage daily reports, tasks, and field operations within assigned projects. |
| **Worker** | Project | Can view assigned tasks, submit daily activity, report safety concerns, view documents. |
| **Client** | Project | Read-only access to project progress, photos, documents, and invoices for their projects. |

**Acceptance Criteria:**
- [ ] Default roles are created automatically when an organization is created
- [ ] Each role maps to a set of permissions (e.g., `project:create`, `task:assign`, `report:submit`)
- [ ] Roles can be viewed by admins with their permission sets
- [ ] Roles are scoped: organization-level roles (Owner, Admin) and project-level roles (Manager, Supervisor, Worker, Client)

---

##### R3.2 — Custom Role Creation

**Description:** Admins can create custom roles with specific permission sets.

**User Stories:**
- *As a company admin, I want to create a "Safety Officer" role that can manage safety reports across all projects but cannot access financial data.*

**Acceptance Criteria:**
- [ ] Admins can create custom roles with a name and description
- [ ] Permissions are selected from a categorized list (e.g., Projects, Tasks, Documents, Finance, Safety)
- [ ] Custom roles can be assigned to users just like default roles
- [ ] Custom roles can be edited and deleted (users with deleted roles revert to a default role)
- [ ] Maximum 20 custom roles per organization

---

##### R3.3 — Permission System

**Description:** Granular permissions that control access to every resource and action.

**Permission Categories:**

| Category | Example Permissions |
|---|---|
| **Organization** | `org:settings:edit`, `org:users:invite`, `org:users:remove`, `org:roles:manage` |
| **Projects** | `project:create`, `project:edit`, `project:delete`, `project:view`, `project:archive` |
| **Tasks** | `task:create`, `task:assign`, `task:edit`, `task:delete`, `task:view`, `task:status:update` |
| **Daily Reports** | `report:create`, `report:edit`, `report:view`, `report:approve`, `report:delete` |
| **Documents** | `document:upload`, `document:view`, `document:delete`, `document:share`, `document:approve` |
| **Equipment** | `equipment:create`, `equipment:edit`, `equipment:view`, `equipment:assign`, `equipment:maintenance` |
| **Finance** | `finance:view`, `finance:edit`, `finance:approve`, `finance:export` |
| **Safety** | `safety:report:create`, `safety:report:view`, `safety:inspection:create`, `safety:inspection:approve` |
| **AI** | `ai:query`, `ai:document:process`, `ai:settings:manage` |

**Acceptance Criteria:**
- [ ] Every API endpoint checks the requesting user's permissions before executing
- [ ] Permission checks are performed at the middleware/guard level
- [ ] Insufficient permissions return `403 Forbidden` with a clear error message
- [ ] Permission inheritance: project-level permissions are additive on top of organization-level permissions
- [ ] Permissions are checked for both the resource type and the specific resource instance (e.g., "can this user edit *this specific* project?")

---

### R4: Notification Engine

#### Real-World Problem

Field workers miss critical updates because information is buried in WhatsApp groups with 200 messages. A delayed material delivery notification sent by email at 3 PM means the concrete crew shows up to an empty site the next morning. Notifications need to reach the right person, through the right channel, at the right time.

#### Features

##### R4.1 — Multi-Channel Notifications

**Description:** Notifications are delivered through multiple channels based on urgency and user preference.

**User Stories:**
- *As a site supervisor, I want to receive a push notification when a material delivery is delayed so that I can adjust tomorrow's work plan.*
- *As a project manager, I want to receive a daily email summary of all reports submitted across my projects so that I don't miss anything.*

**Channels:**

| Channel | Use Case | Priority |
|---|---|---|
| **In-App** | All notifications — the primary channel | Default |
| **Push (Mobile)** | Urgent: safety incidents, assignment changes, deadline reminders | High |
| **Email** | Summaries, reports, invitation links, password resets | Medium |
| **SMS** | Critical: safety emergencies, system-down alerts (future) | Critical |

**Acceptance Criteria:**
- [ ] Every notification is stored in-app (persistent notification center)
- [ ] Users can configure channel preferences per notification type
- [ ] In-app notifications show as a badge count and a dropdown list
- [ ] Notifications are marked as read/unread
- [ ] Bulk "mark all as read" is supported
- [ ] Push notifications are delivered via FCM (Android) and APNs (iOS)
- [ ] Email notifications are batched (digest) or immediate based on user preference
- [ ] Notification templates are configurable (title, body, link)

---

##### R4.2 — Notification Types

**Description:** The platform generates notifications for all critical events.

**Notification Events:**

| Event | Recipient | Channel | Layer |
|---|---|---|---|
| Task assigned to you | Assignee | In-app, Push | Trunk |
| Task deadline in 24 hours | Assignee | In-app, Push | Trunk |
| Task overdue | Assignee + Manager | In-app, Push, Email | Trunk |
| Daily report submitted | Project Manager | In-app, Email | Trunk |
| Daily report requires approval | Approver | In-app, Push | Trunk |
| Document uploaded | Project members | In-app | Trunk |
| Document requires approval | Approver | In-app, Push | Trunk |
| Equipment maintenance due | Equipment manager | In-app, Push, Email | Trunk |
| New comment on your item | Item author/assignee | In-app, Push | Trunk |
| User invited to organization | Invited user | Email | Root |
| Safety incident reported | Safety officer, Manager, Owner | In-app, Push, Email | Branch (C) |
| Material delivery delayed | Site supervisor, PM | In-app, Push | Branch (C) |
| RFI response received | RFI author | In-app, Push, Email | Branch (C) |
| Change order submitted | Approver | In-app, Push, Email | Branch (C) |
| Subcontractor insurance expiring | Admin, PM | In-app, Email | Branch (C) |
| Invoice approved/rejected | Submitter | In-app, Push, Email | Branch (C) |

**Acceptance Criteria:**
- [ ] Each notification type has a configurable template
- [ ] Users can mute specific notification types
- [ ] Organization admins can set mandatory notifications that users cannot mute (e.g., safety incidents)
- [ ] Notifications include a deep link to the relevant resource

---

### R5: Audit Logging

#### Real-World Problem

When a dispute arises on a construction project — and they always do — the company that has a detailed, timestamped record of who did what and when has legal protection. "Who approved this change order?" "Who modified the budget?" "When was this safety report submitted?" These questions need unambiguous answers. Audit logs are also required for compliance in many industries (OSHA, ISO, etc.).

#### Features

##### R5.1 — Comprehensive Audit Trail

**Description:** Every state-changing action in the platform is recorded with immutable audit logs.

**User Stories:**
- *As a company owner, I want to see who modified a project budget and when so that I can investigate a cost overrun.*
- *As a safety officer, I want to prove that a safety inspection was submitted before an incident occurred.*

**Acceptance Criteria:**
- [ ] Every create, update, and delete operation generates an audit log entry
- [ ] Audit log entries contain: timestamp (UTC), userId, organizationId, action (CREATE/UPDATE/DELETE), resource type, resource ID, changes (before/after for updates), IP address, user agent
- [ ] Audit logs are immutable — they cannot be edited or deleted by any user
- [ ] Audit logs are retained for a minimum of 7 years
- [ ] Admins can search audit logs by: user, date range, action type, resource type
- [ ] Audit logs are exportable as CSV or JSON
- [ ] Audit log entries do not contain sensitive data (passwords, tokens)

---

### R6: File Storage Engine

#### Real-World Problem

Construction projects generate thousands of files: photos from the job site, blueprint PDFs, contracts, safety inspection forms, invoices, equipment manuals. These files need to be stored securely, versioned, and accessible from the field on a 4G connection. A site supervisor should be able to snap a photo and have it automatically attached to today's daily report.

#### Features

##### R6.1 — File Upload & Storage

**Description:** Secure file upload with support for various file types and sizes.

**User Stories:**
- *As a site supervisor, I want to upload photos from my phone directly to today's daily report so that progress is documented visually.*
- *As a project manager, I want to upload a 50MB blueprint PDF and have it accessible to the entire project team.*

**Acceptance Criteria:**
- [ ] Supported file types: images (JPG, PNG, HEIC, WebP), documents (PDF, DOCX, XLSX, PPTX), CAD files (DWG, DXF), videos (MP4, MOV, up to 500MB)
- [ ] Maximum file size: 500MB per file
- [ ] Files are uploaded via pre-signed URLs (direct to object storage, bypassing the backend)
- [ ] Upload progress is shown in real-time
- [ ] Images are automatically compressed and thumbnails are generated
- [ ] HEIC images (from iPhone) are automatically converted to JPEG
- [ ] Files are scanned for malware before being accessible
- [ ] Each file is associated with: organizationId, projectId (optional), uploadedBy, uploadedAt, file type, size, and content type

**Business Rules:**
- Storage quotas are enforced per organization based on subscription tier
- Files are stored in object storage (S3-compatible) with server-side encryption
- Deleted files are soft-deleted and permanently removed after 30 days

---

### R7: Real-Time Engine

#### Real-World Problem

When a safety incident happens on a job site, the safety officer, project manager, and company owner need to know immediately — not when they next check their email. When a site supervisor submits a daily report, the dashboard should update live for the PM. Real-time communication ensures that field operations data is actionable, not stale.

#### Features

##### R7.1 — WebSocket Connections

**Description:** Real-time bi-directional communication for live updates.

**Acceptance Criteria:**
- [ ] WebSocket connections are authenticated with JWT tokens
- [ ] Connections are scoped to the user's organization (no cross-tenant data leaks)
- [ ] Events are published to specific channels: user-specific, project-specific, organization-wide
- [ ] Automatic reconnection with exponential backoff on connection loss
- [ ] Heartbeat ping/pong every 30 seconds to detect stale connections
- [ ] Fallback to SSE (Server-Sent Events) or polling if WebSocket is unavailable

**Real-Time Events:**
- Notification received
- Task status changed
- Daily report submitted
- Document uploaded
- Comment added
- Safety incident reported (branch event)
- Equipment status changed

---

## 4. TRUNK Layer — Shared Domain Modules

The Trunk layer contains domain-specific modules that are shared across all industry verticals. These modules define the core concepts of field operations — projects, tasks, reports, documents, equipment — in an industry-agnostic way. Industry-specific data lives in the `extensions` field.

---

### T1: User & Workforce Management

#### Real-World Problem

A construction company with 100 employees has no idea who is available, who is certified for which tasks, where people are assigned, or whose certifications are expiring. The foreman calls around to find an available electrician. HR discovers that a worker's safety certification expired two months ago — after they've been working on a live site. Companies need a living workforce directory that answers: "Who can work, where, and on what?"

#### Features

##### T1.1 — Employee Profiles

**Description:** Comprehensive profiles for each member of the organization.

**User Stories:**
- *As an HR admin, I want to maintain complete profiles for all employees including their skills and certifications so that I can assign the right people to the right projects.*
- *As a project manager, I want to see which employees are available and qualified before assigning them to a project.*

**Acceptance Criteria:**
- [ ] Profile fields: first name, last name, email, phone, avatar/photo, job title, employment type (full-time, part-time, contractor), department, hire date, status (active, on-leave, terminated)
- [ ] Skills: dynamic list of skills (industry-specific skills are loaded from the branch configuration)
- [ ] Certifications: name, issuing authority, issue date, expiry date, document attachment, status (valid, expiring soon, expired)
- [ ] Emergency contact: name, relationship, phone
- [ ] Current project assignments: list of projects the employee is assigned to with their project-level role
- [ ] Availability status: Available, Assigned, On Leave, Unavailable
- [ ] Profile is viewable by the user themselves, their managers, and organization admins

**Business Rules:**
- Certification expiry generates automated notifications at 90, 60, and 30 days before expiry
- Expired certifications are flagged visually (red indicator) on the profile and in project assignments
- Workers with expired mandatory certifications are flagged in compliance reports
- Skills and certification types are configurable per organization (and per industry branch)

---

##### T1.2 — Contractor Management

**Description:** External contractors and freelancers have profiles within the organization but with limited access.

**User Stories:**
- *As a project manager, I want to add subcontractor workers to my project so that they can receive task assignments and submit reports.*

**Acceptance Criteria:**
- [ ] Contractors are invited with a "Contractor" employment type
- [ ] Contractors can be assigned to specific projects only (no organization-wide access)
- [ ] Contractor profiles include: company affiliation, contract terms, insurance status, hourly/daily rate (visible to managers only)
- [ ] Contractors can be deactivated when their contract ends (without deleting their data)

---

##### T1.3 — Attendance & Time Tracking

**Description:** Track when workers arrive, leave, and take breaks on job sites.

**User Stories:**
- *As a site supervisor, I want to log which workers showed up today so that the daily report has accurate headcount data.*
- *As a worker, I want to clock in when I arrive at the job site so that my hours are recorded accurately.*

**Acceptance Criteria:**
- [ ] Workers can clock in/out via the mobile app
- [ ] Optional GPS verification: clock-in location is recorded and compared to project site location
- [ ] Supervisor can manually log attendance for workers without phones
- [ ] Daily attendance summary: present, absent, late, on-leave
- [ ] Attendance data feeds into daily reports automatically
- [ ] Overtime calculation based on organization-configured rules (e.g., >8 hours = overtime)
- [ ] Weekly/monthly attendance reports exportable as CSV

---

### T2: Project Management

#### Real-World Problem

A mid-size construction company manages 5–15 active projects simultaneously. Each project has different teams, timelines, budgets, and clients. The project manager juggles Excel spreadsheets for one project, email threads for another, and has a whiteboard for the third. There's no single view of "what's the status of all my projects?" Progress tracking is based on gut feeling, not data. Budget tracking happens retroactively — by the time the PM knows a project is over budget, the money is already spent.

#### Features

##### T2.1 — Project CRUD

**Description:** Create, view, edit, and archive projects.

**User Stories:**
- *As a project manager, I want to create a new project with all its details so that my team can start organizing work.*
- *As a company owner, I want to see all active projects in a single dashboard so that I have a bird's-eye view of my business.*

**Acceptance Criteria:**
- [ ] Project fields (trunk/generic): name, description, status (Draft, Active, On Hold, Completed, Archived), start date, target end date, actual end date, budget, location (address + GPS coordinates), client (reference to client user or external client name)
- [ ] Project fields (branch/extensions): loaded dynamically based on the organization's industry
- [ ] Projects are created within an organization and scoped by `organizationId`
- [ ] Project list view with sorting (name, status, start date, budget) and filtering (status, date range, manager)
- [ ] Project detail view shows: overview, timeline, team, tasks, reports, documents, equipment, budget
- [ ] Projects can be archived (not deleted) — archived projects are read-only

**Business Rules:**
- Projects cannot be deleted — only archived (to preserve audit trail)
- Budget cannot be negative
- Start date must be before target end date
- Archiving a project archives all associated active tasks

---

##### T2.2 — Project Members

**Description:** Assign users to projects with project-specific roles.

**User Stories:**
- *As a project manager, I want to add my team members to a project so that they can see project data and contribute.*
- *As a company owner, I want to assign a project manager to each project so that there's clear accountability.*

**Acceptance Criteria:**
- [ ] Users are added to projects with a project-level role (Manager, Supervisor, Worker, Client)
- [ ] A project must have at least one Manager
- [ ] Members can be added individually or by team
- [ ] Members see only the projects they are assigned to (unless they have org-level Manager/Admin role)
- [ ] Members can be removed from a project (their contributions remain)

---

##### T2.3 — Milestones

**Description:** Key checkpoints within a project timeline.

**User Stories:**
- *As a project manager, I want to define milestones so that I can track whether the project is hitting its key dates.*
- *As a client, I want to see upcoming milestones so that I know when major deliverables are expected.*

**Acceptance Criteria:**
- [ ] Milestone fields: name, description, target date, actual completion date, status (Upcoming, In Progress, Completed, Missed)
- [ ] Milestones can be linked to tasks (milestone is complete when all linked tasks are complete)
- [ ] Milestones are displayed on a timeline/Gantt view
- [ ] Missed milestones (target date passed, status not Completed) are visually flagged
- [ ] Notifications are sent when a milestone is approaching (configurable: 7, 3, 1 day before)

---

##### T2.4 — Project Dashboard

**Description:** Real-time overview of project health.

**User Stories:**
- *As a project manager, I want a dashboard that shows me the health of my project at a glance — progress, budget, issues, team, and upcoming deadlines.*

**Acceptance Criteria:**
- [ ] Dashboard shows: overall progress (%), budget spent vs. total, milestone status, open issues count, overdue tasks count, recent activity feed, team summary, weather at project location
- [ ] Dashboard data updates in real-time (via WebSocket)
- [ ] Dashboard is the default landing page when opening a project

---

### T3: Site Operations (Daily Reports)

#### Real-World Problem

This is where Pulse becomes **fundamentally different** from generic project management tools. In field operations, the most critical artifact is the **daily report** — a contemporaneous record of what happened on-site each day. OSHA and courts treat daily reports as primary evidence. Yet most companies still do daily reports on paper forms, email them as PDFs, or skip them entirely because the process is too burdensome. The result: critical operational data is lost, disputes can't be resolved, safety incidents can't be analyzed, and managers have no visibility into what happened on-site.

#### Features

##### T3.1 — Daily Report Creation

**Description:** Site supervisors create comprehensive daily reports capturing everything that happened on-site.

**User Stories:**
- *As a site supervisor, I want to create today's daily report in 5–10 minutes on my phone so that I can document progress before I leave the site.*
- *As a project manager, I want to review daily reports from all my sites so that I know what happened today without calling anyone.*

**Acceptance Criteria:**
- [ ] Daily report fields (trunk/generic): date, project reference, created by, weather (condition, temperature, wind, precipitation), worker count (total, by trade/team), hours worked, activities completed (text + categorized), issues encountered (categorized: delay, safety, quality, material, equipment), delays (description, cause, impact), photos (unlimited, with captions and GPS tags), notes/comments
- [ ] Daily report fields (branch/extensions): loaded dynamically from branch config
- [ ] One daily report per project per day (if a second is created for same date, it updates the existing one)
- [ ] Reports can be saved as drafts and published later
- [ ] Published reports cannot be edited (only amended with a note explaining the change)
- [ ] Photos are captured directly from the camera or uploaded from gallery
- [ ] Photos are automatically tagged with GPS coordinates and timestamp
- [ ] Voice-to-text is supported for the notes/comments field
- [ ] Offline mode: reports can be created without internet and synced when connectivity returns

**Business Rules:**
- Daily reports serve as legal documents — once published, they are immutable (amendments are versioned)
- Automatic timestamps prove when the report was created (critical for legal disputes)
- GPS tags on photos prove the supervisor was on-site (critical for compliance)
- Reports older than 48 hours require manager approval to publish (prevents backdating)

---

##### T3.2 — Daily Report Approval Workflow

**Description:** Daily reports can go through an approval workflow before being finalized.

**User Stories:**
- *As a project manager, I want to review and approve daily reports from my supervisors so that I can ensure accuracy before they become part of the official project record.*

**Acceptance Criteria:**
- [ ] Organizations can enable/disable the approval workflow
- [ ] Workflow: Supervisor submits → Manager reviews → Approved / Request Changes
- [ ] "Request Changes" sends the report back to the supervisor with comments
- [ ] Approved reports are locked and cannot be further modified
- [ ] Approval history is audit-logged (who approved, when, any comments)
- [ ] Overdue approvals (not reviewed within 48 hours) generate notifications

---

##### T3.3 — Daily Report History & Search

**Description:** All daily reports are stored and searchable.

**User Stories:**
- *As a company owner, I want to search all daily reports across all projects for mentions of "delay" so that I can identify systemic issues.*
- *As a project manager, I want to view the complete history of daily reports for my project so that I can track progress over time.*

**Acceptance Criteria:**
- [ ] Reports are searchable by: project, date range, author, keywords, weather conditions, issue types
- [ ] Calendar view: see which days have reports (green), which are missing (red)
- [ ] Missing report alerts: if a project has no report for a workday, notify the supervisor and PM
- [ ] Reports can be exported as PDF (individual or batch)
- [ ] AI summarization: generate weekly/monthly summaries from daily reports (see AI Engine)

---

### T4: Task & Workflow Management

#### Real-World Problem

In field operations, "tasks" are not abstract Jira tickets — they are real physical work that needs to happen in a specific sequence, at a specific location, by specific people with specific skills. An electrician can't install panels until the framing is done. A plumber can't run pipes until the electrician finishes the rough-in. Task dependencies in field operations are physical, not just logical. And when a task is blocked, the entire downstream schedule shifts.

#### Features

##### T4.1 — Task CRUD

**Description:** Create, assign, and manage tasks within projects.

**User Stories:**
- *As a project manager, I want to create tasks and assign them to specific workers or teams so that everyone knows what they need to do.*
- *As a worker, I want to see my assigned tasks for today with clear descriptions and any attached documents so that I know exactly what to do.*

**Acceptance Criteria:**
- [ ] Task fields (trunk/generic): title, description, project reference, status (To Do, In Progress, On Hold, Blocked, Completed, Cancelled), priority (Low, Medium, High, Urgent), assignee (user or team), due date, start date, estimated hours, actual hours, tags/labels, attachments, comments, parent task (for subtasks), dependencies (blocked by / blocks)
- [ ] Task fields (branch/extensions): loaded dynamically from branch config
- [ ] Tasks support subtasks (one level of nesting)
- [ ] Tasks can have dependencies: "Task B cannot start until Task A is completed"
- [ ] When a dependency is completed, dependents are automatically moved to "To Do"
- [ ] Tasks can be created from daily report issues (issue → task conversion)
- [ ] Bulk task operations: assign, change status, change priority

**Business Rules:**
- Completed tasks cannot be reopened (a new task must be created)
- Overdue tasks (past due date, not completed) are visually flagged and trigger notifications
- Task status changes are audit-logged
- Only assignees, project managers, and admins can change task status

---

##### T4.2 — Task Views

**Description:** Multiple ways to view and organize tasks.

**Acceptance Criteria:**
- [ ] **List View**: sortable, filterable table of all tasks
- [ ] **Board View**: Kanban-style columns by status (To Do → In Progress → Completed)
- [ ] **Calendar View**: tasks plotted on a calendar by due date
- [ ] **Timeline View**: Gantt-chart style view showing task durations and dependencies
- [ ] **My Tasks**: personal view showing only the logged-in user's assigned tasks across all projects
- [ ] All views support filtering by: status, priority, assignee, date range, tags

---

##### T4.3 — Dynamic Workflow Engine

**Description:** Configurable approval workflows that can be attached to any entity.

**User Stories:**
- *As a company admin, I want to define an approval workflow: Worker submits → Supervisor reviews → Manager approves → Client notified, so that our processes are formalized.*

**Acceptance Criteria:**
- [ ] Workflow definition: name, trigger entity type (daily report, document, expense, purchase order, etc.), steps (ordered list of: role/user, action: approve/reject/review, optional: auto-escalation timeout)
- [ ] Workflows are organization-level resources (not project-specific)
- [ ] When an entity triggers a workflow, the system tracks which step it's on
- [ ] Each step generates a notification to the responsible person
- [ ] If a step is not completed within the configured timeout, it escalates to the next level
- [ ] Workflow history is recorded for every entity instance (who approved/rejected at each step, when, with comments)
- [ ] Workflows can be enabled/disabled without affecting historical data

---

### T5: Document Management

#### Real-World Problem

A typical construction project generates 2,000–5,000 documents: contracts, blueprints, permits, safety certifications, inspection reports, RFIs, change orders, meeting minutes, photos. These documents are currently stored in email attachments, shared drives, filing cabinets, and personal phones. Version control is nonexistent — the wrong blueprint revision has caused millions of dollars in rework. When an OSHA inspector asks for a safety document, finding it takes hours instead of seconds.

#### Features

##### T5.1 — Document Upload & Organization

**Description:** Centralized document repository with folder-based organization.

**User Stories:**
- *As a project manager, I want to upload all project documents to a centralized location so that everyone on the team can find what they need.*
- *As a site supervisor, I want to access the latest blueprint revision on my tablet so that I'm building to the correct specifications.*

**Acceptance Criteria:**
- [ ] Documents can be uploaded to: organization level, project level, or entity level (attached to a task, report, equipment, etc.)
- [ ] Folder structure: documents can be organized into folders and subfolders
- [ ] Default folder templates by industry (trunk provides generic: Contracts, Permits, Reports, Photos; branch adds industry-specific: Blueprints, Shop Drawings, RFIs for construction)
- [ ] Document metadata: name, type (categorized), description, tags, uploaded by, uploaded at, file size, version number
- [ ] Drag-and-drop upload, multiple file upload
- [ ] Document preview in-browser (PDF, images, common office formats)
- [ ] Download individual files or entire folders as ZIP

**Business Rules:**
- All documents inherit the access permissions of their parent (project, organization, or entity)
- Documents are indexed for full-text search upon upload
- Documents are processed by the AI pipeline for RAG (if the organization has AI features enabled)

---

##### T5.2 — Document Version Control

**Description:** Track revisions of documents with full version history.

**User Stories:**
- *As a project manager, I want to upload a new version of a blueprint and have the old version preserved so that the team always has the latest, but we can reference the history.*

**Acceptance Criteria:**
- [ ] Uploading a new file to an existing document creates a new version (version number increments)
- [ ] All previous versions are preserved and accessible
- [ ] Version history shows: version number, uploaded by, uploaded at, file size, change notes
- [ ] The current (latest) version is always shown by default
- [ ] Users can download or view any previous version
- [ ] Version comparison: side-by-side view for images; download both for other formats

---

##### T5.3 — Document Approval Workflows

**Description:** Documents can require approval before being shared or finalized.

**User Stories:**
- *As a project manager, I want submitted shop drawings to go through an approval process before they're shared with the subcontractor, so that we catch errors before they reach the field.*

**Acceptance Criteria:**
- [ ] Documents can be submitted for approval via the Dynamic Workflow Engine (T4.3)
- [ ] Approval status: Pending, Approved, Rejected, Approved with Comments
- [ ] Approved documents are marked with a green badge
- [ ] Rejected documents are returned to the uploader with rejection comments
- [ ] Approval history is preserved in the document's audit trail

---

##### T5.4 — Document Sharing & Permissions

**Description:** Control who can view, download, and edit documents.

**Acceptance Criteria:**
- [ ] Documents inherit project-level permissions by default
- [ ] Documents can be shared with specific users or roles beyond the project team
- [ ] Share links can be generated for external sharing (time-limited, password-protected)
- [ ] View-only mode: some documents can be marked as "view only" (no download allowed)
- [ ] Confidential flag: documents marked as confidential are visible only to Admins, Owners, and explicitly shared users

---

### T6: Equipment Management

#### Real-World Problem

A construction company owns $2 million in equipment: excavators, cranes, forklifts, generators, trucks, and hand tools. Without tracking, a $500,000 excavator sits idle on Project A while Project B rents one for $5,000/week. Maintenance is forgotten — a $50 oil change not done on time leads to a $15,000 engine repair. Generators disappear between job sites and nobody knows who had them last. Equipment is the second-largest expense after labor, yet most companies track it on spreadsheets or not at all.

#### Features

##### T6.1 — Equipment Registry

**Description:** Complete inventory of all company equipment and assets.

**User Stories:**
- *As a fleet manager, I want to see all company equipment in one place with their current status and location so that I can allocate resources efficiently.*

**Acceptance Criteria:**
- [ ] Equipment fields (trunk/generic): name, asset ID/tag number, category (Heavy Equipment, Vehicles, Power Tools, Hand Tools, Safety Equipment), make, model, year, serial number, status (Available, In Use, Under Maintenance, Out of Service, Retired), current location (project reference or warehouse), current assignee (user or project), purchase date, purchase price, photos, notes
- [ ] Equipment fields (branch/extensions): loaded dynamically from branch config
- [ ] Equipment list with filtering by: status, category, location, assignee
- [ ] Equipment detail page shows: current info, assignment history, maintenance history, inspection history, attached documents

---

##### T6.2 — Equipment Assignment

**Description:** Assign equipment to projects and track transfers between sites.

**User Stories:**
- *As a project manager, I want to request equipment from the fleet manager and have a record of what equipment is on my site.*

**Acceptance Criteria:**
- [ ] Equipment can be assigned to a project (moves status from Available to In Use)
- [ ] Assignment records: who assigned, when, to which project, expected return date
- [ ] Transfer: equipment can be transferred from one project to another (creates a transfer record)
- [ ] Return: equipment is returned to Available status with a return note
- [ ] Assignment history: complete log of everywhere the equipment has been

---

##### T6.3 — Maintenance Tracking

**Description:** Schedule and track maintenance activities for all equipment.

**User Stories:**
- *As a fleet manager, I want to set maintenance schedules based on engine hours or calendar intervals so that equipment is serviced on time and we avoid costly breakdowns.*

**Acceptance Criteria:**
- [ ] Maintenance schedules: define recurring maintenance by calendar interval (every 90 days) or usage metric (every 250 engine hours)
- [ ] Maintenance records: date, type (Preventive, Corrective, Emergency), description, cost, performed by, parts replaced, notes, attachments (receipts, photos)
- [ ] Maintenance alerts: notifications sent when maintenance is due (configurable: 7, 3, 1 day before)
- [ ] Overdue maintenance is visually flagged on the equipment card
- [ ] Maintenance history is a complete, auditable log

---

##### T6.4 — Equipment Inspections

**Description:** Digital pre-use and post-use inspection checklists.

**User Stories:**
- *As an equipment operator, I want to fill out a quick daily inspection checklist on my phone before using the excavator so that any issues are documented and reported.*

**Acceptance Criteria:**
- [ ] Inspection templates: configurable checklists (pass/fail items, text fields, photo capture)
- [ ] Inspections are linked to specific equipment and the inspector (user)
- [ ] Failed inspection items automatically generate an issue/task for maintenance
- [ ] Inspection history is stored and searchable
- [ ] Templates are configurable per organization (and per industry branch)

---

### T7: AI Engine

#### Real-World Problem

A company finally has all its operational data in one platform — projects, reports, documents, tasks, equipment, workforce. But with hundreds of daily reports, thousands of documents, and millions of data points, humans can't keep up. The project manager doesn't have time to read 20 daily reports. The owner can't manually identify which project is at risk. The safety officer can't cross-reference every incident with every inspection. AI turns centralized data into actionable intelligence — something impossible when data was scattered across 10 tools.

#### Features

##### T7.1 — Document Intelligence (RAG Pipeline)

**Description:** Upload documents → AI processes, indexes, and enables natural language Q&A.

**User Stories:**
- *As a project manager, I want to upload a 200-page contract and then ask "What are the liquidated damages terms?" and get an accurate answer with the exact clause referenced.*

**Acceptance Criteria:**
- [ ] Documents (PDF, DOCX, XLSX, images) are automatically processed when uploaded
- [ ] Processing pipeline: file download → text extraction (OCR for images/scanned PDFs) → text chunking → embedding generation → vector storage
- [ ] Users can ask natural language questions about any processed document
- [ ] Answers include: response text, source document name, page number, relevant excerpt (highlighted)
- [ ] Q&A is scoped to the user's permission level (can only query documents they can access)
- [ ] Processing status is shown (Queued, Processing, Ready, Failed)
- [ ] Bulk processing: all documents in a project can be queued for AI processing

**Business Rules:**
- RAG answers always cite the source document and page
- If the answer cannot be found in the documents, AI explicitly states "I couldn't find this information in the available documents" (no hallucination)
- Document processing costs are tracked per organization for usage-based billing

---

##### T7.2 — AI Report Summarizer

**Description:** Automatically generate summaries from multiple daily reports.

**User Stories:**
- *As a company owner, I want to receive a weekly AI-generated summary of all my projects' activities so that I stay informed without reading 100 individual reports.*

**Acceptance Criteria:**
- [ ] Weekly summary: generated every Monday at 8 AM (configurable) covering the previous 7 days
- [ ] Summary includes: work completed (by project), issues encountered, delays, safety incidents, key metrics (worker hours, activities count)
- [ ] On-demand summary: users can request a summary for any date range
- [ ] Summaries are generated per-project and across-all-projects
- [ ] Summaries are formatted as structured text (sections, bullet points, metrics)
- [ ] Summaries are stored and accessible in the Reports section

---

##### T7.3 — AI Smart Search

**Description:** Natural language search across all data types.

**User Stories:**
- *As a safety officer, I want to search "all safety issues related to electrical work in the past 3 months" and get results from daily reports, incident reports, documents, and tasks — all in one result set.*

**Acceptance Criteria:**
- [ ] Search input accepts natural language queries
- [ ] Search spans: daily reports, tasks, documents, equipment, comments, and branch-specific entities
- [ ] Results are ranked by relevance
- [ ] Results include: entity type, title, excerpt, date, project, and a link to the full item
- [ ] Search is scoped to the user's permissions (only returns results the user can access)
- [ ] Search supports filters: date range, project, entity type
- [ ] Search response time: < 3 seconds for typical queries

---

##### T7.4 — AI Project Assistant (Conversational)

**Description:** A contextual AI chatbot that can answer questions about projects.

**User Stories:**
- *As a project manager, I want to ask "What is causing delays on the Downtown Tower project?" and get a data-backed answer analyzing tasks, reports, and documents.*

**Acceptance Criteria:**
- [ ] Chat interface within each project context
- [ ] AI has access to: project tasks, daily reports, documents (via RAG), milestones, issues, team data
- [ ] Conversations are stored and can be resumed
- [ ] AI can: summarize project status, identify delay causes, list overdue items, compare planned vs. actual progress, answer questions about project documents
- [ ] Responses cite specific data points (e.g., "Based on the daily report from July 15...")
- [ ] Users can rate AI responses (thumbs up/down) for quality improvement

---

##### T7.5 — AI Meeting Summarizer

**Description:** Upload meeting transcripts and extract action items.

**User Stories:**
- *As a project manager, I want to upload the transcript from today's progress meeting and get a list of action items with responsible people and deadlines.*

**Acceptance Criteria:**
- [ ] Accepts text transcripts, meeting notes, or audio file transcriptions
- [ ] Extracts: action items, responsible person (matched to project members if possible), deadlines, decisions made, open questions
- [ ] Output can be converted into tasks (one-click: action item → task)
- [ ] Meeting summaries are stored within the project

---

### T8: Search Engine

#### Real-World Problem

With thousands of documents, hundreds of tasks, and months of daily reports, finding specific information becomes a needle-in-a-haystack problem. A project manager searching for "concrete inspection" needs to find the relevant daily report, the attached photos, the inspection form, and the related task — all from one search.

#### Features

##### T8.1 — Global Search

**Description:** A single search bar that searches across all data types.

**Acceptance Criteria:**
- [ ] Search bar is accessible from every page (global header)
- [ ] Searches across: projects, tasks, daily reports, documents, equipment, users, comments
- [ ] Results are grouped by type with counts
- [ ] Full-text search on text content (titles, descriptions, comments, document content)
- [ ] Results respect user permissions
- [ ] Keyboard shortcut: Cmd/Ctrl + K opens search
- [ ] Recent searches and suggested queries

---

### T9: Dashboard & Analytics

#### Real-World Problem

Company owners and executives need a high-level view of all operations. They shouldn't need to drill into individual projects to understand business health. A dashboard that shows real-time status across all projects — with budget, timeline, safety, and team metrics — replaces the weekly status meeting and the monthly Excel report.

#### Features

##### T9.1 — Organization Dashboard

**Description:** Bird's-eye view of all company operations.

**Acceptance Criteria:**
- [ ] Widgets: active projects count, total employees, total equipment, overdue tasks, open issues, recent activity
- [ ] Project health cards: each project shows RAG status (Red/Amber/Green) based on: budget, timeline, and issue count
- [ ] Charts: project status distribution (pie), task completion trends (line), worker distribution (bar)
- [ ] Dashboard is the landing page for Owners and Admins

---

##### T9.2 — Project Analytics

**Description:** Detailed analytics for individual projects.

**Acceptance Criteria:**
- [ ] Budget: planned vs. actual spending (bar chart), spending trend over time (line chart), cost breakdown by category
- [ ] Timeline: milestone progress, task completion rate, predicted completion date based on current velocity
- [ ] Workforce: headcount over time, hours worked by trade/team, attendance patterns
- [ ] Issues: issue count by category (delay, safety, quality, material), issue resolution time trend
- [ ] Daily Reports: report submission compliance (how many days have reports), report trends

---

## 5. BRANCH Layer — Construction Vertical

The Branch layer contains modules and extensions specific to the construction industry. These modules are completely isolated — they do not exist for organizations in other industries, and modifying them never affects trunk or root code.

> [!IMPORTANT]
> Everything in this section is specific to the Construction branch. When Agriculture or HVAC branches are built in the future, they will have their own equivalent section — completely independent of this one.

---

### C1: Construction Safety

#### Real-World Problem

Construction is one of the most dangerous industries. In the US alone, OSHA records over 1,000 construction fatalities per year and tens of thousands of injuries. Companies are required by law to maintain safety records, conduct inspections, report incidents, and track PPE compliance. Failure to do so results in fines, lawsuits, and loss of life. Yet most construction companies still manage safety on paper forms that are filed in a cabinet and never analyzed. Near-misses go unreported because the reporting process is too burdensome. Patterns that could prevent the next accident are invisible.

#### Features

##### C1.1 — Safety Incident Reporting

**Description:** Immediate digital reporting of safety incidents, accidents, and near-misses.

**User Stories:**
- *As a worker, I want to report a near-miss in under 60 seconds on my phone so that it actually gets reported instead of ignored.*
- *As a safety officer, I want to receive immediate notification when any safety incident is reported on any site so that I can respond quickly.*

**Acceptance Criteria:**
- [ ] Incident types: Injury, Near Miss, Property Damage, Environmental, Equipment Failure, Other
- [ ] Incident fields: type, severity (Low, Medium, High, Critical), date/time, location on site, description, involved persons, witnesses, immediate actions taken, photos (multiple), root cause (preliminary), follow-up actions required
- [ ] Reporting is accessible from a prominent button on the mobile home screen ("Report Safety Issue")
- [ ] Critical and high-severity incidents trigger immediate push notifications to: safety officer, project manager, company owner
- [ ] Incident creates a follow-up task automatically (investigation task assigned to safety officer)
- [ ] Incidents are geo-tagged (GPS) and timestamped automatically
- [ ] Anonymous reporting option for workers who fear retaliation
- [ ] OSHA 300/301 log fields are captured to facilitate regulatory reporting

**Business Rules:**
- All safety incidents are immutable once submitted (amendments are versioned)
- Critical incidents must be acknowledged by a safety officer within 2 hours (auto-escalation if not)
- Near-miss reports are equally important as incidents — they are treated with the same data rigor
- Incident data is never visible to Client portal users

---

##### C1.2 — Safety Inspections

**Description:** Scheduled and ad-hoc safety inspections with configurable checklists.

**User Stories:**
- *As a safety officer, I want to conduct weekly safety inspections using a standardized checklist on my tablet so that nothing is missed and the record is digital.*
- *As a project manager, I want to see which safety inspections are overdue so that I can ensure compliance.*

**Acceptance Criteria:**
- [ ] Inspection templates: pre-built templates for common inspection types (scaffolding, excavation, electrical, fire safety, fall protection, housekeeping)
- [ ] Custom templates: admins can create custom inspection checklists
- [ ] Checklist items: pass/fail, N/A, text comment, photo attachment per item
- [ ] Overall inspection result: Pass, Fail, Pass with Conditions
- [ ] Failed items automatically generate corrective action tasks
- [ ] Inspection schedule: recurring inspections can be scheduled (daily, weekly, monthly)
- [ ] Overdue inspections are flagged and generate notifications
- [ ] Digital signatures: inspector and site supervisor sign-off
- [ ] Inspection report is generated as a PDF for regulatory filing

---

##### C1.3 — PPE Tracking

**Description:** Track Personal Protective Equipment assignments and compliance.

**Acceptance Criteria:**
- [ ] PPE types: hard hat, safety vest, safety glasses, gloves, fall harness, steel-toe boots, ear protection, respirator
- [ ] PPE can be assigned to workers with issue date and expiry date
- [ ] Inspections can verify PPE compliance (checklist item: "Worker wearing required PPE?")
- [ ] Non-compliance is flagged and tracked as a safety issue

---

##### C1.4 — Safety Analytics Dashboard

**Description:** Analyze safety data to identify trends and prevent future incidents.

**Acceptance Criteria:**
- [ ] Metrics: total incidents (by type, by severity, by project, by time period), incident rate (incidents per 1,000 worker hours), near-miss ratio, inspection compliance rate, average incident response time
- [ ] Charts: incident trends over time, incident heat map by project, top hazard categories
- [ ] Comparison: project-to-project safety comparison
- [ ] EMR (Experience Modification Rate) tracking support

---

### C2: Construction Procurement & Materials

#### Real-World Problem

Material costs account for 40–60% of a construction project's budget. A delayed concrete delivery holds up the entire schedule. A wrong steel order wastes $50,000. A supplier who consistently delivers late isn't tracked. Purchase orders are created in Excel, emailed to suppliers, and then nobody knows if the delivery arrived or matched the order. Material waste isn't tracked — companies pour profit into dumpsters. Effective procurement isn't just about buying materials; it's about buying the right materials, at the right price, at the right time, from the right supplier.

#### Features

##### C2.1 — Material Requests

**Description:** Workers and supervisors can request materials needed for their tasks.

**User Stories:**
- *As a site supervisor, I want to request 50 bags of cement be delivered to Site A by Thursday so that concrete work can proceed on schedule.*

**Acceptance Criteria:**
- [ ] Request fields: material name/item, quantity, unit of measure, needed-by date, project, delivery location, urgency (Normal, Urgent), notes, requested by
- [ ] Requests trigger an approval workflow (Supervisor → PM/Procurement → Approved/Denied)
- [ ] Approved requests can be converted into purchase orders
- [ ] Request status tracking: Submitted, Approved, Ordered, Delivered, Cancelled
- [ ] Repeated materials are suggested via autocomplete from previous requests

---

##### C2.2 — Purchase Orders

**Description:** Create and track purchase orders sent to suppliers.

**User Stories:**
- *As a procurement manager, I want to create a purchase order from an approved material request and send it to the supplier digitally so that we have a paper trail.*

**Acceptance Criteria:**
- [ ] PO fields: PO number (auto-generated), supplier, line items (material, quantity, unit price, total), delivery date, delivery location, payment terms, notes, attachments (spec sheets), status (Draft, Sent, Acknowledged, Partially Delivered, Delivered, Cancelled)
- [ ] POs can be created from material requests (auto-populated) or manually
- [ ] PO PDF is generated and can be sent to the supplier via email
- [ ] PO amounts are tracked against project budget (auto-updated)
- [ ] Delivery tracking: when materials arrive, the PO is updated with received quantities and any discrepancies
- [ ] PO change tracking: modifications to a sent PO are versioned

**Business Rules:**
- POs above a configurable threshold (e.g., $10,000) require additional approval (Owner/Admin)
- PO totals automatically update the project's committed cost
- Partially delivered POs remain open until all line items are fulfilled

---

##### C2.3 — Supplier Management

**Description:** Maintain a database of approved suppliers with performance tracking.

**User Stories:**
- *As a procurement manager, I want to maintain a list of approved suppliers with their contact info, pricing, and delivery performance so that I can make informed purchasing decisions.*

**Acceptance Criteria:**
- [ ] Supplier fields: company name, contact person, email, phone, address, materials/services provided, payment terms, notes
- [ ] Supplier performance metrics: on-time delivery rate, order accuracy rate, average response time, total spend
- [ ] Supplier comparison: when creating a PO, compare prices from multiple suppliers for the same material
- [ ] Preferred supplier flag: mark suppliers as preferred for specific materials

---

##### C2.4 — Delivery Tracking

**Description:** Track material deliveries from order to arrival.

**Acceptance Criteria:**
- [ ] Expected deliveries are shown in a calendar view per project
- [ ] When a delivery arrives, the receiver logs: date received, items received (vs. ordered), condition (Acceptable, Damaged, Wrong Item), photos, signed delivery receipt
- [ ] Discrepancies between ordered and received generate alerts
- [ ] Late deliveries are flagged and reflected in the supplier's performance metrics
- [ ] Delivery data feeds into daily reports automatically

---

### C3: Construction Finance

#### Real-World Problem

A construction project budgeted at $5 million is actually costing $5.8 million — but nobody knows until the project is 80% complete. Cost overruns are discovered retroactively because financial tracking is done in a separate accounting system that isn't updated in real-time. Change orders are verbal agreements that never get formally documented. Retainage (holdback) calculations are done manually in spreadsheets. Progress billing requires gathering data from 5 different sources. Construction finance isn't generic accounting — it has industry-specific concepts like cost codes, retainage, progress billing, and change order impact tracking.

#### Features

##### C3.1 — Budget Management

**Description:** Set and track budgets at the project and phase level.

**User Stories:**
- *As a project manager, I want to set a detailed budget broken down by cost codes and phases so that I can track spending against each category.*

**Acceptance Criteria:**
- [ ] Budget fields: project reference, total budget, budget breakdown by cost code, budget breakdown by phase
- [ ] Cost codes: configurable codes (e.g., 01-General, 02-Sitework, 03-Concrete, 04-Masonry, 05-Metals, 09-Finishes, 15-Mechanical, 16-Electrical)
- [ ] Budget vs. actual: real-time comparison showing budgeted, committed (POs), spent, and remaining
- [ ] Budget alerts: notifications when spending reaches 75%, 90%, and 100% of budget for any cost code
- [ ] Budget revision history: all changes to the budget are versioned and auditable
- [ ] Forecasting: projected total cost based on current spending rate

---

##### C3.2 — Expense Tracking

**Description:** Record and categorize project expenses.

**Acceptance Criteria:**
- [ ] Expense fields: amount, date, cost code, category (Labor, Material, Equipment, Subcontractor, Overhead, Other), description, receipt attachment, approved by
- [ ] Expenses can be entered by: supervisors (require approval), managers (auto-approved), admins
- [ ] Expenses feed into the budget tracking in real-time
- [ ] Receipt scanning: take a photo of a receipt and AI extracts amount, vendor, date (future enhancement)

---

##### C3.3 — Change Order Management

**Description:** Track contract changes that affect scope, cost, or schedule.

**User Stories:**
- *As a project manager, I want to formally document and track every change order so that I have a complete record of how the project scope and budget evolved.*

**Acceptance Criteria:**
- [ ] Change order fields: CO number (auto-generated), title, description, reason (Owner request, Design change, Site condition, Regulatory, Error/Omission), cost impact (+ or -), schedule impact (days added or removed), affected cost codes, status (Draft, Submitted, Under Review, Approved, Rejected), requested by, approved by, date, attachments
- [ ] Approved change orders automatically adjust the project budget
- [ ] Change order log: chronological list of all COs with cumulative impact on budget and schedule
- [ ] Approval workflow: PM submits → Owner/Client reviews → Approved/Rejected
- [ ] PDF generation: COs can be exported as signed PDF documents

---

##### C3.4 — Progress Billing

**Description:** Generate progress payment applications based on work completed.

**Acceptance Criteria:**
- [ ] Application for payment: list of cost codes with: scheduled value, work completed to date (%), previous payments, current payment due, retainage
- [ ] Retainage: configurable retainage percentage (typically 10%) held back from each payment
- [ ] Payment application generates a formatted PDF (similar to AIA G702/G703 format)
- [ ] Payment tracking: submitted, reviewed, approved, paid
- [ ] Payment history per project

---

### C4: Contractor Portal (Subcontractor Management)

#### Real-World Problem

A general contractor on a large project works with 15–30 subcontractors simultaneously. Each subcontractor has their own insurance, licenses, workers, and invoices. The GC needs to verify that every subcontractor has valid insurance before they step on site — one expired policy can expose the GC to millions in liability. Lien waivers must be exchanged with every payment — missing one can result in a lien on the property. Work orders are communicated via phone calls and WhatsApp — scope disagreements become expensive disputes. The subcontractor, meanwhile, is working for 3–5 different GCs and has to use a different system (or no system) for each one.

#### Features

##### C4.1 — Subcontractor Prequalification & Onboarding

**Description:** Vet and onboard subcontractors with standardized documentation.

**User Stories:**
- *As a project manager, I want to onboard a new subcontractor by collecting their insurance, licenses, and safety records in one place so that I can verify they're qualified before they start work.*

**Acceptance Criteria:**
- [ ] Subcontractor profile: company name, contact info, trade/specialty, license numbers, EMR (Experience Modification Rate), bonding capacity, years in business, references
- [ ] Required documents: Certificate of Insurance (COI), business license, workers comp certificate, safety program documentation, WSIB/WCB clearance (Canada)
- [ ] Document verification: uploaded documents are reviewed and marked as Verified/Rejected by the GC admin
- [ ] Compliance status: Green (all documents valid), Yellow (documents expiring within 90 days), Red (expired documents)
- [ ] Subcontractors cannot be assigned to projects if their compliance status is Red
- [ ] Automated expiry alerts: 90, 60, and 30 days before insurance/license expiry

---

##### C4.2 — Insurance & Certificate Tracking (COI Management)

**Description:** Track and manage subcontractor insurance certificates.

**Acceptance Criteria:**
- [ ] COI fields: insurance type (General Liability, Workers Comp, Auto, Umbrella), carrier, policy number, coverage limits, effective date, expiry date, document upload
- [ ] Multiple policies per subcontractor
- [ ] Automatic expiry tracking with email notifications to both the GC and the subcontractor
- [ ] Project-specific requirements: different projects may require different coverage limits
- [ ] COI compliance dashboard: overview of all subcontractors' insurance status

---

##### C4.3 — Work Orders

**Description:** Issue formal work orders to subcontractors.

**User Stories:**
- *As a project manager, I want to issue a digital work order to the plumbing subcontractor that clearly defines scope, deliverables, and timeline so that there's no ambiguity about what they're hired to do.*

**Acceptance Criteria:**
- [ ] Work order fields: WO number (auto-generated), subcontractor, project, scope of work (detailed description), deliverables, start date, completion date, contract amount, payment terms, attachments (drawings, specifications), status (Draft, Issued, Accepted, In Progress, Completed, Disputed)
- [ ] Subcontractor receives the work order in their portal and can Accept or Request Changes
- [ ] Work order changes are versioned and require mutual acknowledgment
- [ ] Completed work orders require sign-off from both the subcontractor and the GC PM

---

##### C4.4 — Lien Waiver Management

**Description:** Automate the exchange of lien waivers with every payment.

**User Stories:**
- *As a project manager, I want lien waivers to be automatically generated and sent to subcontractors with every payment so that I'm protected from liens on the property.*

**Acceptance Criteria:**
- [ ] Lien waiver types: Conditional (before payment), Unconditional (after payment), Progress, Final
- [ ] Automatic generation: the correct waiver type is generated based on payment amount and status
- [ ] Digital signature: subcontractors sign lien waivers electronically within the portal
- [ ] Payment hold: payments are not released until the corresponding lien waiver is signed
- [ ] Waiver archive: all signed waivers are stored and linked to the specific payment and project

---

##### C4.5 — Subcontractor Invoicing

**Description:** Subcontractors submit invoices through the portal for review and payment.

**Acceptance Criteria:**
- [ ] Invoice fields: invoice number, work order reference, amount, description of work completed, period covered, attachments (backup documentation)
- [ ] Invoice approval workflow: Subcontractor submits → PM reviews → Admin approves → Payment processed
- [ ] Invoice status: Submitted, Under Review, Approved, Rejected, Paid
- [ ] Rejection includes reason and required corrections
- [ ] Invoice history and payment history per subcontractor

---

##### C4.6 — Subcontractor Performance Tracking

**Description:** Track subcontractor performance across projects.

**Acceptance Criteria:**
- [ ] Performance metrics: quality score, timeliness (on-schedule completion rate), safety record (incidents on their crew), compliance (document currency), communication responsiveness
- [ ] Performance data is aggregated across all projects the subcontractor has worked on
- [ ] Performance reports inform future bidding and subcontractor selection decisions

---

### C5: Client Portal

#### Real-World Problem

A hotel chain is paying $15 million for a new building. Their VP of Facilities gets a vague verbal update once a week: "Things are going well, we're about 65% done." He has no idea if the project is actually on schedule, if there are cost overruns, or if the latest design change was implemented correctly. When he asks for project photos, he gets a zip file emailed three days later. When a change order arrives as a PDF, he has no context for why the scope changed. Clients want transparency — and contractors who provide it win more business.

#### Features

##### C5.1 — Client Dashboard

**Description:** A read-only dashboard showing project progress, photos, and key milestones.

**User Stories:**
- *As a client, I want to log in and see how my project is progressing — percentage complete, recent photos, upcoming milestones — without bothering the contractor.*

**Acceptance Criteria:**
- [ ] Dashboard shows: project progress (%), milestone timeline with status, recent photos (last 7 days), open issues count (high-level), budget summary (if client has finance access), upcoming milestones, recent activity log
- [ ] Data is refreshed in real-time
- [ ] Client cannot see: internal team discussions, cost codes, supplier information, subcontractor details, internal safety reports
- [ ] Client view is configurable by the GC (choose what data the client can see)

---

##### C5.2 — Client Approvals

**Description:** Clients can approve milestones, change orders, and documents.

**Acceptance Criteria:**
- [ ] Items requiring client approval appear in an "Approvals" queue
- [ ] Client can: Approve, Reject (with reason), or Request More Information
- [ ] Approval actions are timestamped and audit-logged
- [ ] Notifications are sent when new items require approval
- [ ] Approved items progress in their respective workflows

---

##### C5.3 — Client Communication

**Description:** Structured communication channel between the contractor and client.

**Acceptance Criteria:**
- [ ] Message thread per project (not general chat — structured, topic-based)
- [ ] Messages can include attachments
- [ ] Message history is searchable and permanent
- [ ] Notifications for new messages

---

### C6: Construction-Specific Extensions

These extensions add construction-specific fields to trunk entities. They do NOT modify trunk schemas — they populate the `extensions` subdocument.

#### C6.1 — Project Extensions

**Construction-specific fields added to the Project entity:**

| Field | Type | Description |
|---|---|---|
| `phases` | Array of Objects | Project phases (Foundation, Framing, MEP, Finishing, etc.) with status and dates |
| `floors` | Number | Number of floors/levels |
| `totalArea` | Number | Total area (sq ft or sq m) |
| `buildingType` | Enum | Commercial, Residential, Industrial, Infrastructure, Mixed-Use |
| `trades` | Array of Strings | Trades involved (Electrical, Plumbing, HVAC, Concrete, Steel, etc.) |
| `permitNumber` | String | Building permit number |
| `permitStatus` | Enum | Applied, Issued, Expired, Renewed |
| `contractType` | Enum | Lump Sum, Cost Plus, GMP, Time & Material, Unit Price |
| `architect` | Object | Name, firm, contact info |
| `engineer` | Object | Name, firm, contact info |

#### C6.2 — Daily Report Extensions

**Construction-specific fields added to the Daily Report entity:**

| Field | Type | Description |
|---|---|---|
| `concretePoured` | Object | Volume (m³), location, mix type |
| `steelInstalled` | Object | Weight (tons), location |
| `craneHours` | Number | Hours of crane operation |
| `weatherImpact` | Enum | None, Minor Delay, Major Delay, Work Stopped |
| `tradeBreakdown` | Array of Objects | Workers by trade (Electrical: 5, Plumbing: 3, etc.) |
| `safetyToolboxTalk` | Object | Topic, attendance count, conducted by |
| `visitorLog` | Array of Objects | Visitors on site (name, company, purpose) |
| `deliveries` | Array of Objects | Materials received today (item, quantity, supplier) |

#### C6.3 — Task Extensions

**Construction-specific task types added to the Task entity:**

| Task Type | Description | Extra Fields |
|---|---|---|
| **RFI** (Request for Information) | Clarification request on drawings/specs | RFI number, drawing reference, spec section, response deadline, response, ball-in-court |
| **Submittal** | Material/product data submitted for approval | Submittal number, spec section, status (Submitted, Approved, Rejected, Resubmit), reviewer |
| **Punch List Item** | Deficiency to fix before project closeout | Location, trade responsible, inspection reference, completion verification photo |
| **Change Order Task** | Work generated by a change order | CO reference, additional cost, additional days |
| **Inspection Request** | Request for a building inspection | Inspection type, requesting authority, scheduled date, result |

#### C6.4 — Document Extensions

**Construction-specific document types:**

| Document Type | Description |
|---|---|
| **Blueprint / Drawing** | Architectural, structural, MEP, site plan drawings |
| **Shop Drawing** | Fabricator-produced detailed drawings |
| **As-Built Drawing** | Final drawings reflecting actual construction |
| **Specification** | Material and workmanship specifications |
| **RFI Response** | Official response document to an RFI |
| **Meeting Minutes** | Weekly OAC (Owner-Architect-Contractor) meeting minutes |
| **Inspection Report** | Third-party or regulatory inspection results |
| **Lien Waiver** | Signed lien waiver documents |
| **Change Order Document** | Signed change order agreements |

#### C6.5 — Equipment Extensions

**Construction-specific equipment fields:**

| Field | Type | Description |
|---|---|---|
| `equipmentClass` | Enum | Heavy (excavator, crane, loader), Light (compactor, saw, drill), Vehicle (truck, van), Power (generator, compressor) |
| `loadCapacity` | Object | Value and unit (e.g., 20 tons) |
| `operatorCertRequired` | Boolean | Whether certified operator is required |
| `hourlyRate` | Number | Internal charge rate per hour |
| `rentalInfo` | Object | If rented: vendor, daily rate, rental start/end, rental agreement attachment |

---

## 6. Cross-Cutting Concerns

These requirements apply across all layers:

### 6.1 — Internationalization (i18n)

- All user-facing text must be externalizable for translation
- Date, time, number, and currency formatting must respect organization locale settings
- MVP: English only. Architecture must support future languages.

### 6.2 — Accessibility (a11y)

- WCAG 2.1 Level AA compliance for all web UI
- Keyboard navigation for all interactive elements
- Screen reader compatibility
- Minimum color contrast ratios

### 6.3 — Responsive Design

- All web pages must work on desktop (1920px), tablet (768px), and mobile (375px)
- Mobile experience must be optimized for field use (large touch targets, simplified forms)

### 6.4 — Offline Support (Mobile)

- Critical features must work offline: daily report creation, task status updates, photo capture
- Data syncs automatically when connectivity is restored
- Conflict resolution strategy: last-write-wins with user notification of conflicts

### 6.5 — Data Export

- All list views must support CSV export
- Reports (daily, safety, financial) must support PDF export
- API access for enterprise tier (programmatic data export)

### 6.6 — Soft Delete

- No data is permanently deleted — all deletions are soft deletes (set `deletedAt` timestamp)
- Soft-deleted items are hidden from UI but preserved in the database
- Admins can view and restore soft-deleted items within 90 days
- After 90 days, items are permanently purged (except audit logs, which are retained for 7 years)

---

## 7. Feature Priority Matrix

| Priority | Label | Description | Features |
|---|---|---|---|
| **P0** | Must Have (MVP) | Core features required for launch | R1 (Auth), R2 (Org), R3 (RBAC), R4 (Notifications — in-app only), R5 (Audit), R6 (File Storage), T1 (Workforce — basic), T2 (Projects), T3 (Daily Reports), T4 (Tasks — basic), T5 (Documents — basic), C6 (Extensions) |
| **P1** | Should Have (v1.1) | Important features for early adoption | T4 (Workflow Engine), T6 (Equipment), T8 (Search), T9 (Dashboard), C1 (Safety — basic), R4 (Push + Email), R7 (Real-Time) |
| **P2** | Nice to Have (v1.2) | Features that differentiate | T7 (AI Engine — RAG, summaries), C2 (Procurement), C3 (Finance — basic), C4 (Contractor Portal — basic), T5 (Version Control, Approval Workflows) |
| **P3** | Future (v2+) | Features for growth | C5 (Client Portal), C4 (Lien Waivers, Performance Tracking), C3 (Progress Billing), T7 (AI Meeting Summaries, Project Assistant), T1 (Attendance/Time Tracking), Mobile offline support |
| **P4** | Long-term | Platform maturity | SSO/SAML, SCIM, mobile native app, IoT integrations, marketplace, additional industry branches |

---

## 8. Glossary

| Term | Definition |
|---|---|
| **RFI** | Request for Information — a formal question seeking clarification on project documents |
| **Submittal** | Product data, samples, or shop drawings submitted for design team approval |
| **Change Order (CO)** | A formal amendment to the construction contract that changes scope, cost, or schedule |
| **Punch List** | A list of deficiencies that must be corrected before a project is considered complete |
| **Retainage** | A percentage of payment (typically 10%) withheld until project completion as security |
| **Lien Waiver** | A document signed by a subcontractor waiving their right to file a mechanic's lien for a given payment |
| **COI** | Certificate of Insurance — proof of insurance coverage |
| **EMR** | Experience Modification Rate — a metric reflecting a company's safety record compared to industry average |
| **GC** | General Contractor — the primary contractor responsible for the overall project |
| **Cost Code** | A numerical code categorizing types of construction costs (e.g., 03 = Concrete, 16 = Electrical) |
| **AIA G702/G703** | Standard forms for contractor payment applications in the US construction industry |
| **RAG** | Retrieval-Augmented Generation — an AI technique that retrieves relevant documents before generating answers |
| **PPE** | Personal Protective Equipment — safety gear (helmets, vests, glasses, etc.) |
| **OSHA** | Occupational Safety and Health Administration — US regulatory body for workplace safety |
| **MEP** | Mechanical, Electrical, and Plumbing — the three primary building systems |
| **OAC** | Owner-Architect-Contractor — the three primary stakeholders in a construction project |
| **BIM** | Building Information Modeling — 3D modeling of building design and construction |
| **Trunk** | The shared, industry-agnostic layer of Pulse's Tree Architecture |
| **Branch** | The industry-specific layer of Pulse's Tree Architecture |
| **Extensions** | The flexible subdocument within trunk entities that holds industry-specific fields |
| **Discriminator** | The `industry` field that identifies which branch an entity belongs to |

---

## Document Changelog

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | August 3, 2026 | Pulse Engineering Team | Initial document creation |

---

> **Previous Document:** [Doc 00 — Vision & Product Strategy](./00_Vision_and_Product_Strategy.md)
> **Next Document:** [Doc 02 — Functional Requirements](./02_Functional_Requirements.md)
