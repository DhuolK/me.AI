import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { assertWorkspaceAccess } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { subscriptionManager } from "@/lib/payments/subscriptions";
import { Cohort, DistributionLink } from "@/lib/types/domain";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");

  const workspaces = await db.listWorkspacesForUser(user.id);
  const targetWsId = workspaceId || workspaces[0]?.id;
  if (!targetWsId) return NextResponse.json({ cohorts: [] });

  await assertWorkspaceAccess(user, targetWsId, "viewer");
  const cohorts = await db.listCohorts(targetWsId);

  return NextResponse.json({ cohorts });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { workspaceId, reviewSystemId, name, description, startDate, endDate } = body;

    if (!workspaceId || !reviewSystemId || !name) {
      return NextResponse.json({ error: "workspaceId, reviewSystemId, and name are required" }, { status: 400 });
    }

    const workspace = await assertWorkspaceAccess(user, workspaceId, "admin");

    // Entitlement check
    const entitlement = await subscriptionManager.checkEntitlement(workspace, "create_cohort");
    if (!entitlement.allowed) {
      return NextResponse.json({ error: entitlement.reason }, { status: 403 });
    }

    const reviewSystem = await db.getReviewSystem(reviewSystemId);
    if (!reviewSystem) {
      return NextResponse.json({ error: "Review System not found" }, { status: 404 });
    }

    const cohortId = `cohort_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const linkToken = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Math.random().toString(36).substring(2, 6)}`;

    // Create associated distribution link (included for students)
    const distLink: DistributionLink = {
      id: `link_${cohortId}`,
      reviewSystemId: reviewSystem.id,
      reviewSystemVersionId: reviewSystem.currentVersionId,
      token: linkToken,
      name: `${name} (Cohort Access)`,
      accessMode: "INCLUDED",
      priceKes: 0,
      cohortId,
      usageCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    await db.saveDistributionLink(distLink);

    const cohort: Cohort = {
      id: cohortId,
      workspaceId,
      reviewSystemId,
      name,
      description: description || "",
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || undefined,
      distributionLinkId: distLink.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.saveCohort(cohort);

    return NextResponse.json({ success: true, cohort, distributionLink: distLink }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create cohort";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
