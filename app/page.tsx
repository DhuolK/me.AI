import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  Layers,
  FileCheck,
  CheckCircle2,
  Users,
  CreditCard,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { InteractiveMethodologyPreview } from "@/components/landing/InteractiveMethodologyPreview";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-zinc-900 flex flex-col justify-between selection:bg-zinc-900 selection:text-white">
      {/* Editorial Navigation */}
      <header className="border-b border-zinc-200/80 bg-white/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-zinc-900 text-white font-mono font-bold text-xs flex items-center justify-center">
              me
            </div>
            <span className="font-semibold text-lg tracking-tight">me.AI</span>
            <span className="text-[10px] font-mono text-zinc-500 uppercase px-1.5 py-0.5 rounded border border-zinc-200">
              Review Infrastructure
            </span>
          </Link>

          <div className="flex items-center gap-6 text-xs font-medium text-zinc-600">
            <Link href="#architecture" className="hover:text-zinc-900 hidden sm:block">
              Architecture
            </Link>
            <Link href="#use-cases" className="hover:text-zinc-900 hidden sm:block">
              Disciplines
            </Link>
            <Link href="/pricing" className="hover:text-zinc-900 hidden sm:block">
              Pricing
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm" className="text-xs">
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="primary" size="sm" className="text-xs">
                Studio Dashboard &rarr;
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 sm:py-28 px-6 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-white border border-zinc-200 text-zinc-700 shadow-sm">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Evidence-Grounded Review Systems • Zero-Training Guarantee</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-serif font-medium tracking-tight text-zinc-950 leading-[1.15] text-balance">
          Turn your recurring review methodology into immutable AI infrastructure.
        </h1>

        <p className="text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto font-sans leading-relaxed text-balance">
          Not a chatbot or generic prompt. Encode your evaluation rules once, distribute private or client-paid review links, and provide evidence-backed reports with human supervisory override.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/dashboard/review-systems/new">
            <Button variant="primary" size="lg" className="text-sm px-6">
              Create Review System
            </Button>
          </Link>
          <Link href="/review/thorne-phd-review-2026">
            <Button variant="outline" size="lg" className="text-sm px-6 bg-white">
              Try Live Review Demo &rarr;
            </Button>
          </Link>
        </div>
      </section>

      {/* Interactive Methodology & Rigor Previewer */}
      <section className="px-6 pb-20 max-w-6xl mx-auto w-full space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 px-1">
          <div>
            <span className="text-[11px] font-mono font-semibold text-zinc-500 uppercase tracking-wider block">
              Live Methodology Playground
            </span>
            <h2 className="text-2xl font-serif font-semibold text-zinc-900 mt-0.5">
              Experience Evidence-Grounded Review
            </h2>
          </div>
          <p className="text-xs text-zinc-500 max-w-md sm:text-right">
            Select a profession below to see how structured rules extract verbatim citations and enforce compliance standards.
          </p>
        </div>

        <InteractiveMethodologyPreview />
      </section>

      {/* The 6-Step Closed Loop Workflow */}
      <section id="architecture" className="py-16 bg-white border-y border-zinc-200 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-serif font-medium text-zinc-900">
              The Closed-Loop Evaluation Pipeline
            </h2>
            <p className="text-xs text-zinc-500">
              Deterministic rigor from rule definition to client resubmission.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-[#faf9f6] space-y-3 border-zinc-200/80">
              <div className="h-8 w-8 rounded bg-zinc-900 text-white font-mono text-xs flex items-center justify-center font-bold">
                01
              </div>
              <h3 className="text-sm font-semibold text-zinc-900">Structured Rule Authoring</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Define exact requirements, severity grades, applicable sections, and actionable recommendations in the Studio.
              </p>
            </Card>

            <Card className="p-6 bg-[#faf9f6] space-y-3 border-zinc-200/80">
              <div className="h-8 w-8 rounded bg-zinc-900 text-white font-mono text-xs flex items-center justify-center font-bold">
                02
              </div>
              <h3 className="text-sm font-semibold text-zinc-900">Immutable Version Locking</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Publish versioned releases. Once locked, rules cannot drift, ensuring equitable evaluation across student or client cohorts.
              </p>
            </Card>

            <Card className="p-6 bg-[#faf9f6] space-y-3 border-zinc-200/80">
              <div className="h-8 w-8 rounded bg-zinc-900 text-white font-mono text-xs flex items-center justify-center font-bold">
                03
              </div>
              <h3 className="text-sm font-semibold text-zinc-900">Guest-First Distribution</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Share private, cohort, or M-Pesa client-paid review links. Clients submit drafts without forced account creation.
              </p>
            </Card>

            <Card className="p-6 bg-[#faf9f6] space-y-3 border-zinc-200/80">
              <div className="h-8 w-8 rounded bg-zinc-900 text-white font-mono text-xs flex items-center justify-center font-bold">
                04
              </div>
              <h3 className="text-sm font-semibold text-zinc-900">Evidence Citation Extraction</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Every diagnostic finding links to a verified, verbatim manuscript quote with chunk location references.
              </p>
            </Card>

            <Card className="p-6 bg-[#faf9f6] space-y-3 border-zinc-200/80">
              <div className="h-8 w-8 rounded bg-zinc-900 text-white font-mono text-xs flex items-center justify-center font-bold">
                05
              </div>
              <h3 className="text-sm font-semibold text-zinc-900">Professional Supervisory Override</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Experts review automated reports, accept/reject findings, and log immutable reviewer notes for client assurance.
              </p>
            </Card>

            <Card className="p-6 bg-[#faf9f6] space-y-3 border-zinc-200/80">
              <div className="h-8 w-8 rounded bg-zinc-900 text-white font-mono text-xs flex items-center justify-center font-bold">
                06
              </div>
              <h3 className="text-sm font-semibold text-zinc-900">Resubmission Delta Tracking</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Clients submit revised drafts. The engine tracks score progression, resolved defects, and remaining gaps.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Target Disciplines Section */}
      <section id="use-cases" className="py-20 px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-serif font-medium text-zinc-900">
            Built for Rigorous Evaluative Professions
          </h2>
          <p className="text-xs text-zinc-500">
            Engineered for high-consequence domains where precision beats conversational summaries.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="p-5 bg-white space-y-3">
            <span className="text-[10px] font-mono uppercase bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded border border-zinc-200 inline-block">
              Academia
            </span>
            <h3 className="text-base font-semibold text-zinc-900">Doctoral & Graduate Theses</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Enforce sample power calculations, literature framework contrasting, and baseline comparators across student research cohorts.
            </p>
          </Card>

          <Card className="p-5 bg-white space-y-3">
            <span className="text-[10px] font-mono uppercase bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded border border-zinc-200 inline-block">
              Legal
            </span>
            <h3 className="text-base font-semibold text-zinc-900">Commercial Lease & Contracts</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Scan agreements for uncapped indemnity triggers, unilateral termination clauses, and non-standard dispute jurisdiction.
            </p>
          </Card>

          <Card className="p-5 bg-white space-y-3">
            <span className="text-[10px] font-mono uppercase bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded border border-zinc-200 inline-block">
              Clinical
            </span>
            <h3 className="text-base font-semibold text-zinc-900">Clinical Protocol Validation</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Audit trial protocols for mandatory adverse event escalations, patient consent safeguards, and dosage titration bounds.
            </p>
          </Card>

          <Card className="p-5 bg-white space-y-3">
            <span className="text-[10px] font-mono uppercase bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded border border-zinc-200 inline-block">
              Governance
            </span>
            <h3 className="text-base font-semibold text-zinc-900">Grant & Policy RFP Review</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Ensure compliance with multilateral donor mandates, budget justification norms, and impact milestone verifiability.
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-8 px-6 text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-zinc-900 text-white font-mono text-[10px] flex items-center justify-center font-bold">
              me
            </div>
            <span className="font-semibold text-zinc-900">me.AI Professional Infrastructure</span>
          </div>
          <div className="flex items-center gap-6 font-mono text-[11px]">
            <span>Zero-Training Data Policy</span>
            <span>ACID File Locks</span>
            <span>M-Pesa Daraja Integration</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
