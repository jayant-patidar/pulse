# Doc 18 — UI/UX Design System

**Document ID:** PULSE-DOC-18
**Version:** 1.0
**Status:** Draft
**Last Updated:** August 3, 2026
**Author:** Pulse Engineering Team
**Depends On:** [Doc 04 (Architecture)](./04_System_Architecture.md), [Doc 15 (Mobile Strategy)](./15_Mobile_Strategy.md)

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [The Tree Architecture in UI](#2-the-tree-architecture-in-ui)
3. [Component Library & Styling](#3-component-library--styling)
4. [Layouts & Navigation](#4-layouts--navigation)
5. [Micro-Interactions & Feedback](#5-micro-interactions--feedback)

---

## 1. Design Philosophy

Pulse's UI must balance massive data density (for the back-office admin) with extreme simplicity (for the field worker). 
- **Premium Aesthetics:** We use sleek dark modes, vibrant curated color palettes, glassmorphism, and smooth micro-animations. It must look and feel like a modern, consumer-grade app.
- **Clarity over Cleverness:** Field workers use the app in stressful, loud, bright environments. Text must be legible. Buttons must be obvious.
- **Keyboard First (Desktop):** Power users should be able to navigate the entire desktop app without touching a mouse (via `Cmd+K` Omnibox and focus rings).

---

## 2. The Tree Architecture in UI

Just as the backend is split into Trunk (Core) and Branch (Industry-Specific), the UI follows the exact same pattern.

### 2.1 Shared UI Components (The Trunk)
- Global Sidebar Navigation
- Notification Drawer
- Task Kanban Boards
- Document File Explorers
- User Profile & Org Settings

### 2.2 Dynamic Branch UI (The Extensions)
The frontend dynamically renders fields based on the `extensions` schema returned by the API.
- **Example (Project Creation):** 
  The core form asks for `Name`, `Budget`, `Location`. 
  The UI then reads the user's `industry` (Construction) and automatically mounts the Construction-specific React component, which appends `Contract Type`, `Square Footage`, and `Permit Number` to the form.
- **Benefit:** When we launch the Agriculture branch, the core UI doesn't change. We just register a new "Agriculture Fields" React component.

---

## 3. Component Library & Styling

- **Framework:** Next.js (React).
- **Styling:** Vanilla CSS (or CSS Modules) for maximum flexibility, unless Tailwind is explicitly requested. We prioritize handcrafted, rich CSS (gradients, shadows, smooth transitions) over generic utility frameworks.
- **Typography:** Inter or Roboto (Modern, clean, highly legible).
- **Color System:** 
  - *Primary:* A vibrant, confidence-inspiring color (e.g., Electric Indigo).
  - *Neutrals:* Slate/Zinc grays for backgrounds and borders.
  - *Semantics:* Red (Destructive/Danger), Green (Success/Approved), Amber (Warning/Pending).
  - *Dark Mode:* First-class citizen. Deep midnight blues rather than pure `#000000`.

---

## 4. Layouts & Navigation

### 4.1 Global Context
The UI always makes it obvious *where* the user is. 
- Top-Left: Organization Name.
- Top-Center: Global Search Omnibox (`Cmd+K`).
- Top-Right: User Profile & Notifications.

### 4.2 Drill-Down Navigation
1. **Org Level:** Shows all projects across the company.
2. **Project Level:** Clicking a project slides in a sub-navigation menu specific to that project (Dashboard, Tasks, Reports, Documents).
3. **Item Level:** Clicking a Task opens a side-drawer (sheet) rather than navigating to a new page, preserving the user's context of the Kanban board.

---

## 5. Micro-Interactions & Feedback

To make the app feel "alive" and premium:
- **Buttons:** Subtle scale-down effect on `:active`. Smooth color transitions on `:hover`.
- **Loading:** Skeleton screens (shimmer effects) are used instead of spinning wheels to reduce perceived latency.
- **Optimistic UI:** When dragging a task from "To Do" to "Done", the UI updates instantly. The API call happens in the background. If it fails, the task snaps back with an error toast.
- **Real-time Indicators:** If another user is editing the same Daily Report, a small avatar pulses at the top of the screen (powered by WebSockets).

---

> **Previous Document:** [Doc 17 — Security](./17_Security.md)
> **Next Document:** [Doc 19 — Development Roadmap](./19_Development_Roadmap.md)
