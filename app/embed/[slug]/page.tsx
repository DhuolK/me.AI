"use client";

import { useState } from "react";
import GuestCheckoutModal from "@/components/demand/GuestCheckoutModal";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

export default function EmbedWidgetPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-4 bg-parchment min-h-screen flex items-center justify-center font-mono">
      <div className="bg-white border border-ash rounded-card p-6 max-w-sm w-full shadow-sm text-left">
        <div className="flex items-center justify-between mb-3">
          <span className="tag-pill bg-periwinkle-mist/40 text-lake-blue text-[11px]">
            POWERED BY me.AI
          </span>
          <span className="text-[11px] text-smoke">500 KES</span>
        </div>

        <h3 className="font-serif text-xl text-off-black mb-1">
          Thesis Review Pre-Check
        </h3>
        <p className="text-[11px] text-graphite mb-4">
          By Dr. Aris Thorne · Instant AI review on exact grading rubrics.
        </p>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full btn-pill btn-accent py-2.5 text-xs justify-center gap-2"
        >
          <span>Upload Draft for Review</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <GuestCheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
