"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Quote,
  Lock,
  ArrowRight,
  BookOpen,
  Scale,
  Stethoscope,
  Briefcase,
  Layers,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface DisciplinePreset {
  id: string;
  label: string;
  discipline: string;
  icon: React.ComponentType<{ className?: string }>;
  systemTitle: string;
  description: string;
  version: string;
  sampleRule: {
    code: string;
    title: string;
    severity: "critical" | "high" | "medium";
    requirement: string;
    verbatimCitation: string;
    diagnosticFinding: string;
    recommendation: string;
  };
  sampleExcerpt: string;
  score: number;
}

const PRESETS: DisciplinePreset[] = [
  {
    id: "academic",
    label: "Doctoral Lecturer",
    discipline: "Empirical Computer Science",
    icon: BookOpen,
    systemTitle: "Doctoral Dissertation Chapter 1–3 Diagnostic",
    description: "Methodological validity, sample size power calculations, and contrasting literature baselines.",
    version: "v1.0.0 (Immutable)",
    sampleRule: {
      code: "RULE_METH_01",
      title: "Controlled Baseline Comparator",
      severity: "critical",
      requirement: "All experimental benchmarks must be tested against at least two published industry baselines.",
      verbatimCitation: "comparative baseline benchmarking against classical Raft and Paxos protocols was not conducted due to testbed environment constraints.",
      diagnosticFinding: "The manuscript omits classical Raft and Paxos baselines, limiting generalizability of reported latency results.",
      recommendation: "Deploy standard Raft benchmark containers in local testbed to provide normalized latency comparisons.",
    },
    sampleExcerpt: `3.3 Controlled Baselines
Performance was evaluated under varied network congestion models. However, comparative baseline benchmarking against classical Raft and Paxos protocols was not conducted due to testbed environment constraints. Telemetry logs were compiled across 45 edge compute nodes.`,
    score: 68,
  },
  {
    id: "legal",
    label: "Corporate Legal Counsel",
    discipline: "Commercial Real Estate & SaaS",
    icon: Scale,
    systemTitle: "Enterprise Lease & Vendor Agreement Auditor",
    description: "Uncapped liability indemnification, unilateral break clauses, and arbitration venue alignment.",
    version: "v2.1.0 (Immutable)",
    sampleRule: {
      code: "RULE_INDEM_04",
      title: "Bilateral Liability Cap Reciprocity",
      severity: "critical",
      requirement: "Indemnification obligations must be capped at 12 months' aggregate fees paid.",
      verbatimCitation: "Vendor shall hold Client harmless from any and all claims without monetary limitation or aggregate cap.",
      diagnosticFinding: "Clause 14.2 imposes an uncapped indemnity exposure violating the standard 12-month trailing fee liability threshold.",
      recommendation: "Insert reciprocal 1x Annual Contract Value (ACV) limitation of liability carve-out.",
    },
    sampleExcerpt: `14. Indemnification & Liability
Vendor shall hold Client harmless from any and all claims without monetary limitation or aggregate cap resulting from platform downtime, service interruptions, or data transmission failures.`,
    score: 54,
  },
  {
    id: "clinical",
    label: "Principal Investigator",
    discipline: "Biomedical & Clinical Trials",
    icon: Stethoscope,
    systemTitle: "Phase II Clinical Protocol Rigor Standard",
    description: "Adverse event escalation windows, double-blind randomization protocols, and IRB ethical clearance.",
    version: "v1.4.0 (Immutable)",
    sampleRule: {
      code: "RULE_ETHIC_02",
      title: "Mandatory IRB Ethical Protocol Clearance",
      severity: "critical",
      requirement: "Institutional Review Board (IRB) ethics approval number and date must be explicitly cited.",
      verbatimCitation: "Formal institutional review board (IRB) ethical clearance was determined to be non-applicable.",
      diagnosticFinding: "Human participant observational study lacks required institutional ethics board reference.",
      recommendation: "Provide active IRB approval protocol identifier or formal statutory exemption certificate.",
    },
    sampleExcerpt: `2.4 Ethical Clearance & Consent
Formal institutional review board (IRB) ethical clearance was determined to be non-applicable for this secondary cohort analysis of anonymized diagnostic biomarker scans.`,
    score: 42,
  },
];

export function InteractiveMethodologyPreview() {
  const [activeTab, setActiveTab] = useState<string>("academic");
  const selected = PRESETS.find((p) => p.id === activeTab) || PRESETS[0];
  const Icon = selected.icon;

  return (
    <Card className="p-0 overflow-hidden bg-white border-zinc-200 shadow-md">
      {/* Preset Role Selector Tabs */}
      <div className="border-b border-zinc-200 bg-zinc-50/75 p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {PRESETS.map((p) => {
            const TabIcon = p.icon;
            const isActive = activeTab === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActiveTab(p.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-zinc-900 text-white shadow-xs font-semibold"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                }`}
              >
                <TabIcon className="h-3.5 w-3.5" />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500">
          <Lock className="h-3 w-3 text-emerald-600" />
          <span>{selected.version}</span>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Manuscript Draft Stream */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-zinc-500" />
              Ingested Client Manuscript
            </span>
            <span className="text-[10px] font-mono text-zinc-400">Excerpt</span>
          </div>

          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 font-mono text-xs text-zinc-800 leading-relaxed whitespace-pre-wrap relative overflow-hidden">
            <div className="text-[10px] uppercase tracking-wider text-zinc-400 mb-2 font-sans font-semibold">
              {selected.discipline}
            </div>
            {selected.sampleExcerpt}
          </div>

          <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex items-center justify-between text-xs">
            <span className="text-blue-900 font-medium">Evaluation Baseline Score</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-blue-950 text-sm">
                {selected.score}/100
              </span>
              <Badge variant={selected.score >= 70 ? "success" : "danger"} size="sm">
                {selected.score >= 70 ? "Passing" : "Deficiencies Detected"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Right Column: Evidence-Grounded Diagnostic Finding */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              Evidence-Grounded Rule Finding
            </span>
            <Badge variant="danger" size="sm">
              {selected.sampleRule.severity.toUpperCase()} BREACH
            </Badge>
          </div>

          <Card className="p-4 bg-white border border-rose-200 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-zinc-700">
                  {selected.sampleRule.code}
                </span>
                <span className="text-xs font-semibold text-zinc-900">
                  {selected.sampleRule.title}
                </span>
              </div>
            </div>

            {/* Verbatim Quote Highlight */}
            <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-200/80 space-y-1">
              <span className="text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                <Quote className="h-3 w-3 text-zinc-400" /> Verbatim Manuscript Match
              </span>
              <p className="text-xs font-serif italic text-zinc-800 leading-relaxed">
                &ldquo;{selected.sampleRule.verbatimCitation}&rdquo;
              </p>
            </div>

            {/* Diagnostic Reason */}
            <div>
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-0.5">
                Methodological Finding
              </span>
              <p className="text-xs text-zinc-800 leading-relaxed">
                {selected.sampleRule.diagnosticFinding}
              </p>
            </div>

            {/* Actionable Remediation */}
            <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200/60 text-xs text-emerald-950">
              <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider block mb-0.5">
                Required Corrective Action
              </span>
              <p className="leading-relaxed">{selected.sampleRule.recommendation}</p>
            </div>
          </Card>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-zinc-500 font-mono">
              System: {selected.systemTitle}
            </span>
            <Link href="/review/thorne-phd-review-2026">
              <Button variant="outline" size="sm" className="text-xs">
                Open Full Interactive Review Flow &rarr;
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
