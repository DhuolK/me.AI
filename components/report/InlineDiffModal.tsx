"use client";

import { X, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";

interface InlineDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
  proposedRewrite: string;
  ruleTitle: string;
}

export default function InlineDiffModal({
  isOpen,
  onClose,
  originalText,
  proposedRewrite,
  ruleTitle,
}: InlineDiffModalProps) {
  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(proposedRewrite);
    toast.success("Exemplar rewrite copied to clipboard", {
      description: "You can paste this directly into your draft document.",
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm modal-overlay-enter"
      onClick={onClose}
    >
      <div
        className="bg-white border border-ash rounded-[32px] max-w-3xl w-full p-8 relative shadow-2xl font-mono text-xs modal-card-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-full border border-ash flex items-center justify-center text-graphite hover:bg-parchment transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-lake-blue" />
          <span className="tag-pill bg-periwinkle-mist/40 text-lake-blue">
            EXPERT REDLINE VORSCHLAG
          </span>
        </div>

        <h2 className="font-serif text-2xl text-off-black mb-1">
          Targeted Rewrite: {ruleTitle}
        </h2>
        <p className="text-graphite mb-6">
          Compare your original draft with the recommended reformulation adhering strictly to the expert's good exemplar style.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {/* Original Draft */}
          <div className="p-4 rounded-[20px] bg-coral/10 border border-coral/30 space-y-2">
            <div className="text-coral font-bold text-[11px] uppercase tracking-tightest">
              Original Draft (Violating Rule)
            </div>
            <p className="text-off-black leading-relaxed">
              {originalText}
            </p>
          </div>

          {/* Expert Rewrite */}
          <div className="p-4 rounded-[20px] bg-mint/20 border border-mint/40 space-y-2">
            <div className="text-emerald-800 font-bold text-[11px] uppercase tracking-tightest">
              Expert Exemplar Reformulation
            </div>
            <p className="text-off-black leading-relaxed">
              {proposedRewrite}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="btn-pill btn-ghost text-xs py-2.5 px-5"
          >
            Close Diff
          </button>
          <button
            onClick={handleCopy}
            className="btn-pill btn-primary text-xs py-2.5 px-6 flex items-center gap-2"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Copy Reformulation</span>
          </button>
        </div>
      </div>
    </div>
  );
}
