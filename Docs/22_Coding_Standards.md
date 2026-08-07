# Doc 22 — Coding Standards

**Document ID:** PULSE-DOC-22
**Version:** 1.0
**Status:** Draft
**Last Updated:** August 3, 2026
**Author:** Pulse Engineering Team
**Depends On:** [Doc 04 (Architecture)](./04_System_Architecture.md)

---

## Table of Contents

1. [Monorepo Structure](#1-monorepo-structure)
2. [The Tree Architecture in Code](#2-the-tree-architecture-in-code)
3. [TypeScript & Linting Rules](#3-typescript--linting-rules)
4. [Naming Conventions](#4-naming-conventions)
5. [Error Handling & Responses](#5-error-handling--responses)

---

## 1. Monorepo Structure

Pulse utilizes a monorepo managed by **Turborepo** or **Nx** to share types, schemas, and UI components across the frontend, mobile, and backend.

```text
/pulse-monorepo
├── apps/
│   ├── web/               # Next.js Frontend
│   ├── mobile/            # React Native (Expo)
│   ├── api/               # NestJS Backend
│   └── ai-service/        # Python FastAPI
├── packages/
│   ├── core-types/        # Shared TS interfaces (Root & Trunk)
│   ├── branch-types/      # Shared TS interfaces (e.g., Construction)
│   ├── ui-system/         # Shared React components
│   └── eslint-config/     # Shared lint rules
└── package.json
```

---

## 2. The Tree Architecture in Code

The `apps/api` (NestJS) directory strictly enforces the Tree Architecture via its module folder structure. 

### 2.1 Backend Folder Structure
```text
src/
├── root/                  # Foundational modules
│   ├── auth/
│   ├── organizations/
│   └── users/
├── trunk/                 # Core domain modules
│   ├── projects/
│   ├── tasks/
│   └── daily-reports/
└── branch/                # Industry extensions
    ├── construction/
    │   ├── safety/
    │   └── change-orders/
    └── agriculture/       # Future phase
```

### 2.2 The Dependency Rule (CRITICAL)
- **Root** cannot import from Trunk or Branch.
- **Trunk** can import from Root. It **CANNOT** import from Branch.
- **Branch** can import from Root and Trunk.
- *If `trunk/daily-reports` imports a type or service from `branch/construction`, the CI pipeline will fail the build via dependency-cruiser rules.*

---

## 3. TypeScript & Linting Rules

### 3.1 Strict Mode
TypeScript `strict: true` is mandatory across all apps. `any` types are explicitly banned and will fail the build. If a type is unknown, use `unknown` and assert it safely.

### 3.2 ESLint & Prettier
Formatting is not up for debate. Prettier formats the code on save, and ESLint enforces patterns.
- Prefer `const` over `let`.
- Prefer Arrow Functions for anonymous callbacks.
- Enforce explicit return types on all exported functions and API controllers.

---

## 4. Naming Conventions

Consistency across the stack reduces cognitive load.

| Context | Convention | Example |
|---|---|---|
| Database Collections | `snake_case`, plural | `daily_reports`, `con_change_orders` |
| JSON API Payloads | `camelCase` | `{"projectId": "123", "startDate": "..."}` |
| File Names (TS/React) | `kebab-case.ts` | `create-project.dto.ts`, `task-card.tsx` |
| React Components | `PascalCase` | `export const TaskCard = () => {}` |
| TypeScript Interfaces | `PascalCase` | `export interface DailyReport {}` (No 'I' prefix) |

---

## 5. Error Handling & Responses

As defined in Doc 06, backend engineers must never return arbitrary error strings.

### 5.1 NestJS Exceptions
Always use standard NestJS exceptions (`BadRequestException`, `NotFoundException`, `ForbiddenException`). 

### 5.2 Custom Exception Filter
A global Exception Filter catches all errors and normalizes them into the RFC 7807 standard:

```javascript
// Good
throw new ForbiddenException('Missing permission: task:delete');

// Bad
res.status(403).send('You cant do that');
```

---

> **Previous Document:** [Doc 21 — Deployment Guide](./21_Deployment_Guide.md)
> **Next Document:** [Doc 23 — AI Coding Instructions](./23_AI_Coding_Instructions.md)
