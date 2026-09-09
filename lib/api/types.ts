import { ReviewResult, PaymentTransaction, ExpertPack, PackVersion } from "@/lib/types/domain";

/**
 * Data Transfer Objects (DTOs) for Client-Server API Boundaries
 */

export interface CreatePackRequest {
  title: string;
  tagline: string;
  description: string;
  priceKes: number;
  expertName: string;
  expertTitle: string;
  institution: string;
  rules: Array<{
    id?: string;
    title: string;
    category: string;
    criterion: string;
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    penaltyScore: number;
    penaltyRationale: string;
    badExample: string;
    goodExample: string;
  }>;
  accessModes: {
    privateLink: { enabled: boolean };
    marketplace: { enabled: boolean; category: string; tags: string[] };
    embedWidget: { enabled: boolean };
  };
}

export interface CreatePackResponse {
  success: boolean;
  pack: ExpertPack;
  version: PackVersion;
  links: {
    privateLink: string;
    marketplace: string;
    embedWidget: string;
  };
}

export interface InitiateCheckoutRequest {
  packSlug: string;
  guestEmail: string;
  guestPhone: string;
  filename: string;
  rawText: string;
}

export interface InitiateCheckoutResponse {
  success: boolean;
  receiptId: string;
  checkoutRequestId: string;
  customerMessage: string;
  amountKes: number;
  phone: string;
}

export interface PaymentStatusResponse {
  verified: boolean;
  status: string;
  payment: PaymentTransaction | null;
  message: string;
}

export interface ProcessReviewRequest {
  receiptId: string;
}

export interface ProcessReviewResponse {
  success: boolean;
  review: ReviewResult;
  reportUrl: string;
}

export interface ReviewReportResponse {
  review: ReviewResult;
  payment: PaymentTransaction;
  packVersion: {
    id: string;
    version: string;
    rules: Array<{ id: string; title: string }>;
  };
}

export interface GauntletStepResult {
  step: number;
  name: string;
  status: "PASS" | "FAIL";
  details: string;
  durationMs: number;
}

export interface GauntletRunResult {
  success: boolean;
  totalDurationMs: number;
  receiptId?: string;
  reportId?: string;
  overallScore: number;
  steps: GauntletStepResult[];
  auditTrace?: any;
  error?: string;
}

export interface ApiErrorResponse {
  error: string;
  details?: unknown;
}
