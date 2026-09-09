import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { assertReportAccess } from "@/lib/auth/rbac";
import { db } from "@/lib/db";

export async function GET(
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
  const reviewSystem = await db.getReviewSystem(report.reviewSystemId);
  const version = await db.getReviewSystemVersion(report.reviewSystemVersionId);

  return NextResponse.json({
    report,
    submission,
    reviewSystem,
    version,
  });
}
