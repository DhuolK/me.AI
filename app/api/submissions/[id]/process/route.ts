import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { assertSubmissionAccess } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { evaluationEngine } from "@/lib/services/evaluation-engine";

export async function POST(
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

  // Verify payment if required
  if (submission.status === "PAYMENT_PENDING") {
    return NextResponse.json({ error: "Submission payment is pending" }, { status: 402 });
  }

  const version = await db.getReviewSystemVersion(submission.reviewSystemVersionId);
  if (!version) {
    return NextResponse.json({ error: "Review System version not found" }, { status: 404 });
  }

  try {
    const currentVer = submission.versions[submission.currentVersionIndex - 1];
    const rawText = currentVer ? currentVer.rawText : "";

    submission.status = "EVALUATING";
    await db.saveSubmission(submission);

    const report = await evaluationEngine.runEvaluation(submission, version, rawText);

    return NextResponse.json({ success: true, report, submission });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Evaluation failed";
    submission.status = "EVALUATION_FAILED";
    submission.statusMessage = message;
    await db.saveSubmission(submission);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
