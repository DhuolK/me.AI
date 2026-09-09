import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { darajaStateMachine } from "@/lib/daraja/state-machine";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ checkoutId: string }> }
) {
  try {
    const { checkoutId } = await params;
    let payment = await db.getPaymentByCheckoutId(checkoutId);

    if (!payment) {
      payment = await db.getPaymentByReceipt(checkoutId);
    }

    if (!payment) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
    }

    // Auto-simulate verification in development/test if requested by query param
    const simulate = request.nextUrl.searchParams.get("simulate");
    if (simulate === "true" && !payment.isAuthoritativeVerified && payment.checkoutRequestId) {
      payment = await darajaStateMachine.simulateSuccessfulPayment(payment.checkoutRequestId);
    }

    return NextResponse.json({
      status: payment.status,
      isVerified: payment.isAuthoritativeVerified,
      amountKes: payment.amountKes,
      mpesaReceipt: payment.mpesaReceiptNumber,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to query status" }, { status: 500 });
  }
}
