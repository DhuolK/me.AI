# me.AI — Complete Product Redesign & Implementation Brief

You are rebuilding me.AI from first principles.

The existing implementation is visually polished but product-architecturally shallow. It behaves like an AI-generated SaaS demo: excessive marketing language, decorative UI, invented capabilities, weak information hierarchy, no proper authentication model, incomplete data flow, unclear ownership, weak lifecycle management, and features added because they sound impressive rather than because they belong to the core product.

Do not preserve the existing UI, visual language, page structure, marketing copy, assumptions, or feature hierarchy.

Preserve only the valid underlying product idea:

me.AI allows professionals to convert their recurring professional review methodology into reusable AI-powered Review Systems. Professionals configure structured rules and evaluation criteria once, then distribute private, public, cohort, or client-paid links. Clients submit documents through those links. The AI evaluates the submission against the selected immutable Review System version, produces evidence-backed findings and recommendations, and allows the client to resubmit improved work. Professionals retain control of the methodology and can override AI findings.

Think of the product as:

Professional expertise
→ Review System
→ Distribution
→ Client submission
→ AI evaluation
→ Evidence-backed report
→ Revision
→ Resubmission
→ Professional oversight

The product is not primarily an AI marketplace.
It is not primarily a document chatbot.
It is not a generic prompt marketplace.
It is professional review infrastructure.

==================================================
1. PRODUCT PRINCIPLES
==================================================

The system must optimize for:

1. Clear professional workflows
2. Structured expert methodology
3. Evidence-grounded AI evaluation
4. Immutable review versions
5. Professional ownership and control
6. Frictionless client submission
7. Repeatable review processes
8. Resubmission and progress tracking
9. Secure document handling
10. Correct payment and subscription state management

Never add functionality merely because it sounds impressive.

Every feature must answer:
- Who uses this?
- What job does it help them complete?
- What data does it create?
- What state does that data have?
- What happens next?

==================================================
2. USER HIERARCHY
==================================================

Platform level:

Platform Admin

Workspace level:

Workspace Owner
Workspace Collaborator

Client side:

Guest Submission Participant
Optional Client Account later

Professionals must authenticate.
Clients should be guest-first.

Professional accounts own workspaces.
Workspaces own Review Systems.
Review Systems own versions and rules.
Distribution Links expose a specific Review System/version.
Submissions belong to a Review System and a specific version.

==================================================
3. CORE DOMAIN MODEL
==================================================

Implement these core entities:

User
Workspace
WorkspaceMember

ReviewSystem
ReviewSystemVersion
ReviewRule
ReviewExample
ReviewSettings

DistributionLink
Cohort
CohortMember

Submission
SubmissionFile
SubmissionVersion

EvaluationJob
EvaluationFinding
EvaluationEvidence

Report
ReportRevision

Subscription
SubscriptionPlan
Invoice

Payment
PaymentTransaction
ReviewCharge
LedgerEntry
Payout
Refund

Notification
AuditLog

Do not build pages independently of this domain model.

The database and API contracts must be defined before the UI implementation.

==================================================
4. REVIEW SYSTEM
==================================================

A Review System is the core professional product.

It must contain:

Identity
- name
- description
- discipline
- audience

Scope
- what is evaluated
- what is ignored
- supported files

Rules
- rule ID
- title
- description
- rule type
- severity
- applicable section/chapter
- evidence requirement
- failure behavior
- recommendation

Examples
- good examples
- bad examples
- optional annotations

Output configuration
- categories
- scoring
- report structure

Access configuration
- private
- public
- cohort
- paid
- included

Pricing
- free
- pay-per-review
- future credit/subscription support

Retention
- file retention period
- report retention period

==================================================
5. STRUCTURED RULES
==================================================

Do not implement expert methodology as one giant prompt textarea.

Rules must be structured.

Example:

Rule:
Research Gap Specificity

Type:
Required

Severity:
High

Applies to:
Chapter 1

Evidence:
Required

Requirement:
The problem statement must identify a specific and defensible research, practical, or empirical gap.

Failure action:
Flag

Recommendation:
Tell the author exactly what must be clarified or narrowed.

Supported rule types may include:

required
prohibited
threshold
relationship
consistency
structural
semantic
formatting
evidence-based

==================================================
6. VERSIONING
==================================================

Published Review Systems are immutable.

Experts may create new versions.

