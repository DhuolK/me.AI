import { useState, useEffect } from "react";
import { ReviewResult, PaymentTransaction } from "@/lib/types/domain";
import { apiClient, ApiError } from "@/lib/api/client";

interface UseReviewReportResult {
  review: ReviewResult | null;
  payment: PaymentTransaction | null;
  loading: boolean;
  error: string | null;
}

export function useReviewReport(receiptId: string | undefined): UseReviewReportResult {
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [payment, setPayment] = useState<PaymentTransaction | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!receiptId) return;

    const id = receiptId;
    const controller = new AbortController();

    async function fetchReport() {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.reviews.getReport(id, controller.signal);
        setReview(data.review);
        setPayment(data.payment);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
            ? err.message
            : "Failed to load review report";

        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchReport();

    return () => {
      controller.abort();
    };
  }, [receiptId]);

  return { review, payment, loading, error };
}
