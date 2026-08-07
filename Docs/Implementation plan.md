# Pulse — Development Kickoff Plan

## Scope & Scale Assessment

After reading all 24 documents (00–23) and the project understanding document, here is a full assessment of what we're building and how to start.

---

### Current Scope (Construction Branch — Year 1)

The immediate build target is a **multi-tenant, cloud-native B2B SaaS platform** with:

| Area | What Exists | Scale |
|---|---|---|
| **Root Layer** | Auth (JWT + OAuth + 2FA), Multi-tenancy, RBAC Engine, Notification Engine, Audit Logging, File Storage Engine, Real-Time Engine | 7 foundational services |
| **Trunk Layer** | Users & Workforce, Projects, Daily Reports, Tasks & Workflows, Documents, Equipment, AI Engine, Search, Dashboards | 9 core domain modules |
| **Branch Layer (Construction)** | Safety (OSHA), Procurement & POs, Finance (Cost Codes/Retainage), Contractor Portal, Client Portal, Extensions (RFIs, Submittals, Change Orders, Blueprints) | 6 industry modules |
| **AI Layer** | RAG Pipeline, Document Intelligence, Daily Report Summarizer, Smart Search, Project Assistant, Construction-specific AI (RFI/Blueprint/Safety Analyzers) | ~10 AI features |
| **Mobile** | React Native (Expo), Offline-First (WatermelonDB), GPS/Camera/Voice, Geofencing | Full native app |

**Total entities across all layers:** ~25 MongoDB collections, ~60+ API endpoints, ~30+ UI pages/views.

### Future Scope (Years 2–5)

Each new industry branch (Agriculture, Energy, HVAC, Solar, etc.) should require:
- **Zero changes** to Root or Trunk code
- **Zero changes** to any existing Branch
- Only **new branch files**: schemas, extensions, UI components, API routes, and prompt templates

This is the single most important architectural constraint.

---

## The Critical Decision: How to Start

> [!IMPORTANT]
> Doc 00 explicitly states: **"Product-first, infrastructure later."** and **"Do NOT start with Kubernetes, Terraform, or AWS."**
>
> The first version focuses on:
> - ✅ Excellent user experience
> - ✅ Strong domain model (Tree Architecture)
> - ✅ Clean backend architecture (NestJS modules)
> - ✅ Real workflows (not CRUD)
> - ❌ NOT Kubernetes (later)
> - ❌ NOT Terraform (later)
> - ❌ NOT microservices deployment (modular monolith first)

---

## Proposed Monorepo Structure

Based on Doc 22 (Coding Standards), Doc 04 (System Architecture), and the project_understanding.md frontend architecture, this is the exact directory tree we will scaffold:

