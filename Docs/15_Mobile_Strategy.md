# Doc 15 — Mobile Strategy

**Document ID:** PULSE-DOC-15
**Version:** 1.0
**Status:** Draft
**Last Updated:** August 3, 2026
**Author:** Pulse Engineering Team
**Depends On:** [Doc 01 (PRD)](./01_Product_Requirements_Document.md), [Doc 03 (Non-Functional Requirements)](./03_Non_Functional_Requirements.md)

---

## Table of Contents

1. [Mobile Philosophy](#1-mobile-philosophy)
2. [Tech Stack (PWA vs Native)](#2-tech-stack-pwa-vs-native)
3. [Offline-First Architecture](#3-offline-first-architecture)
4. [Hardware Integrations (GPS & Camera)](#4-hardware-integrations-gps--camera)
5. [Field-Optimized UX](#5-field-optimized-ux)

---

## 1. Mobile Philosophy

Pulse is designed for users wearing hardhats, gloves, and working in areas with zero cellular reception (e.g., basement levels of a high-rise, remote agricultural fields). 

The mobile experience is not a "lite" version of the desktop app; for 80% of our users (Workers, Supervisors), **mobile is the primary interface.**

---

## 2. Tech Stack (React Native)

While the desktop interface is built on Next.js, the mobile application is built using **React Native (Expo)**. 

### 2.1 Why React Native?
- Allows 90% code sharing between iOS and Android.
- Allows sharing of TypeScript interfaces and Zod validation schemas directly from the Node.js backend repo.
- Provides deep access to native APIs (Camera, GPS, SQLite) that standard PWAs struggle with on iOS.

---

## 3. Offline-First Architecture

A Field Operations app without robust offline support is useless.

### 3.1 Local State Management
- **Database:** WatermelonDB (a reactive, offline-first SQLite wrapper for React Native).
- When a user logs in, the app pulls down their active projects, tasks, and recent documents and caches them locally.

### 3.2 The Sync Engine
1. **Offline Write:** User submits a Daily Report while offline in a basement.
2. **Local Commit:** The report is saved to the local SQLite DB with a `syncStatus: PENDING_CREATE` flag. The UI shows a ✅ (optimistic UI update).
3. **Queueing:** The action is pushed to an internal sync queue.
4. **Network Restored:** NetInfo detects a stable connection.
5. **Sync:** The background sync engine executes the queue against the REST API.
6. **Conflict Resolution:** If the server rejects the payload (e.g., Last-Write-Wins conflict), the app moves the item to a "Sync Conflicts" UI for the user to resolve manually.

---

## 4. Hardware Integrations (GPS & Camera)

### 4.1 GPS & Geofencing
- **Daily Reports:** When a photo is taken for a daily report, the EXIF data is scrubbed, and the device's current accurate GPS coordinates are forcefully stamped onto the image metadata.
- **Geofence Validation:** The app calculates the distance between the user's GPS point and the Project's defined center point. If the user is >1 mile away, the photo is flagged as `Out of Bounds` (preventing workers from uploading photos from home).

### 4.2 Camera & Document Scanning
- **Compression:** Mobile networks are slow. All photos are automatically resized to 1920x1080 and compressed to <2MB before upload.
- **Scanner Mode:** Integrates OpenCV-based document boundary detection to allow users to "scan" paper receipts or safety forms and upload them as flat PDFs.

---

## 5. Field-Optimized UX

- **High Contrast:** All mobile UI defaults to a high-contrast mode (WCAG AAA) to ensure readability in direct, glaring sunlight.
- **Touch Targets:** Minimum button size is 48x48 points to accommodate users wearing protective gloves.
- **Voice-to-Text:** Everywhere there is a text area (e.g., Daily Report description), there is a prominent microphone icon triggering native OS dictation, as typing long paragraphs on a job site is dangerous and slow.

---

> **Previous Document:** [Doc 14 — Search Engine](./14_Search_Engine.md)
> **Next Document:** [Doc 16 — Monitoring & Observability](./16_Monitoring_and_Observability.md)
