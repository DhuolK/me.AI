"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, CheckCircle2 } from "lucide-react";

interface HeroProps {
  onOpenCheckout?: () => void;
}

export default function Hero({ onOpenCheckout }: HeroProps) {
  return (
    <section className="relative pt-16 pb-20 px-6 max-w-[1432px] mx-auto overflow-hidden">
      {/* Decorative Gradient Atmospheric Wash */}
      <div className="absolute top-10 right-10 w-[550px] h-[550px] gradient-blob-coral-sky pointer-events-none -z-10 opacity-70" />
      <div className="absolute bottom-10 left-10 w-[450px] h-[450px] gradient-blob-sky-mint pointer-events-none -z-10 opacity-60" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Column: Pure Typographic Headline Stack */}
        <div className="lg:col-span-7 text-left">
          <div className="inline-flex items-center gap-2 tag-pill bg-periwinkle-mist/50 border-ash text-lake-blue mb-6">
            <Sparkles className="w-3.5 h-3.5 text-lake-blue" />
            <span className="font-mono text-xs uppercase font-medium">
              Rent an expert's brain at midnight
            </span>
          </div>

          <h1 className="font-serif text-5xl sm:text-6xl lg:text-[clamp(2.5rem,5vw,4rem)] leading-[1.08] text-off-black tracking-tight mb-8">
            Instant, high-rigor reviews grounded in <span className="italic text-lake-blue font-normal">expert rubrics</span>.
          </h1>

          <p className="font-mono text-graphite text-base sm:text-lg leading-relaxed max-w-2xl mb-10 tracking-tight">
            Lecturers, lawyers, and industry leaders publish their proprietary grading criteria once.
            Submit your draft at 2:00 AM, verify via M-Pesa, and receive an audit citing exact rules—with zero hallucinated feedback.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onOpenCheckout}
              className="btn-pill btn-accent text-sm py-4 px-8 shadow-sm group"
            >
              <span>Review My Draft</span>
              <span className="btn-glyph-shift font-serif ml-1">▸</span>
            </button>
            <Link
              href="/market"
              className="btn-pill btn-ghost text-sm py-4 px-8 group"
            >
              <span>Browse Marketplace</span>
              <span className="btn-glyph-shift ml-1">→</span>
            </Link>
          </div>

          {/* Social Proof & Value Stats */}
          <div className="grid grid-cols-3 gap-6 mt-14 pt-8 border-t border-ash max-w-xl">
            <div>
              <div className="font-serif text-3xl sm:text-4xl text-off-black mb-1">
                100%
              </div>
              <div className="font-mono text-[11px] sm:text-xs text-smoke uppercase tracking-tightest">
                Exact Rule Citations
              </div>
            </div>
            <div>
              <div className="font-serif text-3xl sm:text-4xl text-off-black mb-1">
                &lt; 3.0s
              </div>
              <div className="font-mono text-[11px] sm:text-xs text-smoke uppercase tracking-tightest">
                Audit Turnaround
              </div>
            </div>
            <div>
              <div className="font-serif text-3xl sm:text-4xl text-off-black mb-1">
                0 Auth
              </div>
              <div className="font-mono text-[11px] sm:text-xs text-smoke uppercase tracking-tightest">
                Frictionless Guest Pay
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Warm-Parchment Seed-Pack Card */}
        <div className="lg:col-span-5">
          <div className="card-monad bg-white border border-ash rounded-[40px] p-8 sm:p-10 relative hover:border-lake-blue/60 transition-all shadow-[0_0_10px_0_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between pb-4 border-b border-ash mb-6">
              <span className="tag-pill bg-mint/30 text-off-black font-medium text-[11px]">
                FEATURED SEED PACK
              </span>
              <span className="font-mono text-xs text-off-black font-medium">
                500 KES · ~$3.80
              </span>
            </div>

            <div className="mb-6">
              <span className="font-mono text-xs uppercase tracking-wider text-lake-blue block mb-1">
                Academic &amp; Thesis Diagnostic
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-off-black leading-snug mb-2">
                Chapter 1–3 Thesis Rigor &amp; Methodology Audit
              </h3>
              <p className="font-mono text-xs text-graphite">
                Authored by Dr. Aris Thorne · Faculty of Graduate Studies
              </p>
            </div>

            {/* Seed Pack Rubrics */}
            <div className="space-y-3 font-mono text-xs mb-8 bg-parchment p-5 rounded-[24px] border border-ash">
              <div className="text-[11px] uppercase tracking-tightest text-smoke font-medium">
                Active Audit Rubrics:
              </div>
              <div className="flex items-start gap-2.5 text-off-black">
                <span className="w-1.5 h-1.5 rounded-full bg-lake-blue mt-1.5 shrink-0" />
                <span>Problem Statement Empirical Bound &amp; Scope Rigor</span>
              </div>
              <div className="flex items-start gap-2.5 text-off-black">
                <span className="w-1.5 h-1.5 rounded-full bg-lake-blue mt-1.5 shrink-0" />
                <span>SOTA Baseline Comparative Metric Justification</span>
              </div>
              <div className="flex items-start gap-2.5 text-off-black">
                <span className="w-1.5 h-1.5 rounded-full bg-lake-blue mt-1.5 shrink-0" />
                <span>Causal Overreach &amp; Statistical Overclaiming Check</span>
              </div>
            </div>

            <button
              onClick={onOpenCheckout}
              className="w-full btn-pill btn-primary py-3.5 text-xs justify-center group"
            >
              <span>Upload Draft to Pack</span>
              <span className="btn-glyph-shift ml-1">▸</span>
            </button>
            <div className="mt-3 text-center">
              <span className="font-mono text-[11px] text-smoke">
                Encrypted · Zero AI Training On Your Work · Instant Receipt
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
