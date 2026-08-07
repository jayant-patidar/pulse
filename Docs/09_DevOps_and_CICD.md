# Doc 09 — DevOps & CI/CD

**Document ID:** PULSE-DOC-09
**Version:** 1.0
**Status:** Draft
**Last Updated:** August 3, 2026
**Author:** Pulse Engineering Team
**Depends On:** [Doc 04 (Architecture)](./04_System_Architecture.md), [Doc 08 (Cloud Infrastructure)](./08_Cloud_Infrastructure.md)

---

## Table of Contents

1. [DevOps Philosophy](#1-devops-philosophy)
2. [Source Control & Branching Strategy](#2-source-control--branching-strategy)
3. [Environment Strategy](#3-environment-strategy)
4. [Continuous Integration (CI) Pipeline](#4-continuous-integration-ci-pipeline)
5. [Continuous Deployment (CD) - GitOps](#5-continuous-deployment-cd---gitops)
6. [Release Management (Feature Flags)](#6-release-management-feature-flags)
7. [Infrastructure as Code (IaC) Automation](#7-infrastructure-as-code-iac-automation)

---

## 1. DevOps Philosophy

At Pulse, **Deployment is not a Release**. We decouple the act of deploying code to servers from the act of releasing a feature to users. Our core DevOps principles are:

- **Everything as Code:** Infrastructure, configuration, and pipelines must be version-controlled.
- **Zero-Touch Production:** Developers do not have SSH access to production nodes. All changes flow through the pipeline.
- **Shift-Left Security:** Security and compliance scans happen on every Pull Request, not just before release.
- **Zero-Downtime Deployments:** Updates must never disrupt active field workers.

---

## 2. Source Control & Branching Strategy

We use **GitHub** and follow a strict **Trunk-Based Development** branching model.

### 2.1 Branching Rules
- `main` is the only long-lived branch. It is always in a deployable state.
- Developers create short-lived feature branches (e.g., `feat/auth-update` or `fix/task-bug`).
- Branches must be merged back to `main` within 1-2 days.

### 2.2 Pull Request (PR) Requirements
To merge a PR into `main`, the following automated checks must pass:
1. **Approval:** At least 1 code review from a peer.
2. **CI Pipeline:** All tests and linters must pass.
3. **No Coverage Drops:** Code coverage cannot drop below the 80% threshold.
4. **Linear History:** Rebase and squash merging is required. No merge commits.

---

## 3. Environment Strategy

Pulse maintains three distinct, isolated environments:

| Environment | Purpose | Database | Deployment Trigger |
|---|---|---|---|
| **Development** (`dev`) | Engineer integration testing. Volatile. | Atlas Dev Cluster (Scrubbed mock data) | Automatic on PR creation / push to branch. |
| **Staging** (`stg`) | Pre-production validation, QA, and UAT. Exact mirror of Prod. | Atlas Stg Cluster (Scrubbed Prod snapshot) | Automatic on merge to `main`. |
| **Production** (`prod`) | Live customer traffic. | Atlas Prod Cluster (Multi-AZ) | Manual approval of Staging release via GitHub Actions. |

---

## 4. Continuous Integration (CI) Pipeline

Executed via **GitHub Actions** upon every push to a branch.

### 4.1 CI Workflow Steps
1. **Code Checkout & Setup:** Pulls code, caches `node_modules` (or `pip` for Python).
2. **Linting & Formatting:** Runs ESLint, Prettier, and Python Black/Ruff. Fails if violations exist.
3. **Type Checking:** Runs TypeScript compiler (`tsc --noEmit`).
4. **Unit & Integration Tests:** Runs Jest (Node) and PyTest (Python).
5. **Security Scan:** Runs Snyk or Trivy to scan dependencies and Dockerfile for known CVEs.
6. **SonarQube Analysis:** Scans for code smells, bugs, and calculates test coverage.
7. **Build Docker Image:** If all above pass, builds the container image.
8. **Push to ECR:** Tags the image with the Git commit hash (`sha-xxxxx`) and pushes to Amazon Elastic Container Registry.

---

## 5. Continuous Deployment (CD) - GitOps

We utilize the **GitOps** methodology using **ArgoCD** running inside our EKS clusters.

### 5.1 The GitOps Workflow
1. When the CI pipeline pushes a new image to ECR, the final step of the GitHub Action updates the image tag in a separate `pulse-infrastructure` repository.
2. **ArgoCD** continuously monitors this infrastructure repository.
3. When ArgoCD detects the manifest change (e.g., `image: pulse-api:sha-12345` → `sha-67890`), it automatically pulls the changes and applies them to the EKS cluster.

### 5.2 Deployment Strategy (Rolling Updates)
- ArgoCD triggers a **Kubernetes RollingUpdate**.
- K8s spins up the new pods.
- The `readinessProbe` hits the `/health` endpoint. The pod is only marked "Ready" when it successfully connects to the Database and Redis.
- Once the new pod is ready, K8s terminates an old pod. This guarantees **zero downtime**.

---

## 6. Release Management (Feature Flags)

To decouple deployment from release, we use a Feature Flagging system (e.g., LaunchDarkly or GrowthBook).

### 6.1 Workflow
1. Developer wraps a new feature (e.g., "Change Orders") in a feature flag: `if (flags.enableChangeOrders) { ... }`.
2. The code is merged to `main` and immediately deployed to Production by ArgoCD.
3. **The feature is in Production, but turned OFF.**
4. Product Managers turn the flag ON for internal beta testers.
5. Product Managers turn the flag ON for specific organizations (e.g., `mitchell-construction`).
6. Finally, the flag is rolled out to 100% of users.

**Benefit:** If a critical bug is found, the feature is disabled instantly via the feature flag dashboard—no hotfix deployment required.

---

## 7. Infrastructure as Code (IaC) Automation

Changes to AWS infrastructure (VPC, EKS cluster size, S3 buckets, IAM roles) are completely separated from application code.

- **Tool:** Terraform.
- **Workflow (Atlantis):**
  1. DevOps engineer opens a PR changing a `.tf` file.
  2. **Atlantis** (a webhook-driven IaC tool) automatically runs `terraform plan` and posts the output as a comment on the PR.
  3. A senior engineer reviews the plan.
  4. The reviewer comments `atlantis apply`.
  5. Atlantis provisions the AWS resources and merges the PR automatically.

This ensures the `main` branch of the infrastructure repo always perfectly matches the actual state in AWS.

---

## Document Changelog

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | August 3, 2026 | Pulse Engineering Team | Initial document creation |

---

> **Previous Document:** [Doc 08 — Cloud Infrastructure](./08_Cloud_Infrastructure.md)
> **Next Document:** [Doc 10 — AI Architecture](./10_AI_Architecture.md)