```text
pulse/
├── apps/
│   ├── web/                          # Next.js 14+ (App Router)
│   │   ├── src/
│   │   │   ├── app/                  # Next.js App Router pages
│   │   │   │   ├── (auth)/           # Auth pages (login, register, verify)
│   │   │   │   ├── (dashboard)/      # Authenticated layout
│   │   │   │   │   ├── projects/
│   │   │   │   │   ├── tasks/
│   │   │   │   │   ├── reports/
│   │   │   │   │   ├── documents/
│   │   │   │   │   ├── equipment/
│   │   │   │   │   ├── settings/
│   │   │   │   │   └── layout.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── core/                 # ROOT — shared foundation UI
│   │   │   │   ├── components/       # Design system (Button, Input, Modal, etc.)
│   │   │   │   ├── hooks/            # useAuth, useTenant, usePermissions
│   │   │   │   ├── layouts/          # DashboardLayout, AuthLayout
│   │   │   │   ├── lib/              # API client, utils, constants
│   │   │   │   └── providers/        # AuthProvider, TenantProvider, QueryProvider
│   │   │   │
│   │   │   ├── modules/              # TRUNK — shared domain UI
│   │   │   │   ├── projects/         # Project list, detail, forms
│   │   │   │   ├── tasks/            # Task board, detail, forms
│   │   │   │   ├── daily-reports/    # Report list, creation wizard
│   │   │   │   ├── documents/        # File explorer, upload, preview
│   │   │   │   ├── equipment/        # Asset grid, assignment
│   │   │   │   ├── workforce/        # Team management
│   │   │   │   ├── notifications/    # Notification center
│   │   │   │   ├── search/           # Global Omnibox (Cmd+K)
│   │   │   │   └── ai-assistant/     # Chat panel, AI features
│   │   │   │
│   │   │   ├── verticals/            # BRANCH — industry-specific UI
│   │   │   │   ├── construction/
│   │   │   │   │   ├── components/   # Construction-specific components
│   │   │   │   │   ├── extensions/   # Extension field renderers for Trunk forms
│   │   │   │   │   ├── safety/       # Safety incident pages
│   │   │   │   │   ├── finance/      # Budget/cost tracking pages
│   │   │   │   │   ├── procurement/  # PO management pages
│   │   │   │   │   ├── contractor-portal/
│   │   │   │   │   └── client-portal/
│   │   │   │   └── _registry.ts      # Maps industry → vertical components
│   │   │   │
│   │   │   └── styles/               # Global CSS, design tokens
│   │   │
│   │   ├── public/
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── api/                          # NestJS Backend (Modular Monolith)
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   │
│   │   │   ├── common/               # Shared infrastructure
│   │   │   │   ├── decorators/       # @CurrentUser, @RequirePermissions
│   │   │   │   ├── filters/          # GlobalExceptionFilter (RFC 7807)
│   │   │   │   ├── guards/           # JwtAuthGuard, RbacGuard
│   │   │   │   ├── interceptors/     # ResponseEnvelopeInterceptor
│   │   │   │   ├── middleware/       # TenantInjectionMiddleware
│   │   │   │   ├── pipes/            # ZodValidationPipe
│   │   │   │   └── interfaces/       # Extension plugin interfaces
│   │   │   │
│   │   │   ├── root/                 # 🌍 ROOT — Foundation (Industry Agnostic)
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth.module.ts
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── strategies/   # jwt.strategy.ts, google.strategy.ts
│   │   │   │   │   └── dto/
│   │   │   │   ├── organizations/
│   │   │   │   │   ├── organizations.module.ts
│   │   │   │   │   ├── organizations.controller.ts
│   │   │   │   │   ├── organizations.service.ts
│   │   │   │   │   ├── organizations.schema.ts
│   │   │   │   │   └── dto/
│   │   │   │   ├── users/
│   │   │   │   │   ├── users.module.ts
│   │   │   │   │   ├── users.controller.ts
│   │   │   │   │   ├── users.service.ts
│   │   │   │   │   ├── users.schema.ts
│   │   │   │   │   └── dto/
│   │   │   │   ├── memberships/
│   │   │   │   │   ├── memberships.module.ts
│   │   │   │   │   ├── memberships.service.ts
│   │   │   │   │   ├── memberships.schema.ts
│   │   │   │   │   └── dto/
│   │   │   │   ├── rbac/
│   │   │   │   │   ├── rbac.module.ts
│   │   │   │   │   ├── rbac.service.ts
│   │   │   │   │   ├── permissions.ts        # Permission string definitions
│   │   │   │   │   └── role-defaults.ts      # Default role → permissions mapping
│   │   │   │   ├── notifications/
│   │   │   │   │   ├── notifications.module.ts
│   │   │   │   │   ├── notifications.service.ts
│   │   │   │   │   └── channels/             # email.channel.ts, push.channel.ts
│   │   │   │   └── audit/
│   │   │   │       ├── audit.module.ts
│   │   │   │       ├── audit.service.ts
│   │   │   │       └── audit.schema.ts
│   │   │   │
│   │   │   ├── trunk/                # 🪵 TRUNK — Shared Core (Industry Agnostic)
│   │   │   │   ├── projects/
│   │   │   │   │   ├── projects.module.ts
│   │   │   │   │   ├── projects.controller.ts
│   │   │   │   │   ├── projects.service.ts
│   │   │   │   │   ├── projects.schema.ts
│   │   │   │   │   ├── project-extension.registry.ts   # Plugin registry
│   │   │   │   │   └── dto/
│   │   │   │   ├── tasks/
│   │   │   │   │   ├── tasks.module.ts
│   │   │   │   │   ├── tasks.controller.ts
│   │   │   │   │   ├── tasks.service.ts
│   │   │   │   │   ├── tasks.schema.ts
│   │   │   │   │   ├── task-extension.registry.ts
│   │   │   │   │   └── dto/
│   │   │   │   ├── daily-reports/
│   │   │   │   │   ├── daily-reports.module.ts
│   │   │   │   │   ├── daily-reports.controller.ts
│   │   │   │   │   ├── daily-reports.service.ts
│   │   │   │   │   ├── daily-reports.schema.ts
│   │   │   │   │   ├── report-extension.registry.ts
│   │   │   │   │   └── dto/
│   │   │   │   ├── documents/
│   │   │   │   │   ├── documents.module.ts
│   │   │   │   │   ├── documents.controller.ts
│   │   │   │   │   ├── documents.service.ts
│   │   │   │   │   ├── documents.schema.ts
│   │   │   │   │   └── dto/
│   │   │   │   └── equipment/
│   │   │   │       ├── equipment.module.ts
│   │   │   │       ├── equipment.controller.ts
│   │   │   │       ├── equipment.service.ts
│   │   │   │       ├── equipment.schema.ts
│   │   │   │       ├── equipment-extension.registry.ts
│   │   │   │       └── dto/
│   │   │   │
│   │   │   └── branches/             # 🌿 BRANCHES — Industry Verticals
│   │   │       ├── construction/
│   │   │       │   ├── construction.module.ts          # Registers all plugins
│   │   │       │   ├── extensions/
│   │   │       │   │   ├── con-project.plugin.ts       # Validates project extensions
│   │   │       │   │   ├── con-task.plugin.ts
│   │   │       │   │   ├── con-report.plugin.ts
│   │   │       │   │   └── con-equipment.plugin.ts
│   │   │       │   ├── safety/
│   │   │       │   │   ├── safety.module.ts
│   │   │       │   │   ├── safety.controller.ts
│   │   │       │   │   ├── safety.service.ts
│   │   │       │   │   ├── safety-incident.schema.ts
│   │   │       │   │   └── dto/
│   │   │       │   ├── change-orders/
│   │   │       │   │   ├── change-orders.module.ts
│   │   │       │   │   ├── change-orders.controller.ts
│   │   │       │   │   ├── change-orders.service.ts
│   │   │       │   │   ├── change-order.schema.ts
│   │   │       │   │   └── dto/
│   │   │       │   ├── purchase-orders/
│   │   │       │   │   ├── purchase-orders.module.ts
│   │   │       │   │   ├── purchase-orders.controller.ts
│   │   │       │   │   ├── purchase-orders.service.ts
│   │   │       │   │   ├── purchase-order.schema.ts
│   │   │       │   │   └── dto/
│   │   │       │   └── coi/
│   │   │       │       ├── coi.module.ts
│   │   │       │       ├── coi.controller.ts
│   │   │       │       ├── coi.service.ts
│   │   │       │       ├── coi.schema.ts
│   │   │       │       └── dto/
│   │   │       │
│   │   │       └── _branch.registry.ts   # Maps industry string → branch module
│   │   │
│   │   ├── tsconfig.json
│   │   ├── nest-cli.json
│   │   └── package.json
│   │
│   └── ai-service/                   # Python FastAPI (Future — Phase 4)
│       ├── app/
│       │   ├── main.py
│       │   ├── routers/
│       │   ├── services/
│       │   ├── prompts/              # Root + Branch prompt templates
│       │   └── rag/
│       ├── requirements.txt
│       └── Dockerfile
│
├── packages/
│   ├── types/                        # Shared TypeScript types/interfaces
│   │   ├── src/
│   │   │   ├── root/                 # User, Organization, Membership types
│   │   │   ├── trunk/                # Project, Task, DailyReport types
│   │   │   ├── branches/
│   │   │   │   └── construction/     # SafetyIncident, ChangeOrder types
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── validators/                   # Shared Zod schemas
│   │   ├── src/
│   │   │   ├── trunk/                # createProjectSchema, createTaskSchema
│   │   │   └── branches/
│   │   │       └── construction/     # conProjectExtensionsSchema
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── ui/                           # Shared React UI components (design system)
│   │   ├── src/
│   │   │   ├── primitives/           # Button, Input, Badge, Avatar
│   │   │   ├── composites/           # DataTable, Modal, Sidebar, CommandPalette
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── config/                       # Shared config (ESLint, TSConfig, Prettier)
│       ├── eslint/
│       │   ├── base.js
│       │   └── dependency-rules.js   # Enforces Root/Trunk/Branch import rules
│       ├── tsconfig/
│       │   └── base.json
│       └── prettier/
│           └── index.js
│
├── turbo.json                        # Turborepo pipeline config
├── package.json                      # Root workspace config
├── .gitignore
├── .env.example
├── docker-compose.yml                # Local dev: MongoDB + Redis
├── Docs/                             # All 24 specification documents
└── README.md
```

