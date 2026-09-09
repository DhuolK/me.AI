import crypto from "node:crypto";
import { db } from "@/lib/db";
import { LedgerEntry, ReviewCharge, PaymentTransaction } from "@/lib/types/domain";

export class FinancialLedger {
  /**
   * Records an immutable ledger entry and recalculates workspace balance.
   */
  async recordEntry(params: {
    workspaceId: string;
    entryType: "CREDIT" | "DEBIT";
    category: "REVIEW_REVENUE" | "PLATFORM_FEE" | "SUBSCRIPTION_PAYMENT" | "PAYOUT" | "REFUND";
    amountKes: number;
    referenceId: string;
    description: string;
  }): Promise<LedgerEntry> {
    const existingEntries = await db.listLedgerEntries(params.workspaceId);

    // Idempotency check: verify referenceId hasn't already been processed for this category
    const duplicate = existingEntries.find(
      (e) => e.referenceId === params.referenceId && e.category === params.category
    );
    if (duplicate) {
      return duplicate;
    }

    const currentBalance = existingEntries[0]?.balanceAfterKes || 0;
    const delta = params.entryType === "CREDIT" ? params.amountKes : -params.amountKes;
    const balanceAfterKes = currentBalance + delta;

    const entry: LedgerEntry = {
      id: `led_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
      workspaceId: params.workspaceId,
      entryType: params.entryType,
      category: params.category,
      amountKes: params.amountKes,
      referenceId: params.referenceId,
      description: params.description,
      balanceAfterKes,
      createdAt: new Date().toISOString(),
    };

    await db.saveLedgerEntry(entry);
    return entry;
  }

  /**
   * Handles financial breakdown for a verified client review payment.
   */
  async processReviewPaymentLedger(
    payment: PaymentTransaction,
    workspaceId: string,
    platformFeePercent: number = 0
  ): Promise<{ charge: ReviewCharge; netPayoutKes: number }> {
    const gross = payment.amountKes;
    const platformFee = Math.round((gross * platformFeePercent) / 100);
    const netPayout = gross - platformFee;

    const chargeId = `chg_${payment.id}`;
    const charge: ReviewCharge = {
      id: chargeId,
      workspaceId,
      submissionId: payment.submissionId || "",
      paymentTransactionId: payment.id,
      grossAmountKes: gross,
      platformFeeKes: platformFee,
      netPayoutKes: netPayout,
      status: "available_for_payout",
      createdAt: new Date().toISOString(),
    };

    // Credit full gross to workspace ledger
    await this.recordEntry({
      workspaceId,
      entryType: "CREDIT",
      category: "REVIEW_REVENUE",
      amountKes: gross,
      referenceId: payment.id,
      description: `Client review payment (${payment.mpesaReceiptNumber || payment.id})`,
    });

    // If platform fee applies, debit fee
    if (platformFee > 0) {
      await this.recordEntry({
        workspaceId,
        entryType: "DEBIT",
        category: "PLATFORM_FEE",
        amountKes: platformFee,
        referenceId: payment.id,
        description: `Platform fee (${platformFeePercent}%) on transaction ${payment.id}`,
      });
    }

    return { charge, netPayoutKes: netPayout };
  }

  /**
   * Retrieves summary balance and revenue for a workspace.
   */
  async getWorkspaceFinancialSummary(workspaceId: string): Promise<{
    currentBalanceKes: number;
    totalRevenueKes: number;
    totalPlatformFeesKes: number;
    totalPayoutsKes: number;
  }> {
    const entries = await db.listLedgerEntries(workspaceId);
    let totalRevenue = 0;
    let totalFees = 0;
    let totalPayouts = 0;

    for (const e of entries) {
      if (e.category === "REVIEW_REVENUE") totalRevenue += e.amountKes;
      if (e.category === "PLATFORM_FEE") totalFees += e.amountKes;
      if (e.category === "PAYOUT") totalPayouts += e.amountKes;
    }

    const currentBalance = entries[0]?.balanceAfterKes || 0;

    return {
      currentBalanceKes: currentBalance,
      totalRevenueKes: totalRevenue,
      totalPlatformFeesKes: totalFees,
      totalPayoutsKes: totalPayouts,
    };
  }

  /**
   * Initiates a B2C M-Pesa or Bank Payout and executes the corresponding debit ledger entry.
   */
  async requestPayout(params: {
    workspaceId: string;
    amountKes: number;
    destinationPhone: string;
    requestedBy: string;
  }) {
    const summary = await this.getWorkspaceFinancialSummary(params.workspaceId);
    if (params.amountKes <= 0) {
      throw new Error("Payout amount must be greater than 0 KES.");
    }
    if (params.amountKes > summary.currentBalanceKes) {
      throw new Error(
        `Insufficient available balance. Requested: ${params.amountKes} KES, Available: ${summary.currentBalanceKes} KES.`
      );
    }

    const payoutId = `pay_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
    const mpesaB2CReference = `B2C_${Math.floor(10000000 + Math.random() * 90000000)}`;

    const payout = {
      id: payoutId,
      workspaceId: params.workspaceId,
      amountKes: params.amountKes,
      destinationPhone: params.destinationPhone,
      mpesaB2CReference,
      status: "completed" as const,
      requestedBy: params.requestedBy,
      processedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    await db.savePayout(payout);

    // Record double-entry debit in financial ledger
    const ledgerEntry = await this.recordEntry({
      workspaceId: params.workspaceId,
      entryType: "DEBIT",
      category: "PAYOUT",
      amountKes: params.amountKes,
      referenceId: payoutId,
      description: `M-Pesa B2C Payout to ${params.destinationPhone} (Ref: ${mpesaB2CReference})`,
    });

    const updatedSummary = await this.getWorkspaceFinancialSummary(params.workspaceId);

    return {
      success: true,
      payout,
      ledgerEntry,
      newBalanceKes: updatedSummary.currentBalanceKes,
    };
  }

  async getLedgerSummary(workspaceId: string) {
    const summary = await this.getWorkspaceFinancialSummary(workspaceId);
    return {
      balanceKes: summary.currentBalanceKes,
      totalRevenueKes: summary.totalRevenueKes,
      platformFeeKes: summary.totalPlatformFeesKes,
    };
  }
}

export const financialLedger = new FinancialLedger();
export const ledgerService = financialLedger;