A submission must permanently reference the Review System Version against which it was evaluated.

Never silently evaluate an old submission using the newest rules.

Required relationships:

submission.review_system_id
submission.review_system_version_id

Every published version must be reproducible.

==================================================
7. DISTRIBUTION
==================================================

Professionals must be able to generate:

Private Link
Public Link
Cohort Link
Paid Review Link
Future Embeddable Link

Every link must reference a Review System and valid version.

Support:

- expiration
- active/inactive state
- usage limits
- cohort association
- payment mode
- access mode

==================================================
8. ACCESS MODES
==================================================

Support:

INCLUDED
Professional covers the review cost.

PAID
Client pays per review.

INVITE_ONLY
Only explicitly authorized participants can use it.

PUBLIC
Anyone can access.

This is especially important for lecturers.

Example:

Lecturer subscription pays for the platform.
Students use the lecturer's classroom link without paying individually.

Lawyer:

Client accesses a paid review link and pays.

==================================================
9. SUBMISSION LIFECYCLE
==================================================

Implement an explicit state machine.

CREATED
UPLOADING
UPLOADED
PAYMENT_PENDING
PAYMENT_CONFIRMED
QUEUED
PROCESSING
EVALUATING
VALIDATING
READY
DELIVERED

Failure states:

UPLOAD_FAILED
PAYMENT_FAILED
PROCESSING_FAILED
EVALUATION_FAILED
VALIDATION_FAILED

Never represent the complete review workflow with a single boolean.

==================================================
10. AI EVALUATION PIPELINE
==================================================

Use an asynchronous job architecture.

Pipeline:

Upload
→ file validation
→ object storage
→ document extraction
→ normalization
→ section detection
→ rule retrieval
→ rule evaluation
→ evidence generation
→ evidence validation
→ recommendation generation
→ scoring
→ report construction

The model must return structured output.

Every finding must contain:

rule_id
severity
status
finding
reason
evidence
recommendation

No finding should appear in the final report without supporting evidence.

Do not claim zero hallucinations.

Use language such as:

Evidence-grounded evaluation
Evidence required
Unsupported findings rejected

==================================================
11. PROFESSIONAL OVERRIDE
==================================================

Experts must be able to review AI findings.

They may:

Accept
Reject
Override
Modify
Add note

Store:

AI result
Expert decision
Expert reason
Timestamp
Actor

This becomes part of the audit history.

==================================================
12. RESUBMISSION
==================================================

Support iterative review.

Example:

Submission 1
→ report
→ corrections
→ Submission 2
→ report

Track:

score changes
resolved findings
new findings
remaining findings

Professionals must be able to compare revisions.

==================================================
13. COHORTS
==================================================

Implement Cohorts because they are particularly valuable for lecturers.

Example:

Computer Science Final Year Projects 2026

Show:

participants
submissions
average score
common weaknesses
students requiring attention
submission history

A cohort should map to a Distribution Link.

==================================================
14. AUTHENTICATION
==================================================

Professionals require authentication.

Support an appropriate combination of:

email/password
email OTP
phone OTP
magic link

The exact mechanism may depend on the existing stack.

Clients may submit as guests.

Guest submissions must still capture a safe retrieval identity such as:

email
phone
secure submission token

Never require a full client account merely to perform one review.

==================================================
15. AUTHORIZATION
==================================================

Implement object-level authorization.

Every request must verify ownership or membership.

Never trust IDs supplied by the browser.

A user must never be able to retrieve:

another workspace
another submission
another report
another payment
another client's file

through predictable IDs.

==================================================
16. BILLING
==================================================

Keep professional subscriptions separate from review charges.

Subscription controls platform entitlements.

Review charges represent payments for individual professional services.

Create:

Subscription
Plan
Invoice
Payment
PaymentTransaction
ReviewCharge
LedgerEntry
Payout
Refund

Never derive historical financial records from current plan configuration.

Financial records must be immutable.

==================================================
17. SUBSCRIPTION TIERS
==================================================

Do not hardcode plan behavior throughout the frontend.

Create entitlement logic.

Example:

FREE
- 1 active Review System
- limited monthly reviews
- basic analytics
- standard distribution
- platform fee on paid reviews

PRO
- unlimited Review Systems
- higher usage
- team members
- advanced analytics
- embeddable distribution
- branding controls
- reduced/zero platform fee according to actual commercial rules

Payment processor fees must remain separate from platform fees.

