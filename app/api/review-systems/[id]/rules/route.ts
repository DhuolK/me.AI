import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { assertWorkspaceAccess } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { ReviewRule } from "@/lib/types/domain";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reviewSystem = await db.getReviewSystem(id);
  if (!reviewSystem) {
    return NextResponse.json({ error: "Review System not found" }, { status: 404 });
  }

  await assertWorkspaceAccess(user, reviewSystem.workspaceId, "admin");

  try {
    const body = await req.json();
    const { versionId, rules } = body;

    const targetVersionId = versionId || reviewSystem.currentVersionId;
    const version = await db.getReviewSystemVersion(targetVersionId);

    if (!version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    if (version.isImmutable) {
      return NextResponse.json(
        { error: "Published versions are immutable. Please create a new draft version to modify rules." },
        { status: 400 }
      );
    }

    if (Array.isArray(rules)) {
      version.rules = rules;
    } else if (body.rule) {
      const newRule: ReviewRule = {
        id: `rule_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        ruleSystemVersionId: targetVersionId,
        code: body.rule.code || `RULE_${version.rules.length + 1}`,
        title: body.rule.title,
        category: body.rule.category || "General",
        description: body.rule.description || "",
        ruleType: body.rule.ruleType || "required",
        severity: body.rule.severity || "high",
        applicableSection: body.rule.applicableSection || "All",
        evidenceRequirement: body.rule.evidenceRequirement || "required",
        requirement: body.rule.requirement,
        failureAction: body.rule.failureAction || "flag",
        recommendation: body.rule.recommendation || "",
        weight: body.rule.weight || 5,
        order: version.rules.length + 1,
      };
      version.rules.push(newRule);
    }

    await db.saveReviewSystemVersion(version);
    return NextResponse.json({ success: true, version });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update rules";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reviewSystem = await db.getReviewSystem(id);
  if (!reviewSystem) {
    return NextResponse.json({ error: "Review System not found" }, { status: 404 });
  }

  await assertWorkspaceAccess(user, reviewSystem.workspaceId, "admin");

  try {
    const { searchParams } = new URL(req.url);
    const versionId = searchParams.get("versionId") || reviewSystem.currentVersionId;
    const ruleId = searchParams.get("ruleId");

    if (!ruleId) {
      return NextResponse.json({ error: "ruleId is required" }, { status: 400 });
    }

    const version = await db.getReviewSystemVersion(versionId);
    if (!version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    if (version.isImmutable) {
      return NextResponse.json(
        { error: "Published versions are immutable. Cannot delete rules." },
        { status: 400 }
      );
    }

    version.rules = version.rules.filter((r) => r.id !== ruleId);
    await db.saveReviewSystemVersion(version);

    return NextResponse.json({ success: true, version });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete rule";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
