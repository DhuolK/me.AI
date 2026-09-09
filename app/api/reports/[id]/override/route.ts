import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { assertWorkspaceAccess } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { ProfessionalOverride, AuditLog } from "@/lib/types/domain";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const report = await db.getReport(id);
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const reviewSystem = await db.getReviewSystem(report.reviewSystemId);
  if (!reviewSystem) {
    return NextResponse.json({ error: "Review System not found" }, { status: 404 });
  }

  await assertWorkspaceAccess(user, reviewSystem.workspaceId, "member");

  try {
    const body = await req.json();
    const { findingId, decision, overrideFinding, overrideScore, reason } = body;

    if (!findingId || !decision || !reason) {
      return NextResponse.json({ error: "findingId, decision, and reason are required" }, { status: 400 });
    }

    const finding = report.findings.find((f) => f.id === findingId);
    if (!finding) {
      return NextResponse.json({ error: "Finding not found in report" }, { status: 404 });
    }

    const override: ProfessionalOverride = {
      id: `ovr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      findingId,
      decision,
      overrideFinding: overrideFinding || undefined,
      overrideScore: typeof overrideScore === "number" ? overrideScore : undefined,
      reason,
      expertUserId: user.id,
      expertName: user.name,
      appliedAt: new Date().toISOString(),
    };

    // Apply decision to finding
    if (decision === "accepted") {
      finding.status = "passed";
    } else if (decision === "rejected") {
      finding.status = "failed";
    } else if (decision === "overridden" || decision === "modified") {
      if (overrideFinding) finding.finding = overrideFinding;
    }

    // Recompute score counts
    report.passedCount = report.findings.filter((f) => f.status === "passed").length;
    report.criticalCount = report.findings.filter((f) => f.status === "failed" && f.severity === "critical").length;
    report.needsAttentionCount = report.findings.filter(
      (f) => f.status === "warning" || (f.status === "failed" && f.severity !== "critical")
    ).length;

    if (overrideScore !== undefined) {
      report.overallScore = overrideScore;
    }

    report.overrides.push(override);
    report.updatedAt = new Date().toISOString();
    await db.saveReport(report);

    // Audit Log entry
    const auditLog: AuditLog = {
      id: `aud_${Date.now()}`,
      workspaceId: reviewSystem.workspaceId,
      actorId: user.id,
      actorName: user.name,
      action: "finding.override",
      entityType: "Report",
      entityId: report.id,
      metadata: {
        findingId,
        decision,
        reason,
      },
      createdAt: new Date().toISOString(),
    };
    await db.recordAuditLog(auditLog);

    return NextResponse.json({ success: true, report, override });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to apply override";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
