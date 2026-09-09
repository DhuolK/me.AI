import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, generateSecureToken } from "@/lib/auth/session";
import { Submission, SubmissionStatus } from "@/lib/types/domain";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");
  const reviewSystemId = searchParams.get("reviewSystemId");

  if (reviewSystemId) {
    const submissions = await db.listSubmissionsByReviewSystem(reviewSystemId);
    return NextResponse.json({ submissions });
  }

  const workspaces = await db.listWorkspacesForUser(user.id);
  const targetWsId = workspaceId || workspaces[0]?.id;
  if (!targetWsId) {
    return NextResponse.json({ submissions: [] });
  }

  const submissions = await db.listSubmissionsByWorkspace(targetWsId);
  return NextResponse.json({ submissions });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      reviewSystemId,
      distributionLinkToken,
      guestEmail,
      guestPhone,
      guestName,
      rawText,
      fileName,
    } = body;

    if (!rawText || rawText.trim().length === 0) {
      return NextResponse.json({ error: "Document content (rawText) is required" }, { status: 400 });
    }

    if (!guestEmail && !guestPhone) {
      return NextResponse.json({ error: "At least guest email or phone number is required" }, { status: 400 });
    }

    let targetSystemId = reviewSystemId;
    let targetVersionId = "";
    let linkId: string | undefined;
    let cohortId: string | undefined;
    let requiresPayment = false;
    let priceKes = 0;

    if (distributionLinkToken) {
      const link = await db.getDistributionLink(distributionLinkToken);
      if (!link || !link.isActive) {
        return NextResponse.json({ error: "This review link is invalid or has been deactivated" }, { status: 400 });
      }
      targetSystemId = link.reviewSystemId;
      targetVersionId = link.reviewSystemVersionId;
      linkId = link.id;
      cohortId = link.cohortId;
      if (link.accessMode === "PAID" && link.priceKes > 0) {
        requiresPayment = true;
        priceKes = link.priceKes;
      }
    }

    const reviewSystem = await db.getReviewSystem(targetSystemId);
    if (!reviewSystem) {
      return NextResponse.json({ error: "Review System not found" }, { status: 404 });
    }

    if (!targetVersionId) {
      targetVersionId = reviewSystem.currentVersionId;
    }

    const version = await db.getReviewSystemVersion(targetVersionId);
    if (!version) {
      return NextResponse.json({ error: "Review System version not found" }, { status: 404 });
    }

    const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const secureToken = generateSecureToken("sec");

    const initialStatus: SubmissionStatus = requiresPayment ? "PAYMENT_PENDING" : "UPLOADED";

    const submission: Submission = {
      id: submissionId,
      reviewSystemId: reviewSystem.id,
      reviewSystemVersionId: version.id, // Immutable link
      distributionLinkId: linkId,
      cohortId,
      guestEmail: guestEmail || "",
      guestPhone: guestPhone || undefined,
      guestName: guestName || undefined,
      secureToken,
      status: initialStatus,
      currentVersionIndex: 1,
      versions: [
        {
          versionIndex: 1,
          submittedAt: new Date().toISOString(),
          rawText,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.saveSubmission(submission);

    return NextResponse.json(
      {
        success: true,
        submission,
        requiresPayment,
        priceKes,
        secureToken,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create submission";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
