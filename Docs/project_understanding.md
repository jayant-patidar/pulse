# Pulse — Project Understanding

> **"The Operating System for Field Operations."**

---

## What Is Pulse?

Pulse is a **cloud-native Field Operations Management Platform** — a multi-tenant SaaS product designed for organizations whose employees work **outside the office**. It's not a project management tool (no Kanban boards), not a generic ERP, and not a CRUD app. It's a purpose-built digital backbone for field operations.

---

## The Problem Being Solved

Field operations are one of the **least digitized industries**. Companies still rely on Excel, WhatsApp, emails, PDFs, phone calls, printed forms, clipboards, and whiteboards. This causes:

- Fragmented information across tools
- Managers never have a complete picture
- Workers waste hours daily
- Documents get lost, equipment disappears
- Budgets overrun, safety incidents go unreported
- Knowledge stays in people's heads
- AI can't help because data is scattered

---

## 🌳 The Tree Architecture — Foundational Principle

> [!IMPORTANT]
> This is the single most important architectural decision in Pulse. Every design choice — data models, database schemas, APIs, frontend components, AI pipelines — must follow this principle.

### The Analogy

Pulse is a **tree**:

```
                        🌳 PULSE
                          │
          ┌───────────────┼───────────────────┐
          │               │                   │
    🌿 Construction  🌿 Agriculture     🌿 Energy
     (Branch 1)      (Branch 2)       (Branch 3)
      BUILT NOW       FUTURE            FUTURE
          │
          │
    ══════╪═══════════════════════════════════════  ← TRUNK
          │                                           (shared core)
          │
    ══════╪═══════════════════════════════════════  ← ROOT
          │                                           (foundation)
          │
       🌍 Platform
```

### What This Means

| Layer | What It Contains | Rule |
|---|---|---|
| **Root** (Foundation) | Auth, multi-tenancy, RBAC, core DB infrastructure, file storage, notifications, event bus, AI engine | **Never changes when adding a new industry** |
| **Trunk** (Shared Core) | Generic concepts that all industries share: Organizations, Users, Projects, Tasks, Documents, Equipment, Daily Reports, Workflows | **Never changes when adding a new industry** |
| **Branch** (Industry Vertical) | Industry-specific schemas, forms, terminology, workflows, validations, dashboards, reports | **Each branch is independent. Adding agriculture does NOT touch anything in construction.** |

### The Three Rules

1. **Build root and trunk FIRST** — these are industry-agnostic and shared by all verticals
2. **Build Construction as the first branch** — all construction-specific logic lives in its own isolated layer
3. **When a new industry is added later** — only new branch code is written. Zero modifications to root, trunk, or any existing branch.

---

## How the Tree Architecture Affects Every Layer

### Data Model

```
ROOT LAYER (shared foundation):
├── User                    → universal (name, email, auth)
├── Organization            → universal (company profile, settings)
├── Role / Permission       → universal (RBAC engine)
├── Notification            → universal (delivery system)
└── AuditLog                → universal (who did what, when)

TRUNK LAYER (shared domain concepts):
├── Project                 → generic (name, dates, status, budget, location)
├── ProjectMember           → generic (user + role on project)
├── Task                    → generic (title, assignee, status, priority, dependencies)
├── DailyReport             → generic (date, weather, workers, activities, issues, photos)
├── Document                → generic (file, type, version, permissions)
├── Equipment               → generic (name, type, status, location, maintenance)
├── Workflow                → generic (approval steps, dynamic forms)
├── Comment                 → generic (polymorphic, attachable to anything)
└── AIConversation          → generic (context-aware AI thread)

BRANCH LAYER — Construction (industry-specific extensions):
├── ConstructionProject     → extends Project (phases, floors, trades, permits)
├── ConstructionDailyReport → extends DailyReport (concrete poured, crane hours, safety)
├── ConstructionTask        → extends Task (trade-specific fields, RFIs, submittals)
├── ConstructionDocument    → extends Document (blueprints, shop drawings, change orders)
├── ConstructionEquipment   → extends Equipment (heavy machinery types, load capacity)
├── ConstructionSafety      → new (incidents, near-misses, PPE, OSHA compliance)
├── ConstructionProcurement → new (material requests, POs, supplier comparison)
├── ConstructionFinance     → new (cost codes, retainage, progress billing)
└── ContractorPortal        → new (subcontractor management, lien waivers)

BRANCH LAYER — Agriculture (FUTURE, example):
├── AgricultureProject      → extends Project (crop type, field size, season)
├── AgricultureDailyReport  → extends DailyReport (soil moisture, pest reports)
├── AgricultureEquipment    → extends Equipment (tractor types, implements)
└── AgricultureCompliance   → new (organic certification, EPA reporting)
```

