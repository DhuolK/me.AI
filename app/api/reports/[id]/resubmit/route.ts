import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { assertReportAccess } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { evaluationEngine } from "@/lib/services/evaluation-engine";
import { SubmissionVersion } from "@/lib/types/domain";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  const report = await db.getReport(id);
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  try {
    await assertReportAccess(report, user, token);
  } catch {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const submission = await db.getSubmission(report.submissionId);
  if (!submission) {
    return NextResponse.json({ error: "Associated submission not found" }, { status: 404 });
  }

  const version = await db.getReviewSystemVersion(submission.reviewSystemVersionId);
  if (!version) {
    return NextResponse.json({ error: "Review System version not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { rawText } = body;

    if (!rawText || rawText.trim().length === 0) {
      return NextResponse.json({ error: "Revised document content is required" }, { status: 400 });
    }

    const nextIndex = submission.currentVersionIndex + 1;
    const newVersion: SubmissionVersion = {
      versionIndex: nextIndex,
      submittedAt: new Date().toISOString(),
      rawText,
    };

    submission.versions.push(newVersion);
    submission.currentVersionIndex = nextIndex;
    submission.status = "EVALUATING";
    await db.saveSubmission(submission);

    // Run new evaluation which will automatically compute revisionDelta against the previous report
    const newReport = await evaluationEngine.runEvaluation(submission, version, rawText);

    return NextResponse.json({
      success: true,
      report: newReport,
      submission,
      delta: newReport.revisionDelta,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to process resubmission";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