---

## Technology Decisions (Resolved)

Based on cross-referencing all 24 documents, these are the final, locked-in technology choices:

| Decision | Choice | Source Document |
|---|---|---|
| **Monorepo Tool** | Turborepo | Doc 22 |
| **Frontend Framework** | Next.js 14+ (App Router) | Doc 00, Doc 04 |
| **UI Library** | Tailwind CSS + Shadcn UI | Doc 00, Doc 04 |
| **State Management** | Zustand (client) + React Query (server) | Doc 00, Doc 04 |
| **Form Validation** | React Hook Form + Zod | Doc 04 |
| **Backend Framework** | NestJS (TypeScript) | Doc 04 |
| **Database** | MongoDB Atlas (Mongoose ODM) | Doc 05 |
| **Cache & Queues** | Redis + BullMQ | Doc 04, Doc 11 |
| **Auth** | JWT (RS256) + Passport.js | Doc 07 |
| **Real-Time** | Socket.io (Redis Adapter) | Doc 04, Doc 11 |
| **File Storage** | AWS S3 (Pre-Signed URLs) | Doc 12 |
| **AI Service** | Python FastAPI (Phase 4) | Doc 10 |
| **Vector DB** | MongoDB Atlas Vector Search | Doc 10, Doc 14 |
| **Mobile** | React Native (Expo) (Phase 3) | Doc 15 |
| **Testing** | Jest + Supertest + Playwright | Doc 20 |
| **Local Dev** | Docker Compose (MongoDB + Redis) | Practical necessity |

