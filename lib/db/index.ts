import fs from "node:fs";
import path from "node:path";
import {
  User,
  Workspace,
  WorkspaceMember,
  ReviewSystem,
  ReviewSystemVersion,
  ReviewRule,
  DistributionLink,
  Cohort,
  CohortMember,
  Submission,
  SubmissionFile,
  EvaluationJob,
  EvaluationFinding,
  Report,
  Subscription,
  SubscriptionPlan,
  Invoice,
  PaymentTransaction,
  ReviewCharge,
  LedgerEntry,
  Payout,
  Refund,
  Notification,
  AuditLog,
} from "@/lib/types/domain";
import {
  SEED_USERS,
  SEED_WORKSPACES,
  SEED_WORKSPACE_MEMBERS,
  SEED_PLANS,
  SEED_SUBSCRIPTIONS,
  SEED_REVIEW_SYSTEMS,
  SEED_REVIEW_SYSTEM_VERSIONS,
  SEED_DISTRIBUTION_LINKS,
  SEED_COHORTS,
  SEED_COHORT_MEMBERS,
} from "./fixtures";

export interface DatabaseSchema {
  users: Record<string, User>;
  workspaces: Record<string, Workspace>;
  workspaceMembers: Record<string, WorkspaceMember>;
  reviewSystems: Record<string, ReviewSystem>;
  reviewSystemVersions: Record<string, ReviewSystemVersion>;
  distributionLinks: Record<string, DistributionLink>;
  cohorts: Record<string, Cohort>;
  cohortMembers: Record<string, CohortMember>;
  submissions: Record<string, Submission>;
  submissionFiles: Record<string, SubmissionFile>;
  evaluationJobs: Record<string, EvaluationJob>;
  reports: Record<string, Report>;
  subscriptionPlans: Record<string, SubscriptionPlan>;
  subscriptions: Record<string, Subscription>;
  invoices: Record<string, Invoice>;
  payments: Record<string, PaymentTransaction>;
  reviewCharges: Record<string, ReviewCharge>;
  ledgerEntries: Record<string, LedgerEntry>;
  payouts: Record<string, Payout>;
  refunds: Record<string, Refund>;
  notifications: Record<string, Notification>;
  auditLogs: Record<string, AuditLog>;
  // Legacy Aliases compatibility
  packs?: Record<string, ReviewSystem>;
  packVersions?: Record<string, ReviewSystemVersion>;
  reviews?: Record<string, Report>;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "local-db.json");

export class ResilientDatabase {
  private memoryCache: DatabaseSchema | null = null;

  private createInitialSchema(): DatabaseSchema {
    const users: Record<string, User> = {};
    SEED_USERS.forEach((u) => (users[u.id] = u));

    const workspaces: Record<string, Workspace> = {};
    SEED_WORKSPACES.forEach((w) => {
      workspaces[w.id] = w;
      workspaces[w.slug] = w;
    });

    const workspaceMembers: Record<string, WorkspaceMember> = {};
    SEED_WORKSPACE_MEMBERS.forEach((m) => (workspaceMembers[m.id] = m));

    const subscriptionPlans: Record<string, SubscriptionPlan> = {};
    SEED_PLANS.forEach((p) => (subscriptionPlans[p.id] = p));

    const subscriptions: Record<string, Subscription> = {};
    SEED_SUBSCRIPTIONS.forEach((s) => (subscriptions[s.id] = s));

    const reviewSystems: Record<string, ReviewSystem> = {};
    SEED_REVIEW_SYSTEMS.forEach((rs) => {
      reviewSystems[rs.id] = rs;
      reviewSystems[rs.slug] = rs;
    });

    const reviewSystemVersions: Record<string, ReviewSystemVersion> = {};
    SEED_REVIEW_SYSTEM_VERSIONS.forEach((rsv) => (reviewSystemVersions[rsv.id] = rsv));

    const distributionLinks: Record<string, DistributionLink> = {};
    SEED_DISTRIBUTION_LINKS.forEach((dl) => {
      distributionLinks[dl.id] = dl;
      distributionLinks[dl.token] = dl;
    });

    const cohorts: Record<string, Cohort> = {};
    SEED_COHORTS.forEach((c) => (cohorts[c.id] = c));

    const cohortMembers: Record<string, CohortMember> = {};
    SEED_COHORT_MEMBERS.forEach((cm) => (cohortMembers[cm.id] = cm));

    return {
      users,
      workspaces,
      workspaceMembers,
      reviewSystems,
      reviewSystemVersions,
      distributionLinks,
      cohorts,
      cohortMembers,
      submissions: {},
      submissionFiles: {},
      evaluationJobs: {},
      reports: {},
      subscriptionPlans,
      subscriptions,
      invoices: {},
      payments: {},
      reviewCharges: {},
      ledgerEntries: {},
      payouts: {},
      refunds: {},
      notifications: {},
      auditLogs: {},
    };
  }

