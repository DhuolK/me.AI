import { db } from "@/lib/db";
import { Workspace, SubscriptionPlan, PlanTier } from "@/lib/types/domain";
import { SEED_PLANS } from "@/lib/db/fixtures";

export class SubscriptionManager {
  /**
   * Retrieves available subscription plans.
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    return SEED_PLANS;
  }

  /**
   * Evaluates if a workspace is entitled to perform a restricted action under its current plan.
   */
  async checkEntitlement(
    workspace: Workspace,
    feature: "create_review_system" | "create_cohort" | "team_invite"
  ): Promise<{ allowed: boolean; reason?: string; currentCount?: number; maxLimit?: number }> {
    const plan = (await db.getSubscriptionPlan(workspace.planTier)) || SEED_PLANS[0];

    if (feature === "create_review_system") {
      const activeSystems = await db.listReviewSystemsByWorkspace(workspace.id);
      if (activeSystems.length >= plan.maxActiveReviewSystems) {
        return {
          allowed: false,
          reason: `Your ${plan.name} plan allows up to ${plan.maxActiveReviewSystems} active Review System(s). Please upgrade to PRO to create more.`,
          currentCount: activeSystems.length,
          maxLimit: plan.maxActiveReviewSystems,
        };
      }
      return { allowed: true, currentCount: activeSystems.length, maxLimit: plan.maxActiveReviewSystems };
    }

    if (feature === "create_cohort") {
      if (!plan.cohortsEnabled) {
        return {
          allowed: false,
          reason: `Cohorts are available on the Professional Practice (PRO) plan. Please upgrade to unlock student and cohort management.`,
        };
      }
      return { allowed: true };
    }

    if (feature === "team_invite") {
      if (!plan.teamMembersEnabled) {
        return {
          allowed: false,
          reason: `Team members and collaborators require a PRO workspace.`,
        };
      }
      return { allowed: true };
    }

    return { allowed: true };
  }

  /**
   * Upgrades workspace plan.
   */
  async upgradeWorkspacePlan(workspaceId: string, newTier: PlanTier): Promise<Workspace> {
    const workspace = await db.getWorkspace(workspaceId);
    if (!workspace) throw new Error("Workspace not found");

    workspace.planTier = newTier;
    workspace.updatedAt = new Date().toISOString();
    await db.saveWorkspace(workspace);
    return workspace;
  }
}

export const subscriptionManager = new SubscriptionManager();
