import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { evaluationEngine } from "@/lib/services/evaluation-engine";
import { isPaymentVerified } from "@/lib/utils/payment";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { receiptId, submissionId } = body;

    let subId = submissionId;
    let payment = null;

    if (receiptId) {
      payment = await db.getPaymentByReceipt(receiptId);
      if (!payment) {
        return NextResponse.json({ error: "Payment transaction not found" }, { status: 404 });
      }

      if (!isPaymentVerified(payment)) {
        return NextResponse.json(
          { error: "Payment has not been server-verified. Entitlement locked." },
          { status: 403 }
        );
      }
      subId = payment.submissionId;
    }

    if (!subId) {
      return NextResponse.json({ error: "Missing submission identifier" }, { status: 400 });
    }

    const submission = await db.getSubmission(subId);
    if (!submission) {
      return NextResponse.json({ error: "Submission data not found" }, { status: 404 });
    }

    const version = await db.getReviewSystemVersion(submission.reviewSystemVersionId);
    if (!version) {
      return NextResponse.json({ error: "Immutable review system version not found" }, { status: 404 });
    }

    const rawText = submission.versions?.[0]?.rawText || "Sample submitted manuscript content for review.";
    const report = await evaluationEngine.runEvaluation(submission, version, rawText);

    return NextResponse.json({
      success: true,
      report,
      review: report,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process evaluation" }, { status: 500 });
  }
}
