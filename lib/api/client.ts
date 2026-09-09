import {
  CreatePackRequest,
  CreatePackResponse,
  InitiateCheckoutRequest,
  InitiateCheckoutResponse,
  PaymentStatusResponse,
  ProcessReviewRequest,
  ProcessReviewResponse,
  ReviewReportResponse,
  GauntletRunResult,
} from "./types";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = typeof data?.error === "string" ? data.error : "Request failed";
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

export const apiClient = {
  checkout: {
    initiate(payload: InitiateCheckoutRequest): Promise<InitiateCheckoutResponse> {
      return request<InitiateCheckoutResponse>("/api/checkout/stk-push", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },

    checkStatus(receiptId: string, simulate = false): Promise<PaymentStatusResponse> {
      const query = simulate ? "?simulate=true" : "";
      return request<PaymentStatusResponse>(`/api/checkout/status/${encodeURIComponent(receiptId)}${query}`);
    },
  },

  reviews: {
    process(payload: ProcessReviewRequest): Promise<ProcessReviewResponse> {
      return request<ProcessReviewResponse>("/api/reviews/process", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },

    getReport(receiptId: string, signal?: AbortSignal): Promise<ReviewReportResponse> {
      return request<ReviewReportResponse>(`/api/reviews/${encodeURIComponent(receiptId)}`, {
        signal,
      });
    },
  },

  gauntlet: {
    run(): Promise<GauntletRunResult> {
      return request<GauntletRunResult>("/api/gauntlet/run", {
        method: "POST",
      });
    },
  },

  packs: {
    create(payload: CreatePackRequest): Promise<CreatePackResponse> {
      return request<CreatePackResponse>("/api/packs/create", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  },
} as const;
