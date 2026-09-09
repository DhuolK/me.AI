export interface EmailDispatchPayload {
  toEmail: string;
  receiptId: string;
  packTitle: string;
  amountKes: number;
  mpesaReceipt: string;
  reportUrl: string;
}

export class NotificationMailer {
  /**
   * Dispatches receipt token and magic link to guest client
   */
  async sendReviewReadyNotification(payload: EmailDispatchPayload): Promise<{ success: boolean; messageId: string }> {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // In production, integrate Resend, Postmark, or AWS SES
    console.log(`\n📧 [Email Dispatch] Delivering Magic Receipt to ${payload.toEmail}...`);
    console.log(`   Subject: Your me.AI Review for ${payload.packTitle} is Ready`);
    console.log(`   Receipt ID: ${payload.receiptId}`);
    console.log(`   Direct Report Access URL: ${payload.reportUrl}`);
    console.log(`   M-Pesa Verified: ${payload.mpesaReceipt} (${payload.amountKes} KES)\n`);

    return {
      success: true,
      messageId,
    };
  }
}

export const notificationMailer = new NotificationMailer();
