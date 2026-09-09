"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, Search } from "lucide-react";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("me.AI Uncaught Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-parchment text-off-black flex items-center justify-center p-6 font-mono selection:bg-periwinkle-mist">
      <div className="card-monad max-w-lg w-full bg-white text-center shadow-xl p-10 border border-ash">
        <div className="w-14 h-14 rounded-full bg-coral/20 border border-coral/30 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-6 h-6 text-coral" />
        </div>

        <span className="tag-pill bg-coral/15 text-off-black text-[11px] mb-3">
          RUNTIME DIAGNOSTIC ERROR
        </span>

        <h1 className="font-serif text-3xl text-off-black mb-3">
          Something unexpected happened.
        </h1>

        <p className="font-mono text-xs text-graphite leading-relaxed mb-6">
          {error.message || "An unhandled runtime exception occurred while processing this review transaction."}
        </p>

        {error.digest && (
          <div className="p-3 bg-parchment rounded-[12px] border border-ash text-[11px] text-smoke mb-6 break-all">
            Digest Code: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="btn-pill btn-accent text-xs py-3 px-6 w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
          <Link
            href="/market"
            className="btn-pill btn-ghost text-xs py-3 px-6 w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Browse Packs</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
