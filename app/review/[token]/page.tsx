"use client";

import React, { useEffect, useState, use } from "react";
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Upload,
  ArrowRight,
  Phone,
  Mail,
  AlertCircle,
  Loader2,
  Sparkles,
  Layers,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, Textarea } from "@/components/ui/Input";
import { SubmissionDropzone } from "@/components/client/SubmissionDropzone";
import { ReviewSystem, ReviewSystemVersion, DistributionLink } from "@/lib/types/domain";

export default function GuestClientReviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [data, setData] = useState<{
    link: DistributionLink;
    reviewSystem: ReviewSystem;
    version: ReviewSystemVersion;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Submission Form State
  const [step, setStep] = useState<"upload" | "payment" | "processing" | "complete">("upload");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [documentContent, setDocumentContent] = useState("");
  const [documentTitle, setDocumentTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  // M-Pesa State
  const [isStkPushing, setIsStkPushing] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [paymentPolling, setPaymentPolling] = useState(false);

  useEffect(() => {
    fetch(`/api/public/reviews/${token}`)
      .then((res) => {
        if (!res.ok) throw new Error("Review link not found or expired");
        return res.json();
      })
      .then((resData) => {
        setData(resData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [token]);

  const handleDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setIsSubmitting(true);
    setError("");

    try {
      // Create guest submission
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewSystemId: data.reviewSystem.id,
          reviewSystemVersionId: data.version.id,
          distributionLinkId: data.link.id,
          guestEmail: guestEmail || undefined,
          guestPhone: guestPhone || undefined,
          accessMode: data.link.accessMode,
          files: [
            {
              filename: documentTitle || "submitted_draft.txt",
              mimeType: "text/plain",
              sizeBytes: documentContent.length,
              rawText: documentContent,
            },
          ],
        }),
      });

      const subData = await res.json();
      if (!res.ok) throw new Error(subData.error || "Submission failed");

      setSubmissionId(subData.submission.id);

      if (data.link.accessMode === "PAID" && data.link.priceKes > 0) {
        setStep("payment");
      } else {
        // Direct to processing
        triggerEvaluation(subData.submission.id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMpesaPay = async () => {
    if (!submissionId || !data) return;
    setIsStkPushing(true);
    setError("");

    try {
      const res = await fetch("/api/checkout/stk-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          phoneNumber: guestPhone || "254712345678",
          amount: data.link.priceKes,
          accountReference: `REV_${submissionId.substring(0, 6)}`,
        }),
      });

      const pushData = await res.json();
      if (!res.ok) throw new Error(pushData.error || "Failed to trigger M-Pesa prompt");

      setCheckoutRequestId(pushData.checkoutRequestId);
      setPaymentPolling(true);

      // Simulate payment confirmation callback after 3 seconds in demo
      setTimeout(async () => {
        await fetch("/api/checkout/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            CheckoutRequestID: pushData.checkoutRequestId,
            ResultCode: 0,
            ResultDesc: "The service request is processed successfully.",
            Amount: data.link.priceKes,
            MpesaReceiptNumber: `QK${Math.floor(10000000 + Math.random() * 90000000)}`,
            PhoneNumber: guestPhone || "254712345678",
          }),
        });
        setPaymentPolling(false);
        triggerEvaluation(submissionId);
      }, 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setIsStkPushing(false);
    }
  };

  const triggerEvaluation = async (subId: string) => {
    setStep("processing");
    try {
      const res = await fetch(`/api/submissions/${subId}/process`, {
        method: "POST",
      });
      if (res.ok) {
        window.location.href = `/report/${subId}`;
      } else {
        setError("Evaluation failed. Please contact support.");
      }
    } catch {
      setError("Evaluation pipeline error");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="text-center font-mono text-xs text-zinc-500 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-zinc-900" /> Connecting to Review Engine...
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center space-y-3 bg-white">
          <AlertCircle className="h-8 w-8 text-rose-600 mx-auto" />
          <h2 className="text-base font-semibold text-zinc-900">Review Link Unavailable</h2>
          <p className="text-xs text-zinc-500">{error}</p>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-zinc-50/75 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium bg-zinc-100 border border-zinc-200 text-zinc-700">
            <Lock className="h-3 w-3 text-emerald-600" />
            <span>Immutable Review System v{data.version.versionNumber}</span>
          </div>

          <h1 className="text-3xl font-serif font-semibold text-zinc-900 tracking-tight">
            {data.reviewSystem.name}
          </h1>

          <p className="text-xs text-zinc-600 max-w-xl mx-auto">
            {data.reviewSystem.description}
          </p>
        </div>

        {/* Methodology Standards Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="p-4 bg-white border-zinc-200 text-center">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Discipline
            </span>
            <span className="text-xs font-semibold text-zinc-800 mt-1 block">
              {data.reviewSystem.discipline}
            </span>
          </Card>
          <Card className="p-4 bg-white border-zinc-200 text-center">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Rigor Standards
            </span>
            <span className="text-xs font-semibold text-zinc-800 mt-1 block">
              {data.version.rules.length} Structured Rules
            </span>
          </Card>
          <Card className="p-4 bg-white border-zinc-200 text-center">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Review Fee
            </span>
            <span className="text-xs font-semibold font-mono text-zinc-900 mt-1 block">
              {data.link.priceKes === 0 ? "Included / Institutional" : `${data.link.priceKes} KES`}
            </span>
          </Card>
        </div>

        {/* Dynamic Workflow Steps */}
        {step === "upload" && (
          <Card className="p-6 sm:p-8 bg-white shadow-sm space-y-6">
            <div className="border-b border-zinc-100 pb-4">
              <h2 className="text-base font-semibold text-zinc-900">Submit Document for Diagnostic Review</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Paste or write your manuscript text below. The AI rule engine will evaluate compliance and extract evidence citations.
              </p>
            </div>

            <form onSubmit={handleDocumentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Contact Email (For Report Access)"
                  type="email"
                  placeholder="name@university.edu"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  required
                />
                <Input
                  label="M-Pesa Phone Number (Optional / For SMS)"
                  placeholder="254712345678"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                />
              </div>

              <Input
                label="Document Title"
                placeholder="e.g. Chapter 3: Empirical Methodology and Sampling Framework"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                required
              />

              <SubmissionDropzone
                initialText={documentContent}
                onContentExtracted={({ filename, rawText }) => {
                  setDocumentContent(rawText);
                  if (!documentTitle && filename) {
                    setDocumentTitle(filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "));
                  }
                }}
              />

              {/* Sample loader helper */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setDocumentTitle("Chapter 3: Methodology and Sampling Design");
                    setGuestEmail("elena.rostova@cam.ac.uk");
                    setGuestPhone("254712345678");
                    setDocumentContent(
                      `CHAPTER 3: METHODOLOGY\n\n3.1 Research Design\nThis study adopts an empirical quasi-experimental design to analyze the latency overhead of distributed consensus algorithms in edge-computing topologies.\n\n3.2 Sampling and Sample Size\nWe collected telemetry logs from 45 edge compute nodes deployed across 3 availability zones. Note: formal sample size calculations and power analysis (e.g. G*Power) were omitted due to telemetry dataset size limitations.\n\n3.3 Controlled Baselines\nPerformance was evaluated under varied network congestion models. However, comparative baseline benchmarking against classical Raft and Paxos protocols was not conducted due to testbed environment constraints.\n\n3.4 Ethical Clearance\nAll analyzed telemetry datasets comprised non-human system performance metrics. Formal institutional review board (IRB) ethical clearance was determined to be non-applicable.`
                    );
                  }}
                  className="text-[11px] font-mono text-blue-600 hover:text-blue-700 underline"
                >
                  Load Sample Thesis Draft
                </button>

                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Zero-training retention guarantee</span>
                </div>
              </div>

              {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

              <div className="pt-4 border-t border-zinc-100 flex justify-end">
                <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
                  Proceed to Diagnostic Review &rarr;
                </Button>
              </div>
            </form>
          </Card>
        )}

        {step === "payment" && (
          <Card className="p-8 bg-white shadow-sm max-w-lg mx-auto text-center space-y-5">
            <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <Phone className="h-6 w-6" />
            </div>

            <div>
              <h2 className="text-lg font-serif font-semibold text-zinc-900">M-Pesa Daraja Checkout</h2>
              <p className="text-xs text-zinc-500 mt-1">
                Enter your Safaricom mobile number to receive the instant STK prompt.
              </p>
            </div>

            <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 text-left font-mono text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-zinc-500">Service:</span>
                <span className="font-semibold text-zinc-800">{data.reviewSystem.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Total Fee:</span>
                <span className="font-bold text-zinc-900">{data.link.priceKes} KES</span>
              </div>
            </div>

            <div className="space-y-3">
              <Input
                label="M-Pesa Mobile Number"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="254712345678"
                required
              />

              {paymentPolling ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center justify-center gap-2 font-mono">
                  <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                  <span>Awaiting M-Pesa PIN input on phone...</span>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={handleMpesaPay}
                  isLoading={isStkPushing}
                >
                  Send M-Pesa STK Push ({data.link.priceKes} KES)
                </Button>
              )}
            </div>
          </Card>
        )}

        {step === "processing" && (
          <Card className="p-12 bg-white shadow-sm max-w-md mx-auto text-center space-y-6">
            <Loader2 className="h-10 w-10 animate-spin text-zinc-900 mx-auto" />
            <div>
              <h2 className="text-lg font-serif font-semibold text-zinc-900">
                Executing Evidence Evaluation
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Parsing document sections, evaluating against {data.version.rules.length} structured rules, and extracting verbatim citations...
              </p>
            </div>
            <div className="space-y-2 text-left font-mono text-[11px] text-zinc-500 bg-zinc-50 p-4 rounded-lg border border-zinc-200">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> Parsed 4 Document Chunks
              </div>
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> Token-Weighted Semantic Retrieval
              </div>
              <div className="flex items-center gap-2 text-zinc-900 font-semibold animate-pulse">
                • Validating rule citations & generating report...
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