> [!NOTE]
> When we build Agriculture later, we write **only** the Agriculture branch files. The root, trunk, and construction branch remain **completely untouched**.

### Database Design (MongoDB)

The tree architecture maps naturally to MongoDB's document model:

```
SHARED COLLECTIONS (root + trunk):
├── users                → all industries
├── organizations        → all industries
├── projects             → all industries (shared fields)
├── tasks                → all industries (shared fields)
├── daily_reports        → all industries (shared fields)
├── documents            → all industries (shared fields)
├── equipment            → all industries (shared fields)
├── notifications        → all industries
├── workflows            → all industries
├── ai_conversations     → all industries
└── audit_logs           → all industries

EXTENSION PATTERN (per industry):
Each shared collection has a flexible "extensions" or "metadata" subdocument:
{
  "_id": "project001",
  "name": "Downtown Tower",                    ← trunk field
  "organizationId": "org123",                  ← trunk field
  "industry": "CONSTRUCTION",                  ← trunk field (discriminator)
  "status": "ACTIVE",                          ← trunk field
  "startDate": "2026-01-01",                   ← trunk field
  "extensions": {                              ← BRANCH-SPECIFIC
    "phases": ["Foundation", "Framing"],
    "floors": 12,
    "trades": ["Electrical", "Plumbing"],
    "permitNumber": "CON-2026-0042"
  }
}

INDUSTRY-SPECIFIC COLLECTIONS (branch only):
├── construction_safety_reports    → only for construction
├── construction_rfis              → only for construction
├── construction_change_orders     → only for construction
└── (future) agriculture_crop_logs → only for agriculture
```

> [!TIP]
> The `industry` field acts as a **discriminator** — the trunk schema stays the same, and each branch defines its own `extensions` shape and industry-specific collections. Adding a new industry means defining new extension schemas and new collections — never altering existing ones.

### API Design

```
ROOT APIs (shared):
├── POST   /api/auth/login
├── POST   /api/auth/register
├── GET    /api/organizations/:id
├── GET    /api/notifications
└── ...

TRUNK APIs (shared, industry-aware):
├── GET    /api/projects                       → returns projects filtered by org
├── POST   /api/projects                       → accepts trunk + extensions
├── GET    /api/projects/:id/daily-reports
├── GET    /api/projects/:id/tasks
├── GET    /api/projects/:id/documents
├── GET    /api/projects/:id/equipment
└── ...

BRANCH APIs (construction-specific):
├── GET    /api/construction/projects/:id/safety
├── POST   /api/construction/projects/:id/rfis
├── GET    /api/construction/projects/:id/change-orders
├── GET    /api/construction/projects/:id/procurement
└── ...

BRANCH APIs (agriculture, FUTURE):
├── GET    /api/agriculture/projects/:id/crop-logs
├── POST   /api/agriculture/projects/:id/soil-reports
└── ...
```

### Frontend Architecture

```
src/
├── core/                          ← ROOT (shared foundation)
│   ├── auth/
│   ├── layouts/
│   ├── components/                ← design system, shared UI
│   ├── hooks/
│   └── services/
│
├── modules/                       ← TRUNK (shared domain UI)
│   ├── organizations/
│   ├── projects/
│   ├── tasks/
│   ├── daily-reports/
│   ├── documents/
│   ├── equipment/
│   ├── notifications/
│   └── ai-assistant/
│
├── verticals/                     ← BRANCHES (industry-specific)
│   ├── construction/              ← Branch 1 (BUILDING NOW)
│   │   ├── components/
│   │   ├── forms/
│   │   ├── dashboards/
│   │   ├── safety/
│   │   ├── procurement/
│   │   └── extensions/            ← construction-specific field renderers
│   │
│   ├── agriculture/               ← Branch 2 (FUTURE)
│   │   ├── components/
│   │   ├── forms/
│   │   └── ...
│   └── ...
│
└── config/
    └── verticals.ts               ← registry of available industry verticals
```

