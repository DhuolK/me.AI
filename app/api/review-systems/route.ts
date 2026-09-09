import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { assertWorkspaceAccess } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { subscriptionManager } from "@/lib/payments/subscriptions";
import { ReviewSystem, ReviewSystemVersion } from "@/lib/types/domain";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");

  if (!workspaceId) {
    const workspaces = await db.listWorkspacesForUser(user.id);
    const ws = workspaces[0];
    if (!ws) return NextResponse.json({ reviewSystems: [] });
    const systems = await db.listReviewSystemsByWorkspace(ws.id);
    return NextResponse.json({ reviewSystems: systems });
  }

  await assertWorkspaceAccess(user, workspaceId, "viewer");
  const systems = await db.listReviewSystemsByWorkspace(workspaceId);
  return NextResponse.json({ reviewSystems: systems });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { workspaceId, name, discipline, audience, description, evaluationScope, ignoredScope, priceKes } = body;

    if (!workspaceId || !name) {
      return NextResponse.json({ error: "workspaceId and name are required" }, { status: 400 });
    }

    const workspace = await assertWorkspaceAccess(user, workspaceId, "admin");

    // Check plan entitlement limits
    const entitlement = await subscriptionManager.checkEntitlement(workspace, "create_review_system");
    if (!entitlement.allowed) {
      return NextResponse.json({ error: entitlement.reason }, { status: 403 });
    }

    const systemId = `revsys_${Date.now()}`;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const initialVersionId = `ver_${systemId}_1_0_0`;

    // Create default initial draft version
    const initialVersion: ReviewSystemVersion = {
      id: initialVersionId,
      reviewSystemId: systemId,
      versionNumber: "1.0.0-draft",
      changelog: "Initial draft specification.",
      rules: [
        {
          id: `rule_${Date.now()}_1`,
          ruleSystemVersionId: initialVersionId,
          code: "RULE_CORE_01",
          title: "Core Thesis & Problem Statement Clarity",
          category: "Problem Formulation",
          description: "Clear and defensible statement of the core problem or thesis objective.",
          ruleType: "required",
          severity: "critical",
          applicableSection: "Introduction",
          evidenceRequirement: "required",
          requirement: "Problem statement must identify a concrete gap or operational bottleneck.",
          failureAction: "flag",
          recommendation: "Explicitly clarify the boundary conditions and specific failure cases.",
          weight: 8,
          order: 1,
        },
      ],
      examples: [],
      settings: {
        supportedFileTypes: ["pdf", "docx", "txt", "md"],
        maxFileSizeMb: 25,
        autoProcessOnPayment: true,
        scoringScale: "percentage",
        passingScore: 75,
        humanOversightRequired: false,
      },
      isPublished: false,
      isImmutable: false,
      createdAt: new Date().toISOString(),
    };
    await db.saveReviewSystemVersion(initialVersion);

    const reviewSystem: ReviewSystem = {
      id: systemId,
      workspaceId,
      name,
      slug: `${slug}-${Math.random().toString(36).substring(2, 6)}`,
      discipline: discipline || "General Professional Review",
      audience: audience || "Clients & Practitioners",
      description: description || "",
      evaluationScope: evaluationScope || "All submitted chapters/sections.",
      ignoredScope: ignoredScope || "Visual margins and styling.",
      priceKes: typeof priceKes === "number" ? priceKes : 0,
      currentVersionId: initialVersionId,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.saveReviewSystem(reviewSystem);

    return NextResponse.json({ success: true, reviewSystem, version: initialVersion }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create Review System";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
