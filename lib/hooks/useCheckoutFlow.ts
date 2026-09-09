import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { apiClient, ApiError } from "@/lib/api/client";
import { formatKes } from "@/lib/utils/currency";

export type CheckoutStep = "intake" | "stk_sent" | "processing" | "completed";

interface UseCheckoutFlowParams {
  packSlug: string;
  priceKes: number;
  initialText?: string;
  onSuccess?: (receiptId: string) => void;
}

const DEFAULT_FILENAME = "thesis_draft_ch1_3.txt";

export function useCheckoutFlow({
  packSlug,
  priceKes,
  initialText = "",
  onSuccess,
}: UseCheckoutFlowParams) {
  const isMountedRef = useRef(true);

  const [guestEmail, setGuestEmail] = useState("student@university.ac.ke");
  const [guestPhone, setGuestPhone] = useState("254712345678");
  const [rawText, setRawText] = useState(initialText);
  const [step, setStep] = useState<CheckoutStep>("intake");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const reset = useCallback(() => {
    setStep("intake");
    setErrorMessage(null);
  }, []);

  const startReview = useCallback(async () => {
    setErrorMessage(null);
    setStep("stk_sent");

    try {
      // 1. Initiate Checkout via API Service
      const checkoutData = await apiClient.checkout.initiate({
        packSlug,
        guestEmail,
        guestPhone,
        filename: DEFAULT_FILENAME,
        rawText,
      });

      const currentReceiptId = checkoutData.receiptId;
      toast.info("M-Pesa STK push initiated", {
        description: `Authorizing ${formatKes(priceKes)} for ${guestPhone}`,
      });

      // 2. Poll / simulate verification
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (!isMountedRef.current) return;

      setStep("processing");

      // Verify Daraja Transaction via simulation in dev
      await apiClient.checkout.checkStatus(currentReceiptId, true);
      if (!isMountedRef.current) return;

      // 3. Trigger AI Review Process
      await apiClient.reviews.process({ receiptId: currentReceiptId });
      if (!isMountedRef.current) return;

      setStep("completed");
      toast.success("Review generated & citations verified!", {
        description: "Redirecting to your diagnostic report...",
      });

      // 4. Success callback / navigation
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (!isMountedRef.current) return;

      onSuccess?.(currentReceiptId);
    } catch (err: unknown) {
      if (!isMountedRef.current) return;
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "An unexpected error occurred during checkout";

      setErrorMessage(message);
      setStep("intake");
      toast.error("Checkout Failed", {
        description: message,
      });
    }
  }, [packSlug, guestEmail, guestPhone, rawText, priceKes, onSuccess]);

  return {
    guestEmail,
    setGuestEmail,
    guestPhone,
    setGuestPhone,
    rawText,
    setRawText,
    step,
    errorMessage,
    startReview,
    reset,
  };
}
