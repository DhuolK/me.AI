import { NextRequest, NextResponse } from "next/server";
import { payoutLedger } from "@/lib/payments/payout-ledger";

export async function GET(request: NextRequest) {
  try {
    const expertId = request.nextUrl.searchParams.get("expertId") || "exp_thorne_01";
    const ledger = await payoutLedger.calculateExpertLedger(expertId);

    return NextResponse.json({
      success: true,
      ledger,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to query ledger" }, { status: 500 });
  }
}
