/**
 * me.AI Core Domain Model & Entity Definitions
 * Professional Review Infrastructure
 */

export type UserRole = 'platform_admin' | 'workspace_owner' | 'workspace_collaborator' | 'guest';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export type WorkspaceMemberRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  user?: User;
  role: WorkspaceMemberRole;
  invitedAt: string;
  joinedAt?: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  planTier: PlanTier;
  subscriptionId?: string;
  retentionDays: number;
  allowClientDataTraining: boolean; // strictly false by default
  createdAt: string;
  updatedAt: string;
}

export type RuleType =
  | 'required'
  | 'prohibited'
  | 'threshold'
  | 'relationship'
  | 'consistency'
  | 'structural'
  | 'semantic'
  | 'formatting'
  | 'evidence-based';

export type RuleSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type FailureAction = 'flag' | 'reject' | 'warn' | 'require_human_review';

export interface ReviewRule {
  id: string;
  ruleSystemVersionId: string;
  code: string; // e.g. "RULE_GAP_01"
  title: string;
  category: string; // e.g. "Problem Formulation", "Methodology", "Clause Analysis"
  description: string;
  ruleType: RuleType;
  severity: RuleSeverity;
  applicableSection: string; // e.g. "Chapter 1", "Section 3.2", "All"
  evidenceRequirement: 'required' | 'optional';
  requirement: string;
  failureAction: FailureAction;
  recommendation: string;
  weight: number; // 1 to 10
  order: number;
}

export interface ReviewExample {
  id: string;
  ruleId: string;
  type: 'good' | 'bad';
  content: string;
  annotation?: string;
}

export interface ReviewSettings {
  supportedFileTypes: string[]; // e.g. ["pdf", "docx", "txt", "md"]
  maxFileSizeMb: number;
  autoProcessOnPayment: boolean;
  scoringScale: 'percentage' | 'points' | 'tier';
  passingScore: number;
  humanOversightRequired: boolean;
}

export interface ReviewSystemVersion {
  id: string;
  reviewSystemId: string;
  versionNumber: string; // e.g. "1.0.0"
  changelog: string;
  rules: ReviewRule[];
  examples: ReviewExample[];
  settings: ReviewSettings;
  isPublished: boolean;
  publishedAt?: string;
  publishedBy?: string;
  isImmutable: boolean;
  createdAt: string;
}

export type AccessMode = 'INCLUDED' | 'PAID' | 'INVITE_ONLY' | 'PUBLIC';

