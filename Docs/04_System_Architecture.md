# Doc 04 — System Architecture

**Document ID:** PULSE-DOC-04
**Version:** 1.0
**Status:** Draft
**Last Updated:** August 3, 2026
**Author:** Pulse Engineering Team
**Depends On:** [Doc 00](./00_Vision_and_Product_Strategy.md), [Doc 01](./01_Product_Requirements_Document.md), [Doc 02](./02_Functional_Requirements.md)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Technology Stack](#2-technology-stack)
3. [The Tree Architecture in Code](#3-the-tree-architecture-in-code)
4. [The Plugin/Extension Pattern](#4-the-pluginextension-pattern)
5. [Core System Components](#5-core-system-components)
6. [Communication Patterns](#6-communication-patterns)
7. [AI Subsystem Architecture](#7-ai-subsystem-architecture)
8. [Data Architecture Summary](#8-data-architecture-summary)

---

## 1. Architecture Overview

Pulse is designed as a **Modular Monolith** that can easily transition into microservices as scaling demands. It employs a modern, cloud-native architecture with a strong emphasis on real-time capabilities and strict tenant isolation.

### High-Level System Diagram

```mermaid
graph TD
    %% Clients
    ClientWeb[Web App / SPA]
    ClientMob[Mobile App / PWA]
    ClientExt[External API Clients]

    %% Load Balancer / API Gateway
    LB[API Gateway / Load Balancer]

    %% Core Application (NestJS Modular Monolith)
    subgraph Pulse Core [Pulse Backend - NestJS Modular Monolith]
        RootMod[Root Modules: Auth, Tenant, RBAC]
        TrunkMod[Trunk Modules: Projects, Tasks, Docs]
        BranchMod[Branch Modules: Construction, etc.]
        
        RootMod <--> TrunkMod
        TrunkMod <--> BranchMod
    end

    %% Real-time & Background
    WS[WebSocket Gateway]
    Queue[BullMQ Job Queues]
    Worker[Background Workers]

    %% AI Service (Python)
    subgraph AI Subsystem
        AIGateway[FastAPI AI Service]
        LLM[LLM Provider - OpenAI/Claude]
        RAG[RAG Pipeline]
    end

    %% Data Stores
    DB[(MongoDB Atlas)]
    Cache[(Redis Cache)]
    Storage[(S3 Object Storage)]

    %% Connections
    ClientWeb <--> LB
    ClientMob <--> LB
    ClientExt <--> LB
    
    ClientWeb <..> WS
    ClientMob <..> WS

    LB <--> PulseCore
    WS <--> PulseCore
    
    PulseCore <--> DB
    PulseCore <--> Cache
    PulseCore --> Storage
    PulseCore --> Queue
    Queue --> Worker
    Worker --> DB
    
    PulseCore <--> AIGateway
    AIGateway <--> LLM
    AIGateway <--> DB
```

---

## 2. Technology Stack

Pulse uses a unified TypeScript stack for the primary application to maximize developer velocity and code sharing, with Python reserved exclusively for the AI subsystem.

### Frontend
- **Framework:** Next.js (React) - App Router
- **Language:** TypeScript
- **State Management:** Zustand (Client State), React Query (Server State)
- **Styling:** Tailwind CSS + Shadcn UI
- **Forms:** React Hook Form + Zod validation

### Backend (Core)
- **Framework:** NestJS (Node.js)
- **Language:** TypeScript
- **Architecture:** Domain-Driven Design (DDD), Modular Monolith
- **Validation:** class-validator, Zod (for dynamic branch validation)
- **Real-Time:** Socket.io (WebSocket)

### AI Subsystem
- **Framework:** FastAPI
- **Language:** Python
- **Orchestration:** LangChain / LlamaIndex
- **Embeddings/LLM:** Configurable (OpenAI, Anthropic, Gemini)

### Data & Infrastructure
- **Primary Database:** MongoDB Atlas (Document Store)
- **Vector Database:** MongoDB Atlas Vector Search
- **Caching & Queues:** Redis (BullMQ for background jobs)
- **Object Storage:** AWS S3 (or compatible, e.g., Cloudflare R2)

---

## 3. The Tree Architecture in Code

The Tree Architecture (defined in Doc 00) is the guiding principle of the entire codebase. It is enforced physically through directory structure and logically through Dependency Injection.

### 3.1 Directory Structure

The backend repository is strictly partitioned:

```text
src/
├── root/                 # 🌍 FOUNDATION (Industry Agnostic)
│   ├── auth/             # Auth, JWT, Sessions
│   ├── tenant/           # Organization management
│   ├── rbac/             # Roles and permissions
│   └── notifications/    # Email, Push, WS alerts
│
├── trunk/                # 🪵 SHARED CORE (Industry Agnostic)
│   ├── projects/         # Core project logic
│   ├── tasks/            # Core task logic
│   ├── reports/          # Core daily report logic
│   └── documents/        # Core document logic
│
└── branches/             # 🌿 VERTICALS (Industry Specific)
    ├── construction/     # Everything specific to construction
    │   ├── safety/       # OSHA forms, incidents
    │   ├── finance/      # Retainage, cost codes
    │   └── extensions/   # Construction-specific trunk extensions
    │
    └── agriculture/      # (Future) Everything specific to agriculture
```

### 3.2 Dependency Rules

To prevent the system from becoming a tangled monolith, strict import rules are enforced via ESLint:

1. **Root** modules can ONLY import other Root modules.
2. **Trunk** modules can import Root modules and other Trunk modules.
3. **Branch** modules can import Root and Trunk modules.
4. **CRITICAL:** Trunk and Root modules **CANNOT** import Branch modules. (A core `Project` service cannot know about `ConstructionSafety`).
5. **CRITICAL:** Branches **CANNOT** import from other Branches. (Construction cannot import from Agriculture).

---

## 4. The Plugin/Extension Pattern

If the Trunk cannot import from the Branch, how does a Trunk entity (like a Project) save and validate Branch-specific data (like Construction Phases)? 

We use the **Registry/Plugin Pattern**.

### 4.1 The Extension Interface

Every extensible Trunk entity exposes an Extension interface.

```typescript
// trunk/projects/interfaces/project-extension.interface.ts
export interface ProjectExtensionPlugin {
  industry: string;
  validateExtensions(data: any): Promise<boolean>;
  onProjectCreated(project: Project): Promise<void>;
}
```

### 4.2 Branch Registration (Dependency Injection)

During application bootstrap, branches register their plugins with the Trunk services using NestJS Dependency Injection.

```typescript
// branches/construction/construction.module.ts
@Module({
  imports: [ProjectsTrunkModule],
  providers: [
    ConstructionProjectPlugin,
    {
      provide: 'PROJECT_EXTENSION_REGISTRY',
      useFactory: (plugin: ConstructionProjectPlugin, registry: ProjectRegistryService) => {
        registry.registerPlugin(plugin); // Injects construction logic into the Trunk
      },
      inject: [ConstructionProjectPlugin, ProjectRegistryService],
    },
  ],
})
export class ConstructionBranchModule {}
```

### 4.3 Runtime Execution

When a user creates a project:
1. The `ProjectsController` (Trunk) receives the payload.
2. It looks at the user's `organization.industry` (e.g., `"CONSTRUCTION"`).
3. It asks the `ProjectRegistryService`: *"Do you have a plugin for CONSTRUCTION?"*
4. The Registry passes the `extensions` JSON payload to the `ConstructionProjectPlugin.validateExtensions()` method.
5. If valid, the Trunk saves the document to MongoDB.
6. The Registry fires `onProjectCreated()`, allowing the Construction branch to execute specific logic (e.g., setting up default construction safety folders) without the Trunk knowing what happened.

---

## 5. Core System Components

### 5.1 API Gateway & Routing

- All external traffic passes through an API Gateway / Load Balancer.
- The NestJS app exposes RESTful APIs prefixed with `/api/v1/`.
- Routes are logically grouped:
  - `/api/v1/root/...` (Auth, Org settings)
  - `/api/v1/trunk/projects/...` (Core operations)
  - `/api/v1/branch/construction/safety/...` (Branch-specific operations)

### 5.2 Multi-Tenant Data Access Layer

To satisfy FRD Rule MT-F01, we use **Request-Scoped Providers** in NestJS.
1. The Authentication Middleware extracts the `organizationId` from the JWT.
2. It injects this ID into a Request-Scoped `TenantContext` service.
3. The custom `TenantModel` wrapper (around Mongoose) automatically intercepts all `find()`, `update()`, and `delete()` queries and appends `{ organizationId: currentOrgId }` to the query filter.
4. **Result:** Developers cannot accidentally query data across tenants, even if they forget to include the filter in their service logic.

### 5.3 Real-Time Engine

- Uses Socket.io backed by a Redis Adapter.
- The Redis Adapter allows WebSocket events to be broadcast across multiple horizontal Node.js application instances.
- Rooms are dynamically joined based on JWT claims (e.g., user joins `org_123` and `project_456`).

---

## 6. Communication Patterns

### 6.1 Synchronous (REST)

Used for direct user interactions where immediate feedback is required (e.g., creating a task, updating a profile, fetching a dashboard).

### 6.2 Asynchronous (BullMQ + Redis)

Used for heavy operations that should not block the HTTP request thread:
- Processing uploaded documents for the AI vector store.
- Sending batch emails or push notifications.
- Generating heavy PDF reports (e.g., AIA G702 Progress Billing).
- Data exports and archiving.

### 6.3 Event-Driven (Internal Pub/Sub)

To maintain loose coupling between Trunk and Branch, we use Node's internal `EventEmitter` (via NestJS EventEmitters).
- *Example:* Trunk `DailyReportService` emits `report.submitted`.
- *Example:* Branch `ConstructionSafetyService` listens for `report.submitted`, scans the report for safety keywords, and triggers a safety audit if necessary.

---

## 7. AI Subsystem Architecture

The AI features (RAG, Summarization) require Python for its superior ML ecosystem. This is isolated as a separate microservice.

### 7.1 Architecture Flow

1. **Document Ingestion:**
   - User uploads PDF to S3 via Next.js/NestJS.
   - NestJS drops an event in Redis Queue: `process_document`.
   - FastAPI (Python) worker picks up the job.
   - FastAPI downloads PDF, extracts text, chunks it, calls Embedding API.
   - FastAPI stores vectors in **MongoDB Atlas Vector Search**.

2. **Querying (RAG):**
   - User asks a question in the UI.
   - NestJS receives request, verifies RBAC, and forwards to FastAPI via internal REST call, including the user's accessible `projectIds`.
   - FastAPI converts question to vector, queries MongoDB Vector Search (filtering by `projectIds`), retrieves chunks.
   - FastAPI constructs prompt, calls LLM (OpenAI/Claude).
   - FastAPI returns response to NestJS → returned to User.

### 7.2 Why MongoDB Vector Search?

By using MongoDB Atlas for both the primary operational database and the vector store:
1. We eliminate the need to sync data between our DB and a separate vector DB (like Pinecone).
2. We can perform hybrid queries (e.g., "Vector search for 'water damage' BUT ONLY in Daily Reports created in the last 7 days for Project X").
3. Multi-tenant data isolation is vastly simplified.

---

## 8. Data Architecture Summary

### 8.1 MongoDB Collection Strategy

| Collection | Layer | Description |
|---|---|---|
| `users` | Root | Global user accounts (email, password hash). |
| `organizations` | Root | Tenant workspaces and settings. |
| `memberships` | Root | Maps Users to Organizations with Roles. |
| `projects` | Trunk | Core project data + `extensions` subdocument. |
| `tasks` | Trunk | Core task data + `extensions` subdocument. |
| `daily_reports` | Trunk | Core report data + `extensions` subdocument. |
| `documents` | Trunk | File metadata, versions, and AI processing status. |
| `construction_safety_incidents` | Branch | Exists ONLY for the Construction branch. |
| `construction_change_orders` | Branch | Exists ONLY for the Construction branch. |

### 8.2 The Extensions Subdocument Paradigm

Every Trunk document uses a flexible schema approach for branch data:

```json
{
  "_id": "proj_123",
  "organizationId": "org_789",
  "name": "Downtown Highrise",
  "status": "ACTIVE",
  
  // TRUNK DATA (Strictly typed, indexed, shared across all industries)
  "budget": 5000000,
  "startDate": "2026-01-01T00:00:00Z",
  
  // BRANCH DATA (Validated dynamically based on org.industry)
  "extensions": {
    "phases": ["Foundation", "Framing"],
    "permitNumber": "BLD-2026-991",
    "contractType": "GMP"
  }
}
```

This single architectural decision enables the entire Tree Architecture, allowing the platform to scale to infinite industries without database migration nightmares.

---

## Document Changelog

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | August 3, 2026 | Pulse Engineering Team | Initial document creation |

---

> **Previous Document:** [Doc 03 — Non-Functional Requirements](./03_Non_Functional_Requirements.md)
> **Next Document:** [Doc 05 — Database Design](./05_Database_Design.md)
