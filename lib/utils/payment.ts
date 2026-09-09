import { PaymentTransaction } from "@/lib/types/domain";

/**
 * Server-authoritative check for verified payments
 */
export function isPaymentVerified(
  payment: PaymentTransaction | null | undefined
): boolean {
  return Boolean(
    payment && payment.isAuthoritativeVerified && payment.status === "CONFIRMED"
  );
}
