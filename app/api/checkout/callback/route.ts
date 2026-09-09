import { NextRequest, NextResponse } from "next/server";
import { darajaStateMachine, DarajaCallbackPayload } from "@/lib/daraja/state-machine";

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as DarajaCallbackPayload;
    const result = await darajaStateMachine.processCallback(payload);

    return NextResponse.json({
      success: result.success,
      transactionId: result.transaction.id,
      status: result.transaction.status,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Callback failed" }, { status: 500 });
  }
}
