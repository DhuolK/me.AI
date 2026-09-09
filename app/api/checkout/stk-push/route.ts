import { NextRequest, NextResponse } from "next/server";
import { darajaStateMachine } from "@/lib/daraja/state-machine";
import { db } from "@/lib/db";
import { normalizeKenyanPhoneNumber } from "@/lib/utils/phone";
import crypto from "node:crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { submissionId, phoneNumber, amount, accountReference } = body;

    let subId = submissionId;
    let price = amount;
    let phone = phoneNumber;

    // Handle legacy or flexible payload
    if (body.packSlug) {
      const pack = await db.getReviewSystem(body.packSlug);
      if (!pack) {
        return NextResponse.json({ error: "Review System not found" }, { status: 404 });
      }
      price = pack.priceKes;
      phone = body.guestPhone;
      subId = `sub_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
      await db.saveSubmission({
        id: subId,
        reviewSystemId: pack.id,
        reviewSystemVersionId: pack.currentVersionId,
        guestEmail: body.guestEmail || "guest@me.ai",
        guestPhone: phone,
        status: "PAYMENT_PENDING",
        currentVersionIndex: 1,
        versions: [],
        secureToken: crypto.randomBytes(16).toString("hex"),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    if (!phone) {
      return NextResponse.json(
        { error: "Missing required field: phoneNumber" },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizeKenyanPhoneNumber(phone);

    // 2. Initiate Daraja Checkout
    const transaction = await darajaStateMachine.initiateCheckout({
      submissionId: subId,
      amountKes: Number(price) || 500,
      phoneNumber: normalizedPhone,
      accountReference: accountReference || `REV_${subId.substring(0, 6)}`,
    });

    return NextResponse.json({
      success: true,
      checkoutRequestId: transaction.checkoutRequestId,
      submissionId: subId,
      amountKes: transaction.amountKes,
      message: "STK push initiated to client phone",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Checkout initiation failed" }, { status: 500 });
  }
}
