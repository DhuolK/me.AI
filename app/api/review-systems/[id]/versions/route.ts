import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { assertWorkspaceAccess } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { ReviewSystemVersion } from "@/lib/types/domain";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const versions = await db.listReviewSystemVersions(id);
  return NextResponse.json({ versions });
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
    const { action, versionId, versionNumber, changelog } = body;

    if (action === "publish") {
      const version = await db.getReviewSystemVersion(versionId || reviewSystem.currentVersionId);
      if (!version) return NextResponse.json({ error: "Version not found" }, { status: 404 });

      if (version.rules.length === 0) {
        return NextResponse.json({ error: "Cannot publish a version with 0 rules" }, { status: 400 });
      }

      version.isPublished = true;
      version.isImmutable = true;
      version.publishedAt = new Date().toISOString();
      version.publishedBy = user.id;
      version.versionNumber = versionNumber || version.versionNumber.replace("-draft", "");
      if (changelog) version.changelog = changelog;

      await db.saveReviewSystemVersion(version);

      reviewSystem.currentVersionId = version.id;
      reviewSystem.status = "published";
      reviewSystem.updatedAt = new Date().toISOString();
      await db.saveReviewSystem(reviewSystem);

      return NextResponse.json({ success: true, version, reviewSystem });
    }

    if (action === "create_draft" || action === "branch_version") {
      // Clone from an existing version
      const sourceVersion = await db.getReviewSystemVersion(versionId || reviewSystem.currentVersionId);
      const newVersionId = `ver_${reviewSystem.id}_${Date.now()}`;

      // Calculate next version number if not provided
      let calculatedVersion = versionNumber;
      if (!calculatedVersion && sourceVersion) {
        const cleanVer = sourceVersion.versionNumber.replace(/-draft.*$/, "");
        const parts = cleanVer.split(".").map(Number);
        if (parts.length === 3 && !parts.some(isNaN)) {
          calculatedVersion = `${parts[0]}.${parts[1] + 1}.0-draft`;
        } else {
          calculatedVersion = `${cleanVer}.1-draft`;
        }
      }

      const newVersion: ReviewSystemVersion = {
        id: newVersionId,
        reviewSystemId: reviewSystem.id,
        versionNumber: calculatedVersion || "1.1.0-draft",
        changelog: changelog || `Branched from v${sourceVersion?.versionNumber || "1.0.0"}.`,
        rules: sourceVersion ? JSON.parse(JSON.stringify(sourceVersion.rules)) : [],
        examples: sourceVersion ? JSON.parse(JSON.stringify(sourceVersion.examples)) : [],
        settings: sourceVersion
          ? JSON.parse(JSON.stringify(sourceVersion.settings))
          : {
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

      await db.saveReviewSystemVersion(newVersion);

      // Switch review system currentVersionId to new draft so the studio opens it directly
      reviewSystem.currentVersionId = newVersion.id;
      reviewSystem.updatedAt = new Date().toISOString();
      await db.saveReviewSystem(reviewSystem);

      return NextResponse.json({ success: true, version: newVersion, reviewSystem });
    }

    if (action === "switch_active") {
      const targetVersion = await db.getReviewSystemVersion(versionId);
      if (!targetVersion) return NextResponse.json({ error: "Target version not found" }, { status: 404 });

      reviewSystem.currentVersionId = targetVersion.id;
      reviewSystem.updatedAt = new Date().toISOString();
      await db.saveReviewSystem(reviewSystem);

      return NextResponse.json({ success: true, version: targetVersion, reviewSystem });
    }

    return NextResponse.json({ error: "Invalid action. Supported: 'publish', 'create_draft'" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to process version action";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
