# Doc 14 — Search Engine

**Document ID:** PULSE-DOC-14
**Version:** 1.0
**Status:** Draft
**Last Updated:** August 3, 2026
**Author:** Pulse Engineering Team
**Depends On:** [Doc 04 (Architecture)](./04_System_Architecture.md), [Doc 05 (Database)](./05_Database_Design.md), [Doc 10 (AI Architecture)](./10_AI_Architecture.md)

---

## Table of Contents

1. [Search Architecture Overview](#1-search-architecture-overview)
2. [Global Omnibox (Cmd+K)](#2-global-omnibox-cmdk)
3. [Atlas Search (Lucene) Integration](#3-atlas-search-lucene-integration)
4. [AI Semantic Search (Vector)](#4-ai-semantic-search-vector)
5. [Tenant Security & Pre-Filtering](#5-tenant-security--pre-filtering)

---

## 1. Search Architecture Overview

Pulse implements a hybrid search strategy to handle both exact-match queries ("Show me task #405") and semantic queries ("Show me safety issues involving scaffolding").

We use **MongoDB Atlas Search** (Apache Lucene under the hood) for full-text global search, and **Atlas Vector Search** for AI-driven semantic queries. This eliminates the need to maintain an external Elasticsearch cluster.

---

## 2. Global Omnibox (Cmd+K)

The primary interaction model for navigation is the Global Omnibox, accessible via keyboard shortcut (`Cmd+K` / `Ctrl+K`) from anywhere in the app.

### 2.1 Search Scopes
When a user types into the Omnibox, the API concurrently queries multiple indices:
1. **Projects:** Names, locations, client names.
2. **Tasks:** Titles, descriptions, assignees.
3. **Documents:** Filenames, tags.
4. **Users/Workforce:** Names, skills, emails.
5. **Branch Entities:** e.g., Change Order numbers (Construction).

### 2.2 Result Formatting
Results are categorized in the UI payload:
```json
{
  "projects": [{ "id": "1", "title": "Downtown Tower", "subtitle": "Active" }],
  "tasks": [{ "id": "405", "title": "Fix HVAC", "subtitle": "Downtown Tower" }]
}
```

---

## 3. Atlas Search (Lucene) Integration

For standard text searching within a specific module (e.g., searching the Task List), we utilize Atlas Search indices.

### 3.1 Features
- **Fuzzy Matching:** Handles typos (e.g., searching "scafold" returns "scaffold").
- **Autocomplete:** Powers type-ahead dropdowns.
- **Analyzers:** Uses the standard English analyzer to handle stemming (e.g., searching "running" matches "run").

### 3.2 Standard Implementation
A typical aggregation pipeline for search:
```javascript
{
  $search: {
    index: "default_task_search",
    compound: {
      must: [
        { equals: { path: "organizationId", value: currentOrgId } } // Security Boundary
      ],
      should: [
        { text: { query: "plumbing", path: "title", fuzzy: { maxEdits: 1 } } }
      ]
    }
  }
}
```

---

## 4. AI Semantic Search (Vector)

When standard keyword search fails, users can toggle "Ask AI" in the search bar. This routes the query through the RAG pipeline defined in Doc 10.

- **Use Case:** A keyword search for "water leak" might miss a daily report that says "burst pipe flooding". Semantic vector search understands the relationship and returns the burst pipe report.
- **Fallback:** If Atlas Search yields 0 results, the UI automatically prompts: *"No exact matches. Would you like to ask Pulse AI?"*

---

## 5. Tenant Security & Pre-Filtering

Search introduces massive data leakage risks in multi-tenant systems. 

### 5.1 The Iron Rule of Search
**No search query (Lucene or Vector) is ever executed without a hardcoded `organizationId` filter applied at the topmost level of the query compound.**

### 5.2 Project RBAC Filtering
Even within the same organization, a user might not have access to all projects. 
The Search API middleware must:
1. Resolve the user's accessible `projectIds` array.
2. Inject an `$in` filter into the `$search` pipeline.
3. **Result:** If David searches for "budget", he will only see results from projects where he holds the `MANAGER` or `ADMIN` role.

---

> **Previous Document:** [Doc 13 — Notification System](./13_Notification_System.md)
> **Next Document:** [Doc 15 — Mobile Strategy](./15_Mobile_Strategy.md)