  private ensureInit(): DatabaseSchema {
    if (this.memoryCache) {
      return this.memoryCache;
    }

    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {
      // safe
    }

    if (!fs.existsSync(DB_FILE)) {
      const initial = this.createInitialSchema();
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
      } catch (err) {
        console.error("Warning: failed to persist initial local-db.json:", err);
      }
      this.memoryCache = initial;
      return initial;
    }

    try {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const db = JSON.parse(raw) as DatabaseSchema;

      // Ensure required entity dictionaries exist
      const schema = this.createInitialSchema();
      for (const key of Object.keys(schema) as Array<keyof DatabaseSchema>) {
        if (!db[key]) {
          // @ts-expect-error dynamic property hydration
          db[key] = schema[key];
        }
      }

      // Seed items if missing
      SEED_REVIEW_SYSTEMS.forEach((rs) => {
        if (!db.reviewSystems[rs.id]) db.reviewSystems[rs.id] = rs;
        if (!db.reviewSystems[rs.slug]) db.reviewSystems[rs.slug] = rs;
      });
      SEED_REVIEW_SYSTEM_VERSIONS.forEach((rsv) => {
        if (!db.reviewSystemVersions[rsv.id]) db.reviewSystemVersions[rsv.id] = rsv;
      });
      SEED_DISTRIBUTION_LINKS.forEach((dl) => {
        if (!db.distributionLinks[dl.id]) db.distributionLinks[dl.id] = dl;
        if (!db.distributionLinks[dl.token]) db.distributionLinks[dl.token] = dl;
      });
      SEED_COHORTS.forEach((c) => {
        if (!db.cohorts[c.id]) db.cohorts[c.id] = c;
      });
      SEED_USERS.forEach((u) => {
        db.users[u.id] = u;
      });
      SEED_WORKSPACES.forEach((w) => {
        if (!db.workspaces[w.id]) db.workspaces[w.id] = w;
        if (!db.workspaces[w.slug]) db.workspaces[w.slug] = w;
      });
      SEED_WORKSPACE_MEMBERS.forEach((m) => {
        db.workspaceMembers[m.id] = m;
      });

      this.memoryCache = db;
      return db;
    } catch {
      const fallback = this.createInitialSchema();
      this.memoryCache = fallback;
      return fallback;
    }
  }

  private save(db: DatabaseSchema): void {
    this.memoryCache = db;
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
    } catch (err) {
      console.error("Warning: failed to persist local-db.json:", err);
    }
  }

  // Users & Workspaces
  async getUser(id: string): Promise<User | null> {
    const db = this.ensureInit();
    return db.users[id] || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const db = this.ensureInit();
    const user = Object.values(db.users).find((u) => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  }

  async saveUser(user: User): Promise<User> {
    const db = this.ensureInit();
    db.users[user.id] = user;
    this.save(db);
    return user;
  }

  async getWorkspace(idOrSlug: string): Promise<Workspace | null> {
    const db = this.ensureInit();
    return db.workspaces[idOrSlug] || null;
  }

  async listWorkspacesForUser(userId: string): Promise<Workspace[]> {
    const db = this.ensureInit();
    const user = db.users[userId];
    if (user?.role === "platform_admin") {
      // Platform admin can view and govern all workspaces
      const unique = new Map<string, Workspace>();
      for (const w of Object.values(db.workspaces)) {
        unique.set(w.id, w);
      }
      return Array.from(unique.values());
    }

    // Direct ownership
    const ownedWorkspaceIds = new Set(
      Object.values(db.workspaces)
        .filter((w) => w.ownerId === userId)
        .map((w) => w.id)
    );

    // Member access
    Object.values(db.workspaceMembers)
      .filter((m) => m.userId === userId)
      .forEach((m) => ownedWorkspaceIds.add(m.workspaceId));

    const result: Workspace[] = [];
    for (const wsId of ownedWorkspaceIds) {
      const ws = db.workspaces[wsId];
      if (ws && !result.some((r) => r.id === ws.id)) {
        result.push(ws);
      }
    }
    return result;
  }

  async getWorkspaceMember(workspaceId: string, userId: string): Promise<WorkspaceMember | null> {
    const db = this.ensureInit();
    return (
      Object.values(db.workspaceMembers).find(
        (m) => m.workspaceId === workspaceId && m.userId === userId
      ) || null
    );
  }

  async listWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const db = this.ensureInit();
    return Object.values(db.workspaceMembers)
      .filter((m) => m.workspaceId === workspaceId)
      .map((m) => ({
        ...m,
        user: db.users[m.userId],
      }));
  }

  async saveWorkspaceMember(member: WorkspaceMember): Promise<WorkspaceMember> {
    const db = this.ensureInit();
    db.workspaceMembers[member.id] = member;
    this.save(db);
    return member;
  }

  async saveWorkspace(ws: Workspace): Promise<Workspace> {
    const db = this.ensureInit();
    db.workspaces[ws.id] = ws;
    db.workspaces[ws.slug] = ws;
    this.save(db);
    return ws;
  }

  // Review Systems & Versions
  async getReviewSystem(idOrSlug: string): Promise<ReviewSystem | null> {
    const db = this.ensureInit();
    return db.reviewSystems[idOrSlug] || null;
  }

  async listReviewSystemsByWorkspace(workspaceId: string): Promise<ReviewSystem[]> {
    const db = this.ensureInit();
    const unique = new Map<string, ReviewSystem>();
    for (const rs of Object.values(db.reviewSystems)) {
      if (rs.workspaceId === workspaceId) {
        unique.set(rs.id, rs);
      }
    }
    return Array.from(unique.values());
  }

  async saveReviewSystem(rs: ReviewSystem): Promise<ReviewSystem> {
    const db = this.ensureInit();
    db.reviewSystems[rs.id] = rs;
    db.reviewSystems[rs.slug] = rs;
    this.save(db);
    return rs;
  }

  async getReviewSystemVersion(versionId: string): Promise<ReviewSystemVersion | null> {
    const db = this.ensureInit();
    return db.reviewSystemVersions[versionId] || null;
  }

  async listReviewSystemVersions(reviewSystemId: string): Promise<ReviewSystemVersion[]> {
    const db = this.ensureInit();
    return Object.values(db.reviewSystemVersions).filter((v) => v.reviewSystemId === reviewSystemId);
  }

  async saveReviewSystemVersion(version: ReviewSystemVersion): Promise<ReviewSystemVersion> {
    const db = this.ensureInit();
    db.reviewSystemVersions[version.id] = version;
    this.save(db);
    return version;
  }

  // Distribution Links
  async getDistributionLink(idOrToken: string): Promise<DistributionLink | null> {
    const db = this.ensureInit();
    return db.distributionLinks[idOrToken] || null;
  }

  async listDistributionLinks(reviewSystemId: string): Promise<DistributionLink[]> {
    const db = this.ensureInit();
    const unique = new Map<string, DistributionLink>();
    for (const l of Object.values(db.distributionLinks)) {
      if (l.reviewSystemId === reviewSystemId) {
        unique.set(l.id, l);
      }
    }
    return Array.from(unique.values());
  }

  async saveDistributionLink(link: DistributionLink): Promise<DistributionLink> {
    const db = this.ensureInit();
    db.distributionLinks[link.id] = link;
    db.distributionLinks[link.token] = link;
    this.save(db);
    return link;
  }

  // Cohorts
  async getCohort(id: string): Promise<Cohort | null> {
    const db = this.ensureInit();
    return db.cohorts[id] || null;
  }

  async listCohorts(workspaceId: string): Promise<Cohort[]> {
    const db = this.ensureInit();
    return Object.values(db.cohorts).filter((c) => c.workspaceId === workspaceId);
  }

  async saveCohort(cohort: Cohort): Promise<Cohort> {
    const db = this.ensureInit();
    db.cohorts[cohort.id] = cohort;
    this.save(db);
    return cohort;
  }

  async listCohortMembers(cohortId: string): Promise<CohortMember[]> {
    const db = this.ensureInit();
    return Object.values(db.cohortMembers).filter((cm) => cm.cohortId === cohortId);
  }

  async saveCohortMember(member: CohortMember): Promise<CohortMember> {
    const db = this.ensureInit();
    db.cohortMembers[member.id] = member;
    this.save(db);
    return member;
  }

  // Submissions
  async getSubmission(id: string): Promise<Submission | null> {
    const db = this.ensureInit();
    return db.submissions[id] || null;
  }

  async getSubmissionByToken(token: string): Promise<Submission | null> {
    const db = this.ensureInit();
    const sub = Object.values(db.submissions).find((s) => s.secureToken === token);
    return sub || null;
  }

  async listSubmissionsByReviewSystem(reviewSystemId: string): Promise<Submission[]> {
    const db = this.ensureInit();
    return Object.values(db.submissions).filter((s) => s.reviewSystemId === reviewSystemId);
  }

  async listSubmissionsByWorkspace(workspaceId: string): Promise<Submission[]> {
    const db = this.ensureInit();
    const systemIds = new Set(
      Object.values(db.reviewSystems)
        .filter((rs) => rs.workspaceId === workspaceId)
        .map((rs) => rs.id)
    );
    return Object.values(db.submissions).filter((s) => systemIds.has(s.reviewSystemId));
  }

  async saveSubmission(sub: Submission): Promise<Submission> {
    const db = this.ensureInit();
    db.submissions[sub.id] = sub;
    this.save(db);
    return sub;
  }

  // Evaluation Jobs & Reports
  async saveEvaluationJob(job: EvaluationJob): Promise<EvaluationJob> {
    const db = this.ensureInit();
    db.evaluationJobs[job.id] = job;
    this.save(db);
    return job;
  }

  async getEvaluationJob(id: string): Promise<EvaluationJob | null> {
    const db = this.ensureInit();
    return db.evaluationJobs[id] || null;
  }

  async saveReport(report: Report): Promise<Report> {
    const db = this.ensureInit();
    db.reports[report.id] = report;
    db.reports[report.submissionId] = report;
    this.save(db);
    return report;
  }

  async getReport(idOrSubmissionId: string): Promise<Report | null> {
    const db = this.ensureInit();
    return db.reports[idOrSubmissionId] || null;
  }

  // Financial Ledger & Payments
  async savePayment(payment: PaymentTransaction): Promise<PaymentTransaction> {
    const db = this.ensureInit();
    db.payments[payment.id] = payment;
    if (payment.checkoutRequestId) {
      db.payments[payment.checkoutRequestId] = payment;
    }
    this.save(db);
    return payment;
  }

  async getPayment(idOrCheckoutId: string): Promise<PaymentTransaction | null> {
    const db = this.ensureInit();
    return db.payments[idOrCheckoutId] || null;
  }

  async saveLedgerEntry(entry: LedgerEntry): Promise<LedgerEntry> {
    const db = this.ensureInit();
    db.ledgerEntries[entry.id] = entry;
    this.save(db);
    return entry;
  }

  async listLedgerEntries(workspaceId: string): Promise<LedgerEntry[]> {
    const db = this.ensureInit();
    return Object.values(db.ledgerEntries)
      .filter((e) => e.workspaceId === workspaceId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Payouts
  async savePayout(payout: Payout): Promise<Payout> {
    const db = this.ensureInit();
    db.payouts[payout.id] = payout;
    this.save(db);
    return payout;
  }

  async getPayout(id: string): Promise<Payout | null> {
    const db = this.ensureInit();
    return db.payouts[id] || null;
  }

  async listPayouts(workspaceId: string): Promise<Payout[]> {
    const db = this.ensureInit();
    return Object.values(db.payouts)
      .filter((p) => p.workspaceId === workspaceId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Subscriptions & Plans
  async getSubscriptionPlan(tierOrId: string): Promise<SubscriptionPlan | null> {
    const db = this.ensureInit();
    const found = Object.values(db.subscriptionPlans).find((p) => p.id === tierOrId || p.tier === tierOrId);
    return found || null;
  }

  async getWorkspaceSubscription(workspaceId: string): Promise<Subscription | null> {
    const db = this.ensureInit();
    const sub = Object.values(db.subscriptions).find((s) => s.workspaceId === workspaceId);
    return sub || null;
  }

  async saveSubscription(sub: Subscription): Promise<Subscription> {
    const db = this.ensureInit();
    db.subscriptions[sub.id] = sub;
    this.save(db);
    return sub;
  }

  // Audit Logs & Notifications
  async recordAuditLog(log: AuditLog): Promise<AuditLog> {
    const db = this.ensureInit();
    db.auditLogs[log.id] = log;
    this.save(db);
    return log;
  }

  async listAuditLogs(workspaceId: string): Promise<AuditLog[]> {
    const db = this.ensureInit();
    return Object.values(db.auditLogs)
      .filter((l) => l.workspaceId === workspaceId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Backward compatibility methods for legacy API endpoints
  async getPackBySlug(slug: string): Promise<ReviewSystem | null> {
    return this.getReviewSystem(slug);
  }

  async getPackVersion(versionId: string): Promise<ReviewSystemVersion | null> {
    return this.getReviewSystemVersion(versionId);
  }

  async getPaymentByReceipt(receiptId: string): Promise<PaymentTransaction | null> {
    return this.getPayment(receiptId);
  }

  async getPaymentByCheckoutId(checkoutId: string): Promise<PaymentTransaction | null> {
    return this.getPayment(checkoutId);
  }

  async getAllPayments(): Promise<PaymentTransaction[]> {
    const db = this.ensureInit();
    const unique = new Map<string, PaymentTransaction>();
    for (const p of Object.values(db.payments || {})) {
      if (p?.id) unique.set(p.id, p);
    }
    return Array.from(unique.values());
  }

  async getReviewByReceipt(receiptId: string): Promise<Report | null> {
    return this.getReport(receiptId);
  }
}

export const db = new ResilientDatabase();
