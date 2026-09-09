# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

1. **Seekers (Guest Document Reviewers):** Kenyan students, postgraduate researchers, commercial tenants, founders, and legal clients submitting high-stakes drafts (theses, tenancy leases, commercial contracts, RFP proposals) who need immediate, authoritative diagnostic critique without paying $300/hour or waiting 2 weeks for a manual consultation.
2. **Domain Experts (Pack Creators):** Senior academics, advocates of the High Court of Kenya, technical directors, and subject-matter specialists packaging their diagnostic judgment, evaluation heuristics, and penalty rules into automated, recurring revenue products.

## Product Purpose

me.AI converts human expert judgment into deterministic, verifiable AI diagnostic evaluation packs. It allows clients to submit sensitive drafts without account creation or signup friction, pay instantly via Kenyan mobile money (Safaricom Daraja M-Pesa), and receive a structured review with verifiable citations, redline diffs, and machine-readable provenance.

## Positioning

Unlike generic LLM wrappers that produce hallucinated, non-deterministic feedback without authority, me.AI provides:
- **Server-authoritative entitlement**: Zero-signup guest checkout backed by Safaricom Daraja STK push; money state unlocks report access.
- **Observable RAG provenance**: 8-point machine audit contract proving which immutable pack version, document hash, and chunk IDs were evaluated, with zero hallucinated citations.
- **Redline exemplar diffing**: Concrete comparisons between client submissions and expert gold-standard criteria.

## Operating Context

- **Payment Rails:** Native Kenyan mobile money via Safaricom Daraja M-Pesa STK push (`254XXXXXXXXX`), asynchronous webhook callbacks, and B2C expert earnings disbursements.
- **Delivery Channels:** Web app reports accessible via persistent receipt tokens (`/r/[receiptId]`), embedded evaluation widgets (`/embed/[slug]`), and WhatsApp webhook ingestion for document review over mobile messaging.
- **Review Setting:** High-stakes document validation (academic defense readiness, commercial lease liability exposure, contract indemnification limits).

## Capabilities and Constraints

- **Multi-Vertical Marketplace:** Academic research (thesis chapters 1–3), commercial law (tenancy and uncapped liability), and technical documentation from day one.
- **Zero-Signup Wall:** Guests submit raw text or PDF drafts with only a phone number and receipt email; no passwords or account barriers.
- **Version Immutability:** Once an Expert Pack version (e.g. `v1.0.0`) is published and used for a review, its criteria, heuristics, and penalty weights are permanently frozen.
- **Deterministic Evaluation:** Fast, sub-linear TF-IDF evidence retrieval with guaranteed zero-hallucination citation validation.

## Brand Commitments

- **Tone and Identity:** Monad editorial technical journal design language (`#f6f3f1` warm parchment canvas, Untitled Serif typography, ABC Diatype Mono data tables, and 1px hairline card borders).
- **Voice:** Objective, rigorous, scholarly, and authoritative. Avoid conversational assistant fluff or generic generative chatter.
- **Tactile Micro-Interactions:** Physical button press feedback (`scale(0.97)`), modal transitions (`scale(0.95)`), and non-blocking Sonner toast updates.

## Evidence on Hand

- **Seed Packs:** Dr. Aris Thorne's *Academic Thesis Chapter 1–3 Diagnostic* (`pack_thesis_thorne_v1_0_0`) and Advocate Brian Wafula's *Corporate Lease & Tenancy Diagnostic*.
- **Proven Invariants:** Autonomous Gauntlet Loop test suite (`scripts/test-vertical-slice.ts`) proving all 5 vertical slice invariants end-to-end.
- **Verified Metrics:** 2ms RAG retrieval latency, 0% hallucinated citations, and server-verified Daraja M-Pesa receipts.

## Product Principles

1. **Vertical Slice Before Breadth:** Every architectural layer (ingestion, payment, RAG retrieval, citation verification, report rendering) must work end-to-end before adding interface breadth.
2. **Observable RAG Provenance:** Every claim in an evaluation report must bind to a verified chunk ID and an immutable pack rule ID. No ungrounded assertions.
3. **Money Is Server-Authoritative:** Entitlement is governed strictly by Safaricom Daraja server-side webhook callbacks; client UI never dictates unlock state.
4. **Zero Friction for Seekers:** Never force an account creation or password step between a user, their draft, and an M-Pesa payment prompt.
5. **Heuristic Fidelity:** The AI must evaluate drafts against the expert's exact criteria, exemplar bad/good pairs, and penalty rationales, not generic LLM preferences.