==================================================
18. M-PESA
==================================================

M-Pesa is a payment subsystem, not the application's core workflow.

Flow:

Client starts payment
→ payment record created
→ STK push
→ provider callback
→ verify transaction
→ idempotency check
→ ledger entry
→ review unlocked

Callbacks must be idempotent.

Duplicate callbacks must never create duplicate financial transactions.

==================================================
19. FILE ARCHITECTURE
==================================================

Do not store large documents directly inside normal relational database fields.

Use object storage.

Database contains:

file ID
storage key
content type
size
checksum
owner
submission
retention metadata

Use signed URLs for controlled access.

Validate:

file type
size
extension
content
malware risk where appropriate

==================================================
20. PRIVACY AND RETENTION
==================================================

Support workspace-level retention policies.

Examples:

Delete source files after 30 days.
Keep reports indefinitely.

Store explicit metadata:

owner
purpose
retention policy
created_at
deleted_at

Make document-processing and model-training policy explicit.

Do not silently use client documents for unrelated training.

==================================================
21. APPLICATION INFORMATION ARCHITECTURE
==================================================

Public:

Home
Product
Professionals
Marketplace
Pricing
FAQ
Sign In
Create Account

Authenticated:

Dashboard
Review Systems
Submissions
Clients
Cohorts
Analytics
Billing
Payouts
Workspace Settings

Review System:

Overview
Rules
Examples
Output
Access
Pricing
Versions
Submissions
Analytics

Client:

Review Landing Page
Submission
Payment
Processing
Report
Revision / Resubmission

==================================================
22. DASHBOARD
==================================================

Do not build a generic AI dashboard.

The dashboard should answer:

What needs attention?

Show:

active review systems
pending submissions
recent activity
usage
billing state

Then show recent submissions in a dense table.

Avoid excessive KPI cards.

==================================================
23. REVIEW SYSTEM EDITOR
==================================================

This is the primary professional interface.

Use a structured workspace.

Navigation:

Overview
Rules
Examples
Output
Access
Pricing
Versions
Analytics

Rules interface:

Left:
Rule categories

Center:
Rules list

Right:
Selected rule editor

Design this as software, not as a landing page.

==================================================
24. CLIENT EXPERIENCE
==================================================

Client-facing review pages must be extremely simple.

Review System

What this checks
What you need to submit
Expected processing behavior
Price or Included
Privacy information

Upload

Payment if necessary

Processing

Report

Resubmit

No client should need to understand:

RAG
vectors
embeddings
chunking
AI models
queues
pipeline stages

Hide implementation details unless they are useful to advanced users.

==================================================
25. REPORT EXPERIENCE
==================================================

Report structure:

Overall assessment
Score

Passed
Needs attention
Critical

Then group findings by chapter/section.

Each finding:

Rule
Status
Severity
Finding
Evidence
Why it matters
Recommendation

Provide resubmission action.

==================================================
26. LANDING PAGE
==================================================

Throw away the current bloated landing page.

Build:

Hero
How it works
For professionals
Use cases
Real interface preview
Pricing
Trust/privacy
FAQ
Final CTA

Hero message:

Turn your expertise into a reusable review system.

Primary CTA:
Create a review system

Secondary CTA:
Use a review link

Do not lead with technical implementation claims.

Do not fabricate customer numbers.

Do not fabricate testimonials.

Do not claim zero hallucinations.

Do not claim impossible processing times.

==================================================
27. VISUAL DESIGN
==================================================

Start the visual system from zero.

Do not preserve the existing visual design.

Aim for:

editorial
calm
precise
professional
dense where useful
high information hierarchy

Reference the product quality bar of modern professional software such as:

Linear
Notion
Stripe
modern editorial publishing systems

Do NOT imitate their branding.

Avoid:

excessive gradients
glassmorphism
random rounded cards
decorative SVG overload
huge empty hero blocks
fake telemetry
fake terminal interfaces
meaningless metric tiles
AI-generated startup clichés

Marketing pages can be expressive.

Application pages must feel operational.

==================================================
28. DESIGN SYSTEM
==================================================

Before creating every page independently, define:

Typography
Spacing
Grid
Color system
Surfaces
Borders
Buttons
Inputs
Tables
Cards
Dialogs
Badges
Status indicators
Navigation
Tabs
Empty states
Loading states
Errors
Toasts
Report components

All pages must consume the design system.

