import { darajaStateMachine } from "@/lib/daraja/state-machine";
import { db } from "@/lib/db";
import { Submission } from "@/lib/types/domain";
import { normalizeKenyanPhoneNumber } from "@/lib/utils/phone";
import crypto from "node:crypto";

export interface WhatsAppInboundMessage {
  from: string; // e.g. "254712345678"
  text?: string;
  mediaUrl?: string;
  systemSlug: string;
}

export class WhatsAppReviewGateway {
  /**
   * Processes incoming WhatsApp PDF/text submission and triggers STK push
   */
  async handleInbound(msg: WhatsAppInboundMessage) {
    const system = await db.getReviewSystem(msg.systemSlug || "revsys_thesis_thorne");
    if (!system) throw new Error("Review System not found");

    const normalizedPhone = normalizeKenyanPhoneNumber(msg.from);
    const submissionId = `sub_wa_${Date.now()}`;
    const rawText = msg.text || "Draft content submitted via WhatsApp";

    const submission: Submission = {
      id: submissionId,
      reviewSystemId: system.id,
      reviewSystemVersionId: system.currentVersionId,
      guestEmail: `${normalizedPhone}@whatsapp.me.ai`,
      guestPhone: normalizedPhone,
      status: "PAYMENT_PENDING",
      currentVersionIndex: 1,
      versions: [
        {
          versionIndex: 1,
          rawText,
          submittedAt: new Date().toISOString(),
        },
      ],
      secureToken: crypto.randomBytes(16).toString("hex"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.saveSubmission(submission);

    // Trigger Daraja STK Push
    const tx = await darajaStateMachine.initiateCheckout({
      submissionId,
      workspaceId: system.workspaceId,
      amountKes: system.priceKes,
      phoneNumber: normalizedPhone,
      accountReference: `REV_${submissionId.substring(0, 6)}`,
    });

    return {
      success: true,
      submissionId,
      checkoutRequestId: tx.checkoutRequestId,
      replyMessage: `📄 Draft received for ${system.name}!\n\n💳 An M-Pesa prompt for ${system.priceKes} KES has been sent to your phone. Enter your PIN to receive your instant AI report link.`,
    };
  }
}

export const whatsAppGateway = new WhatsAppReviewGateway();
