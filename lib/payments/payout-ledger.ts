import { db } from "@/lib/db";
import { isPaymentVerified } from "@/lib/utils/payment";
import { normalizeKenyanPhoneNumber } from "@/lib/utils/phone";
import crypto from "node:crypto";

export interface PayoutEntry {
  expertId: string;
  expertName: string;
  totalReviewsCount: number;
  grossRevenueKes: number;
  platformFeeKes: number; // e.g. 20%
  expertEarningsKes: number; // 80%
  status: "PENDING_DISBURSEMENT" | "PAID";
}

export class DarajaPayoutLedger {
  private PLATFORM_FEE_PERCENT = 0.2; // 20%

  /**
   * Calculates earnings split across all verified reviews for an expert
   */
  async calculateExpertLedger(expertId: string): Promise<PayoutEntry> {
    const allPayments = await db.getAllPayments();

    // Filter verified payments
    const verified = allPayments.filter(isPaymentVerified);
    const grossRevenueKes = verified.reduce((acc, p) => acc + (p.amountKes || 0), 0);
    const platformFeeKes = Math.round(grossRevenueKes * this.PLATFORM_FEE_PERCENT);
    const expertEarningsKes = grossRevenueKes - platformFeeKes;

    return {
      expertId,
      expertName: "Dr. Aris Thorne",
      totalReviewsCount: verified.length,
      grossRevenueKes,
      platformFeeKes,
      expertEarningsKes,
      status: "PENDING_DISBURSEMENT",
    };
  }

  /**
   * Simulates Daraja B2C M-Pesa payout to expert's phone/till
   */
  async disburseEarnings(expertId: string, phone: string, amountKes: number) {
    const normalizedPhone = normalizeKenyanPhoneNumber(phone);
    const b2cReceipt = `B2C_${Date.now()}_${crypto.randomInt(100000, 999999)}`;
    console.log(`💸 [Daraja B2C Payout] Disbursing ${amountKes} KES to ${normalizedPhone} (Receipt: ${b2cReceipt})...`);
    return {
      success: true,
      b2cReceipt,
      amountKes,
      disbursedAt: new Date().toISOString(),
    };
  }
}

export const payoutLedger = new DarajaPayoutLedger();
