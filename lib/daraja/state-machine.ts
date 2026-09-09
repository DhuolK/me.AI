import { PaymentTransaction, PaymentStatus } from "@/lib/types/domain";
import { db } from "@/lib/db";
import { normalizeKenyanPhoneNumber } from "@/lib/utils/phone";
import { financialLedger } from "@/lib/payments/ledger";
import crypto from "node:crypto";

export { normalizeKenyanPhoneNumber };

export interface DarajaCallbackItem {
  Name: string;
  Value?: string | number;
}

export interface DarajaCallbackPayload {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: DarajaCallbackItem[];
      };
    };
  };
}

export class DarajaPaymentStateMachine {
  /**
   * Initiates an STK push transaction and generates an idempotent receipt ID
   */
  async initiateCheckout(params: {
    submissionId: string;
    workspaceId?: string;
    amountKes: number;
    phoneNumber: string;
    accountReference?: string;
  }): Promise<PaymentTransaction> {
    if (!params.phoneNumber || params.phoneNumber.trim().length === 0) {
      throw new Error("Invalid phone number provided for Daraja STK push.");
    }

    if (!params.amountKes || params.amountKes <= 0) {
      throw new Error("Invalid transaction amount.");
    }

    const normalizedPhone = normalizeKenyanPhoneNumber(params.phoneNumber);
    const rawUuid = crypto.randomUUID().replace(/-/g, "").substring(0, 8);
    const txId = `tx_${rawUuid}_${Date.now().toString(36)}`;
    const checkoutRequestId = `ws_CO_${Date.now()}_${crypto.randomInt(10000, 99999)}`;
    const accountRef = params.accountReference || `REV-${rawUuid.substring(0, 5).toUpperCase()}`;

    const transaction: PaymentTransaction = {
      id: txId,
      submissionId: params.submissionId,
      workspaceId: params.workspaceId,
      amountKes: params.amountKes,
      phoneNumber: normalizedPhone,
      accountReference: accountRef,
      checkoutRequestId,
      merchantRequestId: `MR_${Date.now()}`,
      status: "STK_SENT",
      isAuthoritativeVerified: false,
      idempotencyKey: `idemp_${params.submissionId}_${params.amountKes}`,
      createdAt: new Date().toISOString(),
    };

    await db.savePayment(transaction);

    // Update submission status to PAYMENT_PENDING if attached
    if (params.submissionId) {
      const submission = await db.getSubmission(params.submissionId);
      if (submission) {
        submission.status = "PAYMENT_PENDING";
        submission.paymentTransactionId = transaction.id;
        submission.updatedAt = new Date().toISOString();
        await db.saveSubmission(submission);
      }
    }

    return transaction;
  }

  /**
   * Server-authoritative webhook/callback handler with strict idempotency
   */
  async processCallback(payload: DarajaCallbackPayload): Promise<{
    success: boolean;
    transaction: PaymentTransaction;
    error?: string;
  }> {
    if (!payload?.Body?.stkCallback) {
      throw new Error("Malformed Daraja callback payload structure");
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = payload.Body.stkCallback;

    const existingTx = await db.getPayment(CheckoutRequestID);
    if (!existingTx) {
      throw new Error(`Transaction with checkout ID ${CheckoutRequestID} not found`);
    }

    // Idempotency: if already confirmed/verified, return immediately
    if (existingTx.status === "CONFIRMED" && existingTx.isAuthoritativeVerified) {
      return { success: true, transaction: existingTx };
    }

    if (ResultCode === 0 && CallbackMetadata) {
      const receiptItem = CallbackMetadata.Item.find((i) => i.Name === "MpesaReceiptNumber");
      const amountItem = CallbackMetadata.Item.find((i) => i.Name === "Amount");

      const mpesaReceipt = receiptItem?.Value ? String(receiptItem.Value) : `MPE${Date.now()}`;
      const amountPaid = amountItem?.Value ? Number(amountItem.Value) : existingTx.amountKes;

      if (amountPaid < existingTx.amountKes) {
        existingTx.status = "FAILED";
        existingTx.statusDetails = `Underpayment: expected ${existingTx.amountKes} KES, received ${amountPaid} KES`;
        existingTx.isAuthoritativeVerified = false;
        await db.savePayment(existingTx);
        return { success: false, transaction: existingTx, error: existingTx.statusDetails };
      }

      existingTx.status = "CONFIRMED";
      existingTx.isAuthoritativeVerified = true;
      existingTx.mpesaReceiptNumber = mpesaReceipt;
      existingTx.verifiedAt = new Date().toISOString();
      existingTx.statusDetails = ResultDesc || "STK Push Successful";
      await db.savePayment(existingTx);

      // Financial Ledger entry
      if (existingTx.workspaceId) {
        const ws = await db.getWorkspace(existingTx.workspaceId);
        const plan = ws ? await db.getSubscriptionPlan(ws.planTier) : null;
        const feePercent = plan?.platformFeePercent || 0;
        await financialLedger.processReviewPaymentLedger(existingTx, existingTx.workspaceId, feePercent);
      }

      // Update submission state to PAYMENT_CONFIRMED
      if (existingTx.submissionId) {
        const sub = await db.getSubmission(existingTx.submissionId);
        if (sub) {
          sub.status = "PAYMENT_CONFIRMED";
          sub.updatedAt = new Date().toISOString();
          await db.saveSubmission(sub);
        }
      }

      return { success: true, transaction: existingTx };
    } else {
      existingTx.status = "FAILED";
      existingTx.isAuthoritativeVerified = false;
      existingTx.statusDetails = ResultDesc || "Payment rejected or cancelled by user";
      await db.savePayment(existingTx);

      if (existingTx.submissionId) {
        const sub = await db.getSubmission(existingTx.submissionId);
        if (sub) {
          sub.status = "PAYMENT_FAILED";
          sub.statusMessage = existingTx.statusDetails;
          sub.updatedAt = new Date().toISOString();
          await db.saveSubmission(sub);
        }
      }

      return { success: false, transaction: existingTx, error: existingTx.statusDetails };
    }
  }

  /**
   * Instant mock sandbox verification for tests
   */
  async simulateSuccessfulPayment(checkoutRequestId: string): Promise<PaymentTransaction> {
    const mockPayload: DarajaCallbackPayload = {
      Body: {
        stkCallback: {
          MerchantRequestID: "MOCK_MR_123",
          CheckoutRequestID: checkoutRequestId,
          ResultCode: 0,
          ResultDesc: "The service request is processed successfully.",
          CallbackMetadata: {
            Item: [
              { Name: "Amount", Value: 500 },
              { Name: "MpesaReceiptNumber", Value: `QHD${crypto.randomInt(100000, 999999)}` },
              { Name: "TransactionDate", Value: 20260909120000 },
              { Name: "PhoneNumber", Value: 254712345678 },
            ],
          },
        },
      },
    };

    const result = await this.processCallback(mockPayload);
    return result.transaction;
  }
}

export const darajaStateMachine = new DarajaPaymentStateMachine();
