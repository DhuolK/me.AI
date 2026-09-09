# me.AI — Master Specification & Architectural Gauntlet Contract

> **Core Value Proposition:**
> **"Rent an expert's brain at midnight, without the expert being awake."**
> 
> me.AI is a marketplace of expert knowledge where lecturers, lawyers, and mentors upload their grading rules, rubrics, and good/bad exemplars once to create an **Expert Pack**. Anyone (students, clients, founders) can upload their draft work, pick a Pack, pay, and receive an instant, high-rigor AI review returning specific **Do's, Don'ts, and Recommendations** citing only that expert's exact rules. Experts earn every time their Pack is used.

---

## 1. The Core Implementation Objective & The 5 Invariants

From `content.md`:
> *"The first implementation objective is not to build me.AI. It is to prove one complete, production-shaped review transaction end-to-end:*
> 
> `Expert Pack → published version → payment verified → document accepted → extraction → chunking → retrieval → evidence selection → structured AI review → citation validation → persistence → user delivery`
> 
> *Every implementation decision must serve that path."*

### The Five Invariants
1. **Vertical slice before breadth:** No marketplace, expert payouts, advanced analytics, recommendation engines, multi-model orchestration, or broad format support until the single complete review transaction works end-to-end.
2. **Observable RAG:** Every review must leave behind machine-readable trace evidence answering:
   - Q1: Which Pack version was used?
   - Q2: Which document version was reviewed?
   - Q3: Which chunks were retrieved?
   - Q4: Why were those chunks selected?
   - Q5: What evidence was supplied to the model?
   - Q6: Which citation points to which evidence?
   - Q7: What did the model return?
   - Q8: What validation rejected or accepted it?
3. **Money must be server-authoritative:** Daraja M-Pesa verification is strictly checked server-side. Frontend never decides payment success. Database state unlocks entitlement.
4. **Pack versions must be immutable once used:** A review references an immutable `pack_version_id`. Published packs never mutate under an existing review.
5. **Tests must prove the transaction:** Complete vertical test execution (`create expert → create pack → publish v1 → create user → initiate payment → verify payment → upload doc → chunk → retrieve → review → validate citations → persist → user delivery`).

---

## 2. Concrete Ground-Truth Quality Bar

> **"A candidate run passes only when an independent critic verifies that an uploaded document evaluated against an immutable Expert Pack produces a review with 100% cited rule references, a server-verified Daraja payment receipt, zero hallucinated chunk IDs across all 8 audit points in `content.md`, and renders within a pixel-faithful Monad warm-parchment technical journal UI (#f6f3f1 canvas, Untitled Serif headings, Diatype Mono UI, and 40px hairline cards)."**

---

## 3. Visual Design System: Monad Editorial Technical Journal

From `DESIGN (1).md`:
- **Theme:** Light, warm parchment technical journal.
- **Canvas:** `#f6f3f1` (`--color-parchment`).
- **Typography:**
  - **Headings & Display:** Untitled Serif (fallback: Georgia, Times New Roman), weight 400 (never bold), letter-spacing `-0.02em`.
  - **Body, Nav, Badges, Buttons, UI:** ABC Diatype Mono (fallback: JetBrains Mono, IBM Plex Mono), weight 400 & 500, tight tracking.
- **Palette:**
  - Lake Blue: `#2b59d1` (only chromatic accent)
  - Periwinkle Mist: `#cfdaf5` (muted UI surfaces, cards)
  - Off-Black: `#242424` (primary action buttons)
  - Ink: `#000000` (announcement bar, top headers)
  - Ash: `#cecac8` (1px solid hairline borders)
  - Graphite: `#4e4d4d` (secondary text)
  - Smoke: `#797776` (muted helper text)
- **Geometry & Cards:**
  - Card Border Radius: `40px`
  - Button Radius: `100px` (pill)
  - Tag/Pill Radius: `9999px`
  - Card Padding: `40px`
  - Border: 1px hairline `#cecac8`, zero heavy drop shadows.

---

## 4. The 3-Way Access Model & Demand-Side Guest Architecture

### The Access Toggles
Every Pack created by an expert can toggle one, two, or all three distribution modes:
1. **Private Link (Closed Lane):** Direct URL (`me.ai/p/[slug]`) with optional access code or institutional email domain filter (`@student.university.ac.ke`). Ideal for lecturers/teachers grading their own classes.
2. **Public Marketplace (Open Discovery):** Searchable at `me.ai/market` filtered by profession, category, and ratings. Ideal for lawyers, consultants, and independent specialists.
3. **Embedded Widget (Own Traffic):** Drop-in iframe/embed code for expert websites, WhatsApp Business catalogs, and Linktrees (`"Get Instant Review by My AI"`).

### Zero-Friction Demand (Guest Checkout)
- **Suppliers (Experts):** Require authenticated accounts with dashboard, analytics, Pack authoring, and payout records.
- **Demand (Students / Clients):** **ZERO accounts required**. They upload document, enter phone (M-Pesa) + email, pay via STK push, and receive the instant report.
- An encrypted receipt token (`/r/[receiptId]`) is emailed to them to access their review anytime without an account wall.

---

## 5. Pack Customization & Modular Add-On Triggers

### Core Review Engine
Every review generates:
- **Do's Card:** Concrete strengths citing expert rules and student excerpts.
- **Don'ts Card:** Rule violations and penalties with expert rationale.
- **Recommendations Card:** Step-by-step remediation plan with priority ("High", "Medium") and rule citations.
- **Audit Trace Drawer:** The 8 machine-readable verification points.

### Expert-Configured Add-On Feature Triggers
Experts can attach optional modules that the buyer can trigger:
1. **Human Escalation / Consultation Booking:** If the client wants the expert's physical review, a 1-click booking link (Calendly) is attached to the report.
2. **Redline / Targeted Rewrite Vorschlag:** Generates paragraph-level rewrite candidates matching the expert's stylistic exemplar.
3. **Institutional Integrity & Turnitin Pre-Check:** Flags ungrounded claims, citation gaps, and formatting inconsistencies against academic rubrics.

---

## 6. Gauntlet Loop & Autonomous Execution Contract

Modeled on Matt Shumer's Claude-of-Duty pattern:
- **Lead Agent:** Coordinates independent builder and critic subagents.
- **Builder Agent:** Iterates on components.
- **Critic Agent (Fresh Context):** Inspects output with zero prior memory.
  - Grades UI via screenshots & CSS tokens.
  - Grades RAG & Transaction against the 8 audit questions.
  - Performs blind A/B comparison against champion baseline.
- **Live Progress Page:** Maintained at `gauntlet-live.html` with running scorecard, candidate diffs, and screenshot comparisons.

---

## 7. Domain Fixtures & Ground Truth

- **Seed Pack:** Dr. Aris Thorne's Thesis Diagnostic v1.0.0 (`pack_thesis_thorne_v1`)
  - Rules: `RULE_01` (Problem Statement Gap), `RULE_02` (Methodology Rigor), `RULE_03` (Citation Density).
  - Exemplars: Annotated good vs bad thesis excerpts.
  - Distribution: Enabled for both Private Link (`/p/dr-thorne-thesis`) and Public Marketplace (`/market/thesis-review`).
- **Seed Benchmark Document:** Draft Master's Thesis Chapter 1–3 submission.
- **Target Transaction:** Guest upload $\to$ M-Pesa STK $\to$ Instant Review $\to$ Machine Audit Trace.