---

## Build Phases — Execution Order

> [!IMPORTANT]
> We follow Doc 00's philosophy: **"Product-first, infrastructure later."** We build a working product locally before touching AWS/Kubernetes.

### Phase 1: Foundation Sprint (Weeks 1–3)

**Goal:** Scaffold the monorepo, set up local dev environment, and build the entire Root layer.

| Step | What | Details |
|---|---|---|
| 1.1 | **Scaffold Monorepo** | Initialize Turborepo with `apps/web`, `apps/api`, `packages/types`, `packages/validators`, `packages/ui`, `packages/config`. |
| 1.2 | **Docker Compose** | Create `docker-compose.yml` for local MongoDB (with replica set for Change Streams) and Redis. |
| 1.3 | **NestJS API Bootstrap** | Initialize NestJS app. Set up `common/` directory with Guards, Filters, Interceptors, Decorators. Configure Mongoose connection. |
| 1.4 | **Root: Auth Module** | `users` schema, registration, login, JWT (RS256), refresh tokens, email verification. |
| 1.5 | **Root: Organizations** | `organizations` schema, creation during registration, industry selection, settings. |
| 1.6 | **Root: Memberships** | `memberships` schema, invitation flow, role assignment, org-switcher support. |
| 1.7 | **Root: RBAC Engine** | Permission strings, role defaults, `RbacGuard`, `@RequirePermissions()` decorator, Redis caching. |
| 1.8 | **Root: Tenant Middleware** | `TenantInjectionMiddleware` that auto-appends `organizationId` to all DB queries. |
| 1.9 | **Root: Audit Service** | `audit_logs` schema and async event-driven logging on all mutations. |
| 1.10 | **Next.js Web Bootstrap** | Initialize Next.js app. Set up Tailwind + Shadcn. Create AuthLayout, DashboardLayout. Build Login, Register, Org Setup pages. |
| 1.11 | **Shared Packages** | Define core TypeScript interfaces in `packages/types`. Create initial Zod validators in `packages/validators`. |

**Deliverable:** A user can register, create an organization, invite team members, and log in. RBAC prevents unauthorized access. Audit trail records every action.

---

### Phase 2: Core Trunk (Weeks 4–7)

**Goal:** Build all shared domain modules that every industry will use.

| Step | What | Details |
|---|---|---|
| 2.1 | **Trunk: Projects** | Full CRUD with `extensions` subdocument. `ProjectExtensionRegistry` plugin interface. Pagination, filtering, sorting. |
| 2.2 | **Trunk: Tasks** | Full CRUD. Status state machine. Dependencies. Assignment. `TaskExtensionRegistry`. |
| 2.3 | **Trunk: Daily Reports** | Full CRUD. Weather, labor, activities, issues, delays, photos. Approval workflow (Draft → Submitted → Approved). `ReportExtensionRegistry`. |
| 2.4 | **Trunk: Documents** | S3 Pre-Signed URL upload flow. Versioning (immutable files). Folder hierarchy. Approval workflows. |
| 2.5 | **Trunk: Equipment** | Full CRUD. Status tracking. Project assignment. Maintenance scheduling. `EquipmentExtensionRegistry`. |
| 2.6 | **Root: Notifications** | In-app notification center (WebSockets). Email channel (SES/SendGrid). Debouncing & timezone rules. |
| 2.7 | **Root: Real-Time** | Socket.io gateway. Redis adapter. Room-based broadcasting (org rooms, project rooms). |
| 2.8 | **Web UI: Core Modules** | Build all Trunk UI pages: Project list/detail, Task kanban/list, Daily Report wizard, Document explorer, Equipment grid. |
| 2.9 | **Web UI: Dashboard** | Organization-level dashboard with project cards, recent activity feed, and key metrics. |
| 2.10 | **Web UI: Global Search** | Cmd+K Omnibox with multi-entity search (projects, tasks, documents, users). |

