import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { assertWorkspaceAccess } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { DistributionLink, AccessMode } from "@/lib/types/domain";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const links = await db.listDistributionLinks(id);
  return NextResponse.json({ links });
}

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
    const { name, accessMode, priceKes, cohortId, usageLimit, versionId } = body;

    const token = `${reviewSystem.slug.substring(0, 16)}-${Math.random().toString(36).substring(2, 8)}`;
    const link: DistributionLink = {
      id: `link_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      reviewSystemId: reviewSystem.id,
      reviewSystemVersionId: versionId || reviewSystem.currentVersionId,
      token,
      name: name || `${accessMode || "Public"} Review Link`,
      accessMode: (accessMode as AccessMode) || "PUBLIC",
      priceKes: typeof priceKes === "number" ? priceKes : reviewSystem.priceKes,
      cohortId: cohortId || undefined,
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      usageCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    await db.saveDistributionLink(link);
    return NextResponse.json({ success: true, link }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create distribution link";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
