import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const link = await db.getDistributionLink(token);
  if (!link) {
    return NextResponse.json({ error: "Review link not found" }, { status: 404 });
  }

  if (!link.isActive) {
    return NextResponse.json({ error: "This review link is currently inactive" }, { status: 410 });
  }

  const reviewSystem = await db.getReviewSystem(link.reviewSystemId);
  if (!reviewSystem) {
    return NextResponse.json({ error: "Associated Review System not found" }, { status: 404 });
  }

  const version = await db.getReviewSystemVersion(link.reviewSystemVersionId);
  if (!version) {
    return NextResponse.json({ error: "Review System version not found" }, { status: 404 });
  }

  const workspace = await db.getWorkspace(reviewSystem.workspaceId);
  const owner = workspace ? await db.getUser(workspace.ownerId) : null;

  return NextResponse.json({
    link,
    reviewSystem: {
      id: reviewSystem.id,
      name: reviewSystem.name,
      discipline: reviewSystem.discipline,
      audience: reviewSystem.audience,
      description: reviewSystem.description,
      evaluationScope: reviewSystem.evaluationScope,
      ignoredScope: reviewSystem.ignoredScope,
      priceKes: link.priceKes,
      accessMode: link.accessMode,
    },
    version: {
      id: version.id,
      versionNumber: version.versionNumber,
      rulesCount: version.rules.length,
      rulesOverview: version.rules.map((r) => ({
        code: r.code,
        title: r.title,
        category: r.category,
        severity: r.severity,
        applicableSection: r.applicableSection,
      })),
      settings: version.settings,
    },
    organization: {
      workspaceName: workspace?.name,
      authorName: owner?.name,
      authorAvatarUrl: owner?.avatarUrl,
    },
  });
}