**Deliverable:** A fully functional field operations platform. Users can manage projects, assign tasks, submit daily reports, upload documents, and track equipment. All features are industry-agnostic.

---

### Phase 3: Construction Branch (Weeks 8–10)

**Goal:** Prove the Tree Architecture works by adding the first industry branch without modifying any Root or Trunk code.

| Step | What | Details |
|---|---|---|
| 3.1 | **Branch: Extension Plugins** | Create `con-project.plugin.ts`, `con-task.plugin.ts`, `con-report.plugin.ts`, `con-equipment.plugin.ts` with Zod validation schemas for construction-specific `extensions`. |
| 3.2 | **Branch: Safety Incidents** | `con_safety_incidents` collection. Full CRUD. OSHA fields. Investigation workflow. |
| 3.3 | **Branch: Change Orders** | `con_change_orders` collection. Full CRUD. Cost/schedule impact tracking. Approval workflow. |
| 3.4 | **Branch: Purchase Orders** | `con_purchase_orders` collection. Line items. Delivery tracking. |
| 3.5 | **Branch: COI** | `con_coi` collection. Subcontractor insurance compliance tracking. Expiry alerts. |
| 3.6 | **Branch: Construction UI** | Dynamic extension field renderers for Trunk forms. Safety incident pages. Change order management. |
| 3.7 | **Validation Test** | Run the Tree Architecture Validation Checklist (Doc 00 §10): Confirm ZERO Root/Trunk files were modified. |

**Deliverable:** A construction company can use every feature. The platform speaks construction (phases, trades, RFIs, OSHA). The Tree Architecture is proven.

---

### Phase 4: Mobile & Offline (Weeks 11–13)
*(React Native + WatermelonDB — as defined in Doc 15)*

### Phase 5: AI Intelligence (Weeks 14–16)
*(Python FastAPI + RAG Pipeline + Vector Search — as defined in Doc 10)*

### Phase 6: Enterprise & Polish (Weeks 17–20)
*(SAML SSO, Custom Roles, Advanced Analytics — as defined in Doc 19)*

---

## Potential Blockers & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| **Extension Plugin system adds complexity** | Trunk services become harder to reason about | Build a reference implementation (Projects) first and use it as the template for all other Trunk entities. |
| **Mongoose `Schema.Types.Mixed` lacks type safety** | Runtime errors in `extensions` data | Zod schemas in `packages/validators` provide compile-time AND runtime validation. The DB stores loosely, but the API validates strictly. |
| **Turborepo workspace linking breaks** | Import resolution errors across packages | Lock Turborepo version. Use `tsconfig` path aliases. Test cross-package imports in CI. |
| **MongoDB replica set required locally** | Change Streams need replica sets | Docker Compose provisions a single-node replica set (`--replSet rs0`) for local dev. |
| **RBAC caching stale data** | User sees stale permissions after role change | Redis cache is invalidated immediately on role mutation. WebSocket pushes a `permissions.updated` event to force client-side refresh. |

---

## Open Questions for Your Review

> [!IMPORTANT]
> Before we start scaffolding, please confirm these decisions:

1. **Tailwind + Shadcn UI** is confirmed as the UI system (Doc 00 specifies this, but Doc 18 mentions "Vanilla CSS for maximum flexibility"). Which do we go with?

2. **Package Manager:** `pnpm` (recommended for monorepos due to strict dependency resolution and disk efficiency) or `npm`?

3. **Should we scaffold the Python AI service directory now** (as an empty placeholder in `apps/ai-service/`) even though we won't build it until Phase 5, or keep the monorepo lean and add it later?

4. **Local database:** Docker Compose for MongoDB + Redis, or do you have a MongoDB Atlas cluster already provisioned that you'd prefer to use for development?