export interface ReviewSystem {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  discipline: string; // e.g. "Academic Research", "Commercial Law", "Clinical Trials"
  audience: string; // e.g. "Postgraduate Researchers", "Founders", "Compliance Officers"
  description: string;
  evaluationScope: string;
  ignoredScope: string;
  priceKes: number; // 0 for free/included
  currentVersionId: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface DistributionLink {
  id: string;
  reviewSystemId: string;
  reviewSystemVersionId: string;
  token: string;
  name: string;
  accessMode: AccessMode;
  priceKes: number;
  cohortId?: string;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

export interface Cohort {
  id: string;
  workspaceId: string;
  reviewSystemId: string;
  name: string; // e.g. "CS Final Year Projects 2026"
  description: string;
  startDate: string;
  endDate?: string;
  distributionLinkId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CohortMember {
  id: string;
  cohortId: string;
  studentIdentifier: string; // e.g. "CS/2026/089"
  name: string;
  email: string;
  submissionsCount: number;
  latestScore?: number;
  status: 'active' | 'completed' | 'at_risk';
}

export type SubmissionStatus =
  | 'CREATED'
  | 'UPLOADING'
  | 'UPLOADED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_CONFIRMED'
  | 'QUEUED'
  | 'PROCESSING'
  | 'EVALUATING'
  | 'VALIDATING'
  | 'READY'
  | 'DELIVERED'
  | 'UPLOAD_FAILED'
  | 'PAYMENT_FAILED'
  | 'PROCESSING_FAILED'
  | 'EVALUATION_FAILED'
  | 'VALIDATION_FAILED';

export interface SubmissionFile {
  id: string;
  submissionId: string;
  storageKey: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  checksumSha256: string;
  retentionExpiresAt: string;
  createdAt: string;
}

export interface SubmissionVersion {
  versionIndex: number;
  submittedAt: string;
  rawText: string;
  reportId?: string;
  overallScore?: number;
}

export interface Submission {
  id: string;
  reviewSystemId: string;
  reviewSystemVersionId: string; // Immutable link
  distributionLinkId?: string;
  cohortId?: string;
  guestEmail: string;
  guestPhone?: string;
  guestName?: string;
  secureToken: string;
  status: SubmissionStatus;
  statusMessage?: string;
  currentVersionIndex: number;
  versions: SubmissionVersion[];
  paymentTransactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationEvidence {
  chunkIndex: number;
  charStart?: number;
  charEnd?: number;
  quote: string;
  sectionContext: string;
  isVerified: boolean;
}

export interface EvaluationFinding {
  id: string;
  ruleId: string;
  ruleCode: string;
  ruleTitle: string;
  category: string;
  severity: RuleSeverity;
  status: 'passed' | 'failed' | 'warning' | 'info';
  finding: string;
  reason: string;
  evidence: EvaluationEvidence[];
  recommendation: string;
  weight: number;
}

export interface ProfessionalOverride {
  id: string;
  findingId: string;
  decision: 'accepted' | 'rejected' | 'overridden' | 'modified';
  overrideFinding?: string;
  overrideScore?: number;
  reason: string;
  expertUserId: string;
  expertName: string;
  appliedAt: string;
}

export interface ReportRevisionDelta {
  previousReportId: string;
  scoreDelta: number;
  resolvedFindingsCount: number;
  newFindingsCount: number;
  remainingFindingsCount: number;
  summary: string;
}

export interface Report {
  id: string;
  submissionId: string;
  submissionVersionIndex: number;
  reviewSystemId: string;
  reviewSystemVersionId: string;
  overallScore: number; // 0 - 100
  passedCount: number;
  needsAttentionCount: number;
  criticalCount: number;
  summaryVerdict: string;
  findings: EvaluationFinding[];
  overrides: ProfessionalOverride[];
  revisionDelta?: ReportRevisionDelta;
  evaluationJobId: string;
  isPublishedToClient: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationJob {
  id: string;
  submissionId: string;
  reviewSystemVersionId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  stagesCompleted: string[];
  errorMessage?: string;
  rawTextLength: number;
  chunkCount: number;
  ruleCount: number;
  durationMs?: number;
  createdAt: string;
  completedAt?: string;
}

export type PlanTier = 'FREE' | 'PRO' | 'ENTERPRISE';

export interface SubscriptionPlan {
  id: string;
  tier: PlanTier;
  name: string;
  priceKesMonthly: number;
  maxActiveReviewSystems: number;
  maxMonthlyReviews: number;
  cohortsEnabled: boolean;
  teamMembersEnabled: boolean;
  platformFeePercent: number; // e.g. 10% on Free, 0% on Pro
}

export interface Subscription {
  id: string;
  workspaceId: string;
  planTier: PlanTier;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
}

export interface Invoice {
  id: string;
  workspaceId: string;
  subscriptionId?: string;
  amountKes: number;
  status: 'draft' | 'open' | 'paid' | 'uncollectible';
  billingPeriod: string;
  paidAt?: string;
  createdAt: string;
}

export type PaymentStatus =
  | 'INITIATED'
  | 'STK_SENT'
  | 'CONFIRMED'
  | 'FAILED'
  | 'TIMEOUT'
  | 'REFUNDED';

export interface PaymentTransaction {
  id: string;
  workspaceId?: string;
  submissionId?: string;
  subscriptionId?: string;
  amountKes: number;
  phoneNumber: string;
  accountReference: string; // e.g. "REV-8934"
  checkoutRequestId?: string;
  merchantRequestId?: string;
  mpesaReceiptNumber?: string;
  status: PaymentStatus;
  statusDetails?: string;
  isAuthoritativeVerified: boolean;
  idempotencyKey: string;
  createdAt: string;
  verifiedAt?: string;
}

export interface ReviewCharge {
  id: string;
  workspaceId: string;
  submissionId: string;
  paymentTransactionId: string;
  grossAmountKes: number;
  platformFeeKes: number;
  netPayoutKes: number;
  status: 'held' | 'available_for_payout' | 'paid_out' | 'refunded';
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  workspaceId: string;
  entryType: 'CREDIT' | 'DEBIT';
  category: 'REVIEW_REVENUE' | 'PLATFORM_FEE' | 'SUBSCRIPTION_PAYMENT' | 'PAYOUT' | 'REFUND';
  amountKes: number;
  referenceId: string;
  description: string;
  balanceAfterKes: number;
  createdAt: string;
}

export interface Payout {
  id: string;
  workspaceId: string;
  amountKes: number;
  destinationPhone: string;
  mpesaB2CReference?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedBy: string;
  processedAt?: string;
  createdAt: string;
}

export interface Refund {
  id: string;
  paymentTransactionId: string;
  amountKes: number;
  reason: string;
  approvedBy: string;
  status: 'completed' | 'failed';
  createdAt: string;
}

export interface Notification {
  id: string;
  userId?: string;
  workspaceId?: string;
  guestEmail?: string;
  title: string;
  body: string;
  channel: 'in_app' | 'email' | 'sms' | 'whatsapp';
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  workspaceId: string;
  actorId: string;
  actorName: string;
  action: string; // e.g. "review_system.publish_version", "finding.override"
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

// Backward Compatibility Aliases for Legacy Code References
export type ExpertPack = ReviewSystem;
export type PackVersion = ReviewSystemVersion;
export type PackRule = ReviewRule;
export type DocumentSubmission = Submission;
export type ReviewResult = Report;
export interface DocumentChunk {
  id: string;
  submissionId: string;
  index: number;
  text: string;
  tokenCount?: number;
}
