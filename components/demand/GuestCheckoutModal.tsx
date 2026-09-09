"use client";

import { useRouter } from "next/navigation";
import { X, Phone, Mail, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { formatKes } from "@/lib/utils/currency";
import { useCheckoutFlow } from "@/lib/hooks/useCheckoutFlow";

interface GuestCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  packSlug?: string;
  packTitle?: string;
  priceKes?: number;
}

const SAMPLE_THESIS_TEXT = `Chapter 1: Introduction and Problem Formulation
Vector indexing and nearest-neighbor retrieval systems have become increasingly critical in modern information retrieval. Traditional keyword-based retrieval pipelines struggle with semantic drift and synonymy. Although dense embeddings provide rich semantic representations, scaling these approaches across multi-terabyte corpora remains challenging.

Chapter 2: Literature Review
Vaswani et al. (2017) introduced the transformer architecture, which revolutionized sequence modeling. Devlin et al. (2018) followed with BERT, enabling bidirectional contextual embeddings. In recent years, HNSW and ScaNN have emerged as the industry standard for vector search.

Chapter 3: Methodology and Experimental Evaluation
We developed a custom vector quantization layer designed to compress high-dimensional embeddings before graph insertion. We tested our implementation on several sample document collections. The experimental results clearly prove that our method is the best solution for all enterprise retrieval tasks, delivering flawless recall under heavy concurrent query loads.`;

export default function GuestCheckoutModal({
  isOpen,
  onClose,
  packSlug = "dr-thorne-thesis",
  packTitle = "Academic Thesis Chapter 1–3 Diagnostic",
  priceKes = 500,
}: GuestCheckoutModalProps) {
  const router = useRouter();

  const {
    guestEmail,
    setGuestEmail,
    guestPhone,
    setGuestPhone,
    rawText,
    setRawText,
    step,
    errorMessage,
    startReview,
  } = useCheckoutFlow({
    packSlug,
    priceKes,
    initialText: SAMPLE_THESIS_TEXT,
    onSuccess: (receiptId) => {
      router.push(`/r/${receiptId}`);
      onClose();
    },
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm modal-overlay-enter"
      onClick={onClose}
    >
      <div
        className="bg-white border border-ash rounded-card max-w-2xl w-full p-8 relative shadow-2xl modal-card-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-6 right-6 w-10 h-10 rounded-full border border-ash flex items-center justify-center text-graphite hover:bg-parchment transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {step === "intake" && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="tag-pill bg-periwinkle-mist/40 text-lake-blue text-[11px]">
                GUEST CHECKOUT — ZERO SIGNUP WALL
              </span>
            </div>

            <h2 className="font-serif text-3xl text-off-black mb-2">{packTitle}</h2>
            <p className="font-mono text-sm text-graphite mb-6">
              Review fee: <strong>{formatKes(priceKes)}</strong> via Daraja M-Pesa STK Push
            </p>

            {errorMessage && (
              <div className="mb-4 p-4 rounded-inner bg-coral/15 border border-coral text-off-black font-mono text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-coral shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-graphite mb-1.5 uppercase tracking-tightest">
                    M-Pesa Phone Number
                  </label>
                  <div className="flex items-center border border-ash rounded-pill px-4 py-2 bg-parchment focus-within:border-lake-blue transition-colors">
                    <Phone className="w-4 h-4 text-smoke mr-2 shrink-0" />
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="2547XXXXXXXX"
                      className="bg-transparent w-full focus:outline-none text-off-black font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-graphite mb-1.5 uppercase tracking-tightest">
                    Receipt Email (For Report Link)
                  </label>
                  <div className="flex items-center border border-ash rounded-pill px-4 py-2 bg-parchment focus-within:border-lake-blue transition-colors">
                    <Mail className="w-4 h-4 text-smoke mr-2 shrink-0" />
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="bg-transparent w-full focus:outline-none text-off-black font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-graphite mb-1.5 uppercase tracking-tightest">
                  Draft Document Text to Audit
                </label>
                <textarea
                  rows={8}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full border border-ash rounded-inner p-4 bg-parchment focus:border-lake-blue focus:outline-none font-mono text-xs text-off-black leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <span className="text-smoke text-[11px]">
                  🔒 Entitlement verified via Safaricom server callback
                </span>
                <button
                  onClick={startReview}
                  className="btn-pill btn-primary text-xs py-3 px-8"
                >
                  Pay {formatKes(priceKes)} &amp; Review
                </button>
              </div>
            </div>
          </div>
        )}

        {step === "stk_sent" && (
          <div className="text-center py-10 font-mono">
            <Loader2 className="w-12 h-12 text-lake-blue animate-spin mx-auto mb-4" />
            <h3 className="font-serif text-2xl text-off-black mb-2">
              Check Your Phone
            </h3>
            <p className="text-xs text-graphite max-w-sm mx-auto mb-4">
              Enter your M-Pesa PIN on the prompt sent to <strong>{guestPhone}</strong> to authorize {formatKes(priceKes)}.
            </p>
            <span className="tag-pill bg-periwinkle-mist/30 text-lake-blue text-[11px]">
              AWAITING DARAJA SERVER CALLBACK
            </span>
          </div>
        )}

        {step === "processing" && (
          <div className="text-center py-10 font-mono">
            <Loader2 className="w-12 h-12 text-lake-blue animate-spin mx-auto mb-4" />
            <h3 className="font-serif text-2xl text-off-black mb-2">
              Payment Authoritatively Verified
            </h3>
            <p className="text-xs text-graphite max-w-sm mx-auto mb-4">
              Evaluating your draft against Dr. Thorne's immutable criteria...
            </p>
            <span className="tag-pill bg-mint/30 text-off-black text-[11px]">
              EXECUTING RAG PROVENANCE ENGINE
            </span>
          </div>
        )}

        {step === "completed" && (
          <div className="text-center py-10 font-mono">
            <CheckCircle2 className="w-12 h-12 text-lake-blue mx-auto mb-4" />
            <h3 className="font-serif text-2xl text-off-black mb-2">
              Review Completed
            </h3>
            <p className="text-xs text-graphite mb-4">
              Redirecting to your diagnostic report...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
