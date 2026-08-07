# Doc 23 — AI Coding Instructions

**Document ID:** PULSE-DOC-23
**Version:** 1.0
**Status:** Draft
**Last Updated:** August 3, 2026
**Author:** Pulse Engineering Team
**Depends On:** [Doc 01] through [Doc 22]

---

## Table of Contents

1. [Purpose & Setup](#1-purpose--setup)
2. [The Prime Directives (Non-Negotiable Rules)](#2-the-prime-directives-non-negotiable-rules)
3. [Backend Code Generation Patterns](#3-backend-code-generation-patterns)
4. [Frontend Code Generation Patterns](#4-frontend-code-generation-patterns)
5. [Database & Mongoose Generation Rules](#5-database--mongoose-generation-rules)

---

## 1. Purpose & Setup

This document serves as the **Meta-Prompt** and instruction manual for any AI coding assistant (e.g., GitHub Copilot, Cursor, or autonomous agents) generating code for the Pulse monorepo. 

**Instructions for the AI:** When tasked with writing code for the Pulse repository, you must read and internalize this document. Your generated code will be evaluated against these rules.

---

## 2. The Prime Directives (Non-Negotiable Rules)

If you violate these rules, your code is invalid.

1. **The Tree Architecture Dependency Rule:**
   - If writing code in `src/trunk/`, you **must not** import or reference anything specific to Construction, Agriculture, or any other industry.
   - If writing industry-specific logic, place it in `src/branch/{industry}/`.
2. **Implicit Multi-Tenancy:**
   - When writing API Controllers, **never** accept `organizationId` from the `req.body` or `req.query`.
   - Always extract it from the authenticated request context (e.g., `req.user.orgId`).
   - When writing DB queries, **always** include `organizationId: req.user.orgId` in the find/update filter.
3. **No Raw Queries:**
   - Always use the Mongoose ODM. Never use raw MongoDB `$db.command` unless explicitly requested for performance tuning.
4. **Strict TypeScript:**
   - Do not generate code containing `any`.
   - Provide explicit return types for all functions.

---

## 3. Backend Code Generation Patterns (NestJS)

When generating backend features, follow these patterns:

- **Dependency Injection:** Always use constructor injection for services and repositories. Do not instantiate classes directly.
- **DTOs:** Create separate Data Transfer Object classes for `Create` and `Update` operations. Use `class-validator` decorators (e.g., `@IsString()`, `@IsOptional()`) on all fields.
- **RBAC Guard:** Always decorate endpoint controllers with the custom permissions guard: 
  `@RequirePermissions('resource:action')`

**Example of Expected Controller Output:**
```typescript
@Controller('api/v1/trunk/tasks')
@UseGuards(JwtAuthGuard, RbacGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @RequirePermissions('task:create')
  async createTask(
    @User() user: JwtPayload, 
    @Body() dto: CreateTaskDto
  ): Promise<TaskResponse> {
    return this.tasksService.create(user.orgId, dto);
  }
}
```

---

## 4. Frontend Code Generation Patterns (Next.js/React)

- **Components:** Use functional components and React Hooks. Do not use class components.
- **Styling:** Use standard CSS or CSS modules (or Tailwind if configured). Maintain a premium, high-contrast aesthetic.
- **Data Fetching:** Use React Query (`@tanstack/react-query`) or SWR for all data fetching to ensure caching and background refetching.
- **State Management:** Keep state local to the component unless global state (Zustand/Context) is absolutely necessary.
- **Extensions Rendering:** If generating a Trunk form (like Project Creation), ensure there is a pluggable area to dynamically render Branch extensions based on the `user.industry` context.

---

## 5. Database & Mongoose Generation Rules

- **Schema Definition:** Always define strict types in the Mongoose schema.
- **Compound Indexes:** When creating an index, always start with `organizationId` to ensure multi-tenant query performance. 
  *Example:* `@Index({ organizationId: 1, status: 1 })`
- **Soft Deletes:** Do not use `.remove()` or `.deleteOne()`. Always update the `deletedAt` timestamp instead.
- **Branch Extensions:** In Trunk schemas, define `extensions: { type: Schema.Types.Mixed }`. Rely on Zod/class-validator in the API layer to validate the JSON structure, not Mongoose.

---

> **Previous Document:** [Doc 22 — Coding Standards](./22_Coding_Standards.md)
> **End of Specifications.**