### AI Architecture

```
SHARED AI ENGINE (root):
├── RAG pipeline                    → works on ANY document from ANY industry
├── Embedding service               → industry-agnostic text → vector
├── LLM orchestration               → prompt routing, context management
├── Conversation management         → stores threads for any context
└── Smart search                    → searches across all data types

INDUSTRY-SPECIFIC AI (branch):
├── Construction prompt templates   → "What is delaying this project?"
├── Construction report summarizer  → knows construction terminology
├── Construction safety analyzer    → interprets OSHA categories
└── (future) Agriculture prompts    → "What's the expected yield?"
```

---

## Target Industries

Construction is the **first branch**. Future branches include:

| Industry Category | Examples | Status |
|---|---|---|
| **Construction & Trades** | General contractors, electrical, plumbing, HVAC | 🟢 **First Branch** |
| Energy & Infrastructure | Solar, telecom, utilities, oil & gas, mining | 🔵 Future |
| Maintenance & Facilities | Facility management, equipment rental, landscaping | 🔵 Future |
| Government & Public | Municipal public works, road maintenance, railway, airports | 🔵 Future |
| Agriculture | Farming operations | 🔵 Future |
| Inspection Services | Building inspections, environmental compliance | 🔵 Future |

---

## Core Modules — Trunk vs. Branch Breakdown

### Trunk Modules (shared by ALL industries)

#### 1. Organization Management
- Multi-tenant SaaS — each company has its own isolated workspace
- Company registration & profile (name, industry, settings, timezone, currency)
- User invitation system
- Roles (Owner, Admin, Manager, Supervisor, Worker, Client) — generic role engine
- Permission engine (RBAC) — granular, resource-level permissions

#### 2. User & Workforce Management
- Employee/contractor profiles with skills, certifications, availability
- Team management, document associations
- Skills and certifications are **dynamic** — each industry defines its own skill sets

#### 3. Project Management
- Projects with milestones, tasks, assignments
- Progress tracking, project timelines, budgets
- Location (address + GPS coordinates)
- Project members with project-level roles
- **Industry-specific fields live in `extensions`**, not in the core schema

#### 4. Site Operations (Daily Reports)
- **Key differentiator** — daily reports with weather, worker count, activities, issues, delays, photos
- Core structure is shared; industry-specific sections are in `extensions`
- Becomes searchable operational history

#### 5. Task & Workflow Management
- Assignments, status, priority, dependencies, comments, attachments
- Dynamic workflow engine — configurable approval flows
- **NOT generic Jira tasks** — each industry defines domain-meaningful task types via extensions

#### 6. Document Management
- Upload, organize, search, share, version control
- Generic document types (contract, permit, report, photo, drawing)
- Industry-specific document types registered per branch

#### 7. Equipment Management
- Equipment list, assignment to projects, maintenance history, availability tracking
- Generic fields shared; branch adds industry-specific equipment attributes

#### 8. Notifications
- Task deadlines, safety alerts, delivery updates, approval requests
- Email, SMS, push, in-app
- Event-driven — triggered by trunk/branch events equally

---

### Construction Branch Modules (FIRST VERTICAL — specific to construction)

#### C1. Construction Safety
- Safety inspections, incidents, near misses
- PPE tracking, compliance (OSHA)
- Safety checklists specific to construction trades

#### C2. Construction Procurement
- Material requests, purchase orders
- Supplier management and comparison
- Delivery tracking

#### C3. Construction Finance
- Cost codes, budgets per phase
- Retainage, progress billing
- Expense tracking, cost forecasting

#### C4. Contractor Portal
- Subcontractor onboarding and management
- Work orders, invoices, approvals, payments
- Lien waivers, insurance tracking

#### C5. Client Portal
- Clients view project progress, photos, documents
- Invoice viewing, payment status
- Approval workflows

