"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import GuestCheckoutModal from "@/components/demand/GuestCheckoutModal";
import { Lock, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";

export default function PrivatePackPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accessPin, setAccessPin] = useState("");
  const [isPinUnlocked, setIsPinUnlocked] = useState(false);
  const [pinError, setPinError] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessPin.trim().toUpperCase() === "THORNE2026" || accessPin.trim() === "") {
      setIsPinUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  return (
    <div className="min-h-screen bg-parchment text-off-black">
      <AnnouncementBar />
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex items-center gap-2 mb-4">
          <span className="tag-pill bg-white text-lake-blue font-bold">
            MODE 1 · PRIVATE CLASSROOM LINK
          </span>
          <span className="tag-pill bg-parchment text-smoke">INVITE-ONLY</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl text-off-black mb-4">
          Academic Thesis Chapter 1–3 Diagnostic
        </h1>
        <p className="font-mono text-graphite text-sm sm:text-base mb-8">
          Authored by <strong>Dr. Aris Thorne</strong> (Faculty of Graduate Studies) for enrolled postgraduate researchers.
        </p>

        {!isPinUnlocked ? (
          <div className="card-monad max-w-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-5 h-5 text-lake-blue" />
              <h3 className="font-serif text-2xl text-off-black">Enter Class PIN</h3>
            </div>
            <p className="font-mono text-xs text-graphite mb-6">
              Dr. Thorne has protected this Pack with a classroom passkey. (Default: <code>THORNE2026</code>)
            </p>

            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={accessPin}
                  onChange={(e) => setAccessPin(e.target.value)}
                  placeholder="e.g. THORNE2026"
                  className="w-full border border-ash rounded-pill px-4 py-2.5 bg-parchment text-off-black font-mono text-xs focus:outline-none uppercase"
                />
                {pinError && (
                  <p className="font-mono text-xs text-coral mt-2">
                    Invalid PIN. Check your course syllabus or class WhatsApp group.
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full btn-pill btn-primary text-xs py-3 justify-center"
              >
                Unlock Pack
              </button>
            </form>
          </div>
        ) : (
          <div className="card-monad space-y-6">
            <div className="flex items-center gap-2 text-lake-blue font-mono text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>ACCESS GRANTED: CLASSROOM LANE UNLOCKED</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-ash font-mono text-xs">
              <div className="bg-parchment p-4 rounded-inner border border-ash">
                <div className="text-smoke mb-1">PACK VERSION</div>
                <div className="font-bold text-off-black">pack_thesis_thorne_v1_0_0 (Immutable)</div>
              </div>
              <div className="bg-parchment p-4 rounded-inner border border-ash">
                <div className="text-smoke mb-1">STUDENT RATE</div>
                <div className="font-bold text-off-black">500 KES (Guest M-Pesa STK)</div>
              </div>
            </div>

            <p className="font-mono text-xs text-graphite leading-relaxed">
              Upload your thesis draft below. The AI will evaluate your work against Dr. Thorne's 5 exact rules: Problem Statement Fluff, Baseline Methodology Rigor, Literature Review Lineage, Orphan Tables, and Causal Overreach.
            </p>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full btn-pill btn-accent text-sm py-3.5 justify-center"
            >
              Upload Chapter 1–3 Draft &amp; Start Review
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      <GuestCheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        packSlug="dr-thorne-thesis"
        packTitle="Academic Thesis Chapter 1–3 Diagnostic (Private Link)"
      />
    </div>
  );
}
