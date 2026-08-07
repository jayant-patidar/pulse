# Doc 13 — Notification System

**Document ID:** PULSE-DOC-13
**Version:** 1.0
**Status:** Draft
**Last Updated:** August 3, 2026
**Author:** Pulse Engineering Team
**Depends On:** [Doc 04 (Architecture)](./04_System_Architecture.md), [Doc 11 (Event-Driven Architecture)](./11_Event_Driven_Architecture.md)

---

## Table of Contents

1. [Notification Engine Overview](#1-notification-engine-overview)
2. [Channels & Transport](#2-channels--transport)
3. [Preference Management (User Opt-in/out)](#3-preference-management-user-opt-inout)
4. [Debouncing & Aggregation](#4-debouncing--aggregation)
5. [Timezone Awareness & Scheduling](#5-timezone-awareness--scheduling)

---

## 1. Notification Engine Overview

The Notification Engine is a Root-layer service. It listens to internal system events (from both Trunk and Branch modules) and translates them into human-readable alerts across multiple channels.

Because it relies on BullMQ (`notifications_q`), it is completely asynchronous and does not slow down API responses.

---

## 2. Channels & Transport

The engine supports 4 primary channels:

### 2.1 In-App (WebSockets)
- **Transport:** Socket.io (SSE fallback).
- **Behavior:** Real-time bell icon increment.
- **Payload:** Lightweight JSON containing title, body, and click-action URL.

### 2.2 Email
- **Provider:** AWS SES (Simple Email Service) or SendGrid.
- **Behavior:** Transactional templates (e.g., "You have been assigned Task X").
- **Design:** React Email is used to generate responsive HTML templates that render perfectly in Outlook and mobile clients.

### 2.3 Push Notifications (Mobile)
- **Provider:** Firebase Cloud Messaging (FCM) / Apple APNs.
- **Behavior:** Native lock-screen alerts for the Pulse iOS/Android apps.

### 2.4 SMS (Urgent Alerts)
- **Provider:** Twilio.
- **Behavior:** Reserved explicitly for `URGENT` priority tasks or `CRITICAL` safety incidents. SMS is expensive and invasive, so its use is highly restricted by the system.

---

## 3. Preference Management (User Opt-in/out)

Users have granular control over what interrupts them, defined in the `memberships.notificationPreferences` schema.

| Event Type | In-App | Email | Push |
|---|---|---|---|
| Assigned to a Task | ✅ Forced | ✅ Opt-out | ✅ Opt-out |
| Mentioned in Comment | ✅ Forced | ✅ Opt-out | ✅ Opt-out |
| Project Status Changed| ✅ Forced | ❌ Default Off| ❌ Default Off|
| Urgent Safety Alert | ✅ Forced | ✅ Forced | ✅ Forced |

*Note: Critical system alerts (e.g., "Your account will be deleted in 2 days") bypass all preferences.*

---

## 4. Debouncing & Aggregation

To prevent "notification fatigue" (which leads to users muting the app entirely), the engine implements strict debouncing rules.

### 4.1 Rule (NT-F01)
If a user receives >5 notifications of the same type within 5 minutes, the system intercepts the remaining queue jobs and aggregates them.

**Scenario:** A Project Manager uploads 50 photos and assigns them all to Carlos.
- *Bad:* Carlos's phone buzzes 50 times in 10 seconds.
- *Good:* Carlos's phone buzzes once: *"You have been assigned 50 new photos on Project Delta."*

---

## 5. Timezone Awareness & Scheduling

Field workers operate strictly by the sun. Waking up a superintendent at 3:00 AM with a non-urgent email about a task due next week is unacceptable.

### 5.1 Rule (NT-F02)
- The Notification Engine checks the `organization.timezone` (or the user's specific override timezone).
- If the current local time is between 22:00 (10:00 PM) and 06:00 (6:00 AM), the BullMQ job is delayed.
- The `delay` property on the Redis job is calculated to exactly 06:01 AM local time.
- **Exception:** Events tagged as `PRIORITY_URGENT` or `SAFETY_CRITICAL` bypass the sleep window and are delivered immediately.

---

> **Previous Document:** [Doc 12 — Document Management](./12_Document_Management.md)
> **Next Document:** [Doc 14 — Search Engine](./14_Search_Engine.md)
