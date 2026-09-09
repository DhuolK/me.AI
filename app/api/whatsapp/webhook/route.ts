import { NextRequest, NextResponse } from "next/server";
import { whatsAppGateway } from "@/lib/whatsapp/gateway";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await whatsAppGateway.handleInbound(body);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "WhatsApp gateway error" }, { status: 500 });
  }
}