#### C6. Construction-Specific Extensions
- Project: phases, floors/levels, trades involved, permit numbers
- Daily Report: concrete poured (m³), crane hours, weather impact assessment
- Tasks: RFIs, submittals, punch lists, change orders
- Documents: blueprints, shop drawings, as-built drawings
- Equipment: heavy machinery (excavators, cranes), load capacity, operator certification

---

## AI Layer (~15% of project)

AI **enhances** the platform — it doesn't replace it.

### Shared AI Engine (Trunk)

| AI Feature | Description |
|---|---|
| **Document Intelligence (RAG)** | Upload PDFs → extract text → embeddings → vector DB → ask natural language questions |
| **Daily Report Summarizer** | Aggregates 20+ daily reports into concise weekly summaries |
| **Smart Search** | Natural language queries across reports, documents, photos, tasks |
| **Project Assistant** | "What is delaying Project A?" → analyzes tasks, reports, issues, documents |
| **Meeting Summaries** | Upload transcript → action items, owners, deadlines |

### Construction-Specific AI (Branch)

| AI Feature | Description |
|---|---|
| **RFI Assistant** | Draft Requests for Information using construction project context |
| **Blueprint Assistant** | Upload construction drawings → ask "Where are emergency exits?" |
| **Material Assistant** | "How much concrete have we poured this month?" → queries construction-specific data |
| **Safety Analyzer** | Analyze incident patterns, predict risk areas on construction sites |

> [!NOTE]
> When Agriculture is added later, it gets its own branch AI features (e.g., "Crop yield predictor", "Pest detection analyzer") without touching any construction AI code.

---

## Tech Stack (MVP)

| Layer | Technology |
|---|---|
| **Frontend** | Next.js, TypeScript, React, Tailwind CSS, Shadcn UI, React Query, Zustand |
| **Backend** | Node.js, TypeScript, NestJS (Controller → Service → Repository pattern) |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Cache** | Redis |
| **File Storage** | AWS S3 (later) |
| **AI Service** | Python, FastAPI (separate service) |
| **LLM** | OpenAI / Claude / Gemini API |
| **Vector DB** | MongoDB Atlas Vector Search (or Pinecone) |
| **Auth** | JWT + OAuth |
| **Realtime** | WebSockets |
| **Background Jobs** | BullMQ |

### Why MongoDB?
- Field ops generate semi-structured data
- Daily reports vary by company/industry — `extensions` pattern is natural in MongoDB
- Custom forms, checklists, workflows evolve frequently
- The **discriminator + extensions** pattern maps perfectly to MongoDB's flexible document model
- Each industry can define its own shapes without schema migrations on shared collections
- Future: PostgreSQL for financials, Elasticsearch for enterprise search

---

## Development Phases

| Phase | Focus | What Gets Built |
|---|---|---|
| **Phase 1 — Root & Trunk Foundation** | Auth + Org + Core | Authentication, organization, users, roles, permissions, generic project structure |
| **Phase 2 — Construction Branch** | First Vertical | Construction-specific extensions, safety, procurement, contractor portal |
| **Phase 3 — Field Operations (Trunk)** | Daily Work | Workforce, tasks, daily reports, documents, equipment (all generic/shared) |
| **Phase 4 — AI** | Intelligence | Shared AI engine + construction-specific AI features |
| **Phase 5 — Polish** | UX & Scale | Mobile app, real-time updates, advanced analytics |
| **Phase 6 — Cloud & DevOps** | Production | Docker, CI/CD, AWS/GCP, Kubernetes, Terraform, monitoring |
| **Future Phases** | New Branches | Agriculture, energy, etc. — only new branch code, zero changes to existing |

---

## Documentation Plan (from [raw data 2](file:///c:/Users/patid/Desktop/Pulse/Docs/raw%20data%202))

A professional engineering documentation set of **~20-25 documents** to be built one by one. Each document must reflect the tree architecture — clearly separating root, trunk, and branch concerns:

