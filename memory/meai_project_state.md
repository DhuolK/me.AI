---
name: meai-project-state
description: "Project state, completed vertical slice, verified invariants, and architecture for me.AI"
metadata: 
  node_type: memory
  type: project
  originSessionId: fde828a1-4d9e-4257-9474-55bbc330edeb
---

# me.AI Project State & Architecture Status

**Status Date:** 2026-09-09  
**Build Status:** Clean production build (`npm run build` compiles 31 routes with 0 type errors).  
**Test Status:** 
- 100% passing vertical slice integration suite (`npm run test:transaction` / `scripts/test-vertical-slice.ts`)
- 100% passing user hierarchy & object-level RBAC test suite (`npm run test:auth` / `scripts/test-auth-and-roles.ts`)

## 1. Professional Review Infrastructure Architectural Invariants
1. **Immutable Versioning & Safe Branching**: Published review systems (`isPublished: true`, `isImmutable: true`) are locked to protect past student evaluations. 1-click branching creates editable drafts with semver increments.
2. **Evidence-Grounded Generalized RAG Engine**: Pure TypeScript chunker + TF-IDF retriever + citation validator with binary stream sanitization (`sanitizeText`) and verbatim quotes verified against raw text.
3. **Server-Authoritative Double-Entry Ledger & Payments**: Daraja M-Pesa state machine with idempotent webhook deduplication and double-entry ledger bookkeeping.
4. **Editorial Design System**: High-density editorial styling with Geist/system typography, warm neutral surfaces, crisp 1px borders, and print-ready `@media print` reports.
5. **Cohort Diagnostic Analytics**: Cohort weakness heatmaps, recurring rule deficiency rankings, and 1-click CSV roster exports for institutional compliance.
6. **M-Pesa B2C Payout Initiation**: Direct balance disbursement modal in billing ledger with live debit ledger entry creation.
7. **Workspace Methodology Analytics**: Dynamic computation of top failing rules, revision deltas, supervisory override rates, and methodology category health indices.
8. **Interactive Resubmission Dropzone & Length Telemetry**: Multi-format document dropzone and live character/word delta tracker directly inside the report revision modal.
9. **Interactive Role-Based Methodology Playground**: Public hero playground demonstrating evidence extraction across Academia, Corporate Legal Counsel, and Biomedical Clinical Trials.
10. **Multi-Role User Hierarchy & Object-Level RBAC**: Explicit separation between `platform_admin`, `workspace_owner`, `workspace_collaborator`, and `guest` with scoped tokens and instant test account switching.

## 2. Core Operational Endpoints & Views
- **Landing Page & Playground**: `/` (Interactive discipline switcher, 6-step evaluation pipeline breakdown, zero-training guarantee).
- **Studio & Rule Editor**: `/dashboard/review-systems/[id]` (3-column category/rule/inspector layout, version switcher, branch modal, publish modal).
- **Guest Client Review Flow**: `/review/[token]` (Drag-and-drop file ingestion, live character/word/page telemetry, section badge extraction, Daraja STK push checkout).
- **Evidence-Backed Diagnostic Report**: `/report/[id]` (Verbatim manuscript citations, expert supervisory overrides, category radar scores, Markdown export, print/PDF layout, cryptographic audit seal, revision resubmission dropzone).
- **Cohort Management**: `/dashboard/cohorts` and `/dashboard/cohorts/[id]` (Student rosters, failure pattern heatmaps, CSV exports, student enrollment).
- **Double-Entry Financials & B2C Payouts**: `/dashboard/billing` and `/api/billing` (Workspace balance, review fee revenue, platform take, instant M-Pesa payout requests).
- **Methodology Analytics**: `/dashboard/analytics` and `/api/analytics` (Real-time aggregated metrics, highest failing rules ranking, category health index).
- **Multi-Role Auth & Switcher**: `/login`, `/api/auth`, `/api/me`, and dashboard sidebar account switcher.

## 3. Verified Verification Suites
1. **Vertical Slice Suite** (`scripts/test-vertical-slice.ts`):
   - Workspace & Review System Initialization
   - Immutable Version & Rule Integrity
   - Distribution Link Configuration
   - Guest Submission Ingestion
   - Idempotent M-Pesa Payment Verification
   - Evidence-Grounded RAG Engine & Citations
   - Professional Supervisory Override Audit Trail
   - Resubmission Delta & Revision Progression
   - Double-Entry Ledger Reconciliation
2. **Auth & Multi-Role RBAC Suite** (`scripts/test-auth-and-roles.ts`):
   - Universal Platform Admin workspace override
   - Workspace Owner domain isolation
   - Workspace Collaborator permissions and member-level restrictions
   - Guest client isolation and secure token access
