import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { assertWorkspaceAccess } from "@/lib/auth/rbac";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();

  const reviewSystem = await db.getReviewSystem(id);
  if (!reviewSystem) {
    return NextResponse.json({ error: "Review System not found" }, { status: 404 });
  }

  // If public/published, allow retrieval; if authenticated, check workspace
  if (user) {
    await assertWorkspaceAccess(user, reviewSystem.workspaceId, "viewer");
  }

  const currentVersion = await db.getReviewSystemVersion(reviewSystem.currentVersionId);
  const versions = await db.listReviewSystemVersions(reviewSystem.id);
  const distributionLinks = await db.listDistributionLinks(reviewSystem.id);

  return NextResponse.json({
    reviewSystem,
    currentVersion,
    versions,
    distributionLinks,
  });
}

export async function PUT(
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
    const { name, discipline, audience, description, evaluationScope, ignoredScope, priceKes, status } = body;

    if (name) reviewSystem.name = name;
    if (discipline !== undefined) reviewSystem.discipline = discipline;
    if (audience !== undefined) reviewSystem.audience = audience;
    if (description !== undefined) reviewSystem.description = description;
    if (evaluationScope !== undefined) reviewSystem.evaluationScope = evaluationScope;
    if (ignoredScope !== undefined) reviewSystem.ignoredScope = ignoredScope;
    if (priceKes !== undefined) reviewSystem.priceKes = priceKes;
    if (status) reviewSystem.status = status;

    reviewSystem.updatedAt = new Date().toISOString();
    await db.saveReviewSystem(reviewSystem);

    return NextResponse.json({ success: true, reviewSystem });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update review system";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