| # | Document | Key Contents |
|---|---|---|
| 00 | Vision & Product Strategy | Mission, vision, problem, market, competitors, personas, business model, **tree architecture principle** |
| 01 | Product Requirements (PRD) | Every feature, workflow, module — **organized by root/trunk/branch** — acceptance criteria, user stories |
| 02 | Functional Requirements | Hundreds of functional requirements — **tagged as root, trunk, or construction-branch** |
| 03 | Non-Functional Requirements | Performance, availability, scalability, security, accessibility, compliance |
| 04 | System Architecture | Module boundaries, communication, design patterns, **extension/plugin pattern for verticals** |
| 05 | Database Design | Collections, relationships, indexes, audit strategy, **extensions pattern, discriminator fields** |
| 06 | API Design | REST endpoints — **trunk APIs vs. branch APIs**, request/response, auth, versioning, errors, pagination |
| 07 | Auth & Authorization | RBAC, organizations, projects, teams, permissions, SSO, OAuth, JWT — **industry-agnostic permission engine** |
| 08 | Cloud Architecture | AWS, Terraform, VPC, EKS, RDS, S3, CloudFront, IAM, DR |
| 09 | DevOps | Docker, K8s, Helm, Terraform, GitHub Actions, GitOps, autoscaling |
| 10 | AI Architecture | RAG, MCP, LLM integration, prompt library, vector DB, agents — **shared engine + branch prompt templates** |
| 11 | Event-Driven Architecture | Kafka, queues, events, retries, DLQ, idempotency — **events are typed: trunk events vs. branch events** |
| 12 | Document Management | Storage, versioning, permissions, OCR, metadata, approval workflows |
| 13 | Notification System | Email, SMS, push, in-app, queues, scheduling |
| 14 | Search Engine | Global search, filters, AI search, Elastic/OpenSearch |
| 15 | Mobile Strategy | Offline support, sync, GPS, camera |
| 16 | Monitoring | Prometheus, Grafana, OpenTelemetry, logging, tracing, alerts |
| 17 | Security | Encryption, OWASP, audit, rate limiting, IAM, secrets, compliance |
| 18 | UI/UX Design System | Design language, navigation, layouts, components, themes — **shared design system + vertical-specific themes** |
| 19 | Development Roadmap | MVP → v2 → v3 → Enterprise — **roadmap per vertical** |
| 20 | Testing Strategy | Unit, integration, E2E, performance, security, load, chaos |
| 21 | Deployment Guide | Development, staging, production |
| 22 | Coding Standards | Folder structure, naming, architecture rules — **trunk vs. branch code organization** |
| 23 | AI Coding Instructions | How the IDE should generate code, conventions, patterns, libraries |

---

## Key Design Principles

1. **🌳 Tree Architecture** — shared root/trunk, independent industry branches. Adding a new industry = adding a new branch only. Zero modifications to existing code.
2. **Construction first, all industries eventually** — build the construction branch now, but every shared concept must be industry-agnostic from day one.
3. **Multi-tenant SaaS from day one** — many companies from many industries on one platform.
4. **Extensions over modifications** — industry-specific fields live in `extensions` subdocuments, not in the core schema. The core schema never knows about construction, agriculture, or any specific industry.
5. **Product-first, infrastructure later** — build the product before adding DevOps.
6. **AI enhances, doesn't replace** — AI is ~15% of the project.
7. **Not another Kanban board** — think in terms of real industry workflows, not generic task boards.
8. **Feel like a real company** — enterprise-grade architecture, not a portfolio demo.
9. **Open-Closed Principle at scale** — the platform is **open for extension** (new industries) but **closed for modification** (existing code doesn't change).

---

## Tree Architecture Validation Checklist

Before any design decision is finalized, it must pass this checklist:

- [ ] Can this feature work for ALL industries, or is it construction-specific?
- [ ] If construction-specific, does it live in the `construction` branch only?
- [ ] If shared, does the trunk implementation have zero construction-specific logic?
- [ ] If we add Agriculture tomorrow, would ANY existing file need to change?
- [ ] Are industry-specific fields in `extensions`, not hardcoded into shared schemas?
- [ ] Are industry-specific API routes namespaced under `/api/{industry}/...`?
- [ ] Are industry-specific UI components inside `verticals/{industry}/`?

> [!CAUTION]
> If the answer to "would any existing file need to change?" is **yes**, the design violates the tree architecture and must be refactored before proceeding.

---

> [!NOTE]
> This document captures the complete project understanding based on all 5 raw data files, now restructured around the Tree Architecture principle. Ready to start building the documentation set one document at a time — starting with **Doc 00: Vision & Product Strategy**.
