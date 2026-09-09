import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { assertSubmissionAccess } from "@/lib/auth/rbac";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  const submission = await db.getSubmission(id);
  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  try {
    await assertSubmissionAccess(submission, user, token);
  } catch {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const reviewSystem = await db.getReviewSystem(submission.reviewSystemId);
  const version = await db.getReviewSystemVersion(submission.reviewSystemVersionId);
  const report = await db.getReport(submission.id);

  return NextResponse.json({
    submission,
    reviewSystem,
    version,
    report,
  });
}
