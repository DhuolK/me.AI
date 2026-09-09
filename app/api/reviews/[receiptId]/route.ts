import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ receiptId: string }> }
) {
  try {
    const { receiptId } = await params;
    let report = await db.getReport(receiptId);
    let payment = await db.getPaymentByReceipt(receiptId);

    if (!report && payment && payment.submissionId) {
      report = await db.getReport(payment.submissionId);
    }

    if (!report) {
      return NextResponse.json({ error: "Report not found for this receipt" }, { status: 404 });
    }

    const version = await db.getReviewSystemVersion(report.reviewSystemVersionId);

    return NextResponse.json({
      report,
      review: report,
      version,
      payment,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch review" }, { status: 500 });
  }
}