==================================================
29. ARCHITECTURE
==================================================

Do NOT prematurely build dozens of microservices.

For the first production architecture use:

Frontend
API
Relational Database
Object Storage
Queue
Background Workers
Payment Provider
Notification Provider
AI Provider

Use a modular backend.

Logical modules:

Auth
Users
Workspaces
Review Systems
Rules
Distribution
Submissions
Evaluation
Reports
Billing
Payments
Notifications
Analytics
Audit

Use asynchronous workers for long-running document and AI operations.

Split into services only when scale actually requires it.

==================================================
30. EVENT MODEL
==================================================

Define domain events such as:

submission.created
payment.completed
review.started
review.completed
report.ready
report.failed
resubmission.created
subscription.changed
payout.completed

Use these events for notifications and analytics rather than tightly coupling unrelated modules.

==================================================
31. API DESIGN
==================================================

Define API contracts before implementation.

Core groups:

/api/auth
/api/me
/api/workspaces
/api/review-systems
/api/review-systems/:id/rules
/api/review-systems/:id/versions
/api/review-systems/:id/links
/api/submissions
/api/reports
/api/billing
/api/payments
/api/analytics
/api/public/reviews/:token

Use validation schemas.

Return consistent error structures.

Use pagination.

Use idempotency where financial or state-changing retries are possible.

==================================================
32. OBSERVABILITY
==================================================

Build structured logging.

Track:

request IDs
job IDs
submission IDs
payment IDs
workspace IDs

Monitor:

API errors
queue latency
AI evaluation failures
file-processing failures
payment failures
notification failures

Do not expose internal logs to normal clients.

==================================================
33. ADMIN SYSTEM
==================================================

Platform Admin should have:

Users
Workspaces
Subscriptions
Payments
Payouts
Review Systems
Abuse reports
AI jobs
System health
Audit logs

Admins should be able to disable or investigate abusive resources without directly modifying business records in uncontrolled ways.

==================================================
34. EMPTY / ERROR / LOADING STATES
==================================================

Every important workflow must define:

empty
loading
success
partial success
failure
retry

Examples:

No Review Systems
No Submissions
Payment Pending
Evaluation Delayed
Evaluation Failed
Expired Link
Invalid File
Quota Exceeded
Subscription Expired
Report Generation Failed

Never design only the happy path.

==================================================
35. IMPLEMENTATION ORDER
==================================================

Work in this order:

1. Product/domain specification
2. Business rules
3. Data model
4. State machines
5. Authorization model
6. API contracts
7. UX/information architecture
8. Design system
9. Backend foundation
10. Authentication
11. Workspace and Review Systems
12. Rules and versions
13. Distribution
14. Submission workflow
15. Client experience
16. Report experience
17. AI evaluation pipeline
18. Billing
19. M-Pesa
20. Notifications
21. Cohorts
22. Analytics
23. Marketplace
24. Embeds / integrations
25. Final UI polish
26. End-to-end feature testing

Do not jump directly into styling pages.

==================================================
36. TESTING
==================================================

Testing must happen after the complete feature implementation.

Test end-to-end workflows rather than isolated visual interactions.

Test:

Professional onboarding
Review System creation
Rule creation
Version publishing
Private links
Public links
Cohort links
Guest submissions
Paid submissions
Included submissions
M-Pesa payment
Duplicate callbacks
Evaluation
Evidence validation
Report generation
Expert override
Resubmission
Subscription changes
Quota enforcement
Unauthorized access
Expired links
Invalid files
AI failures
Payment failures
Storage failures
Notification failures
Refunds
Payouts

Perform security testing for:

IDOR
RBAC bypass
file access
signed URL handling
webhook forgery
duplicate transaction processing
rate-limit bypass
unsafe file uploads
session/authentication issues

==================================================
37. QUALITY BAR
==================================================

At every stage ask:

Does this represent a real professional workflow?

Is there real data behind this UI?

What object does this screen operate on?

What creates this object?

What changes its state?

Who is allowed to access it?

What happens when it fails?

What happens next?

If a screen cannot answer those questions, do not build it yet.

Do not generate decorative functionality.

Do not invent metrics.

Do not fabricate users.

Do not fabricate payments.

Do not create fake AI telemetry.

Build the smallest coherent professional review platform first.

The finished product must feel like a serious professional tool that happens to use AI, not an AI demo wearing a SaaS skin.
