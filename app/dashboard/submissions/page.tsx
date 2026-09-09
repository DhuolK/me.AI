"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  Filter,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Eye,
  X,
  Quote,
  ShieldCheck,
  TrendingUp,
  Layers,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { Input } from "@/components/ui/Input";
import { Submission, Report, EvaluationFinding } from "@/lib/types/domain";

export default function SubmissionsIndexPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [revisionFilter, setRevisionFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // Quick Inspector Slide-over State
  const [inspectingSub, setInspectingSub] = useState<Submission | null>(null);
  const [inspectingReport, setInspectingReport] = useState<Report | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  useEffect(() => {
    fetch("/api/submissions")
      .then((res) => res.json())
      .then((data) => {
        if (data.submissions) setSubmissions(data.submissions);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleInspect = async (sub: Submission) => {
    setInspectingSub(sub);
    setIsLoadingReport(true);
    setInspectingReport(null);

    try {
      const res = await fetch(`/api/reports/${sub.id}`);
      if (res.ok) {
        const data = await res.json();
        setInspectingReport(data.report || null);
      }
    } catch {}
    setIsLoadingReport(false);
  };

  const filtered = submissions.filter((sub) => {
    const matchesSearch =
      (sub.guestEmail || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.guestPhone || "").includes(searchQuery) ||
      sub.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || sub.status === statusFilter;
    const matchesRevision =
      revisionFilter === "ALL" ||
      (revisionFilter === "FIRST" && sub.currentVersionIndex === 1) ||
      (revisionFilter === "REVISED" && sub.currentVersionIndex > 1);
    return matchesSearch && matchesStatus && matchesRevision;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-medium text-zinc-900">Submissions Stream</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time audit trail of incoming manuscripts, active evaluations, verified scores, and revision deltas.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-zinc-200/90 shadow-xs">
        <div className="w-full lg:w-96">
          <Input
            placeholder="Search by client email, phone number, or submission ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filters */}
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200">
            {["ALL", "READY", "EVALUATING", "PAYMENT_PENDING", "UPLOADED"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-colors ${
                  statusFilter === status
                    ? "bg-zinc-900 text-white shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Revision Filter */}
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200">
            {[
              { id: "ALL", label: "All Revisions" },
              { id: "FIRST", label: "1st Submissions" },
              { id: "REVISED", label: "Resubmissions" },
            ].map((rev) => (
              <button
                key={rev.id}
                onClick={() => setRevisionFilter(rev.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  revisionFilter === rev.id
                    ? "bg-zinc-900 text-white shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                {rev.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submissions Table Card */}
      <Card className="p-0 overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/75 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                <th className="py-3 px-4">Submission ID</th>
                <th className="py-3 px-4">Client Contact</th>
                <th className="py-3 px-4">Review System Version</th>
                <th className="py-3 px-4">Revision</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 font-mono">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400 font-sans">
                    Loading submissions pipeline...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400 font-sans">
                    No submissions found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-zinc-900 font-semibold">
                      <Link
                        href={`/dashboard/submissions/${s.id}`}
                        className="hover:text-blue-600 underline font-mono"
                      >
                        {s.id.substring(0, 16)}...
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-700 font-sans">
                      {s.guestEmail || s.guestPhone || "Guest Submission"}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-600 font-sans truncate max-w-xs">
                      Doctoral Dissertation Diagnostic
                    </td>
                    <td className="py-3.5 px-4 text-zinc-600">
                      <Badge variant={s.currentVersionIndex > 1 ? "brand" : "neutral"} size="sm">
                        Rev {s.currentVersionIndex}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <StatusIndicator status={s.status} />
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400 text-[11px]">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-sans">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleInspect(s)}
                          className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors inline-flex items-center gap-1 text-xs"
                          title="Quick Preview Findings"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Preview</span>
                        </button>
                        <Link
                          href={`/report/${s.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 ml-1"
                        >
                          Report <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Findings Inspector Drawer / Slide-Over */}
      {inspectingSub && (
        <div className="fixed inset-0 z-50 flex justify-end bg-zinc-900/30 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div className="space-y-4">
              {/* Drawer Header */}
              <div className="flex items-start justify-between border-b border-zinc-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-zinc-500">
                      {inspectingSub.id}
                    </span>
                    <Badge variant="brand" size="sm">
                      Rev {inspectingSub.currentVersionIndex}
                    </Badge>
                  </div>
                  <h2 className="text-base font-serif font-semibold text-zinc-900 mt-1">
                    {inspectingSub.guestEmail || inspectingSub.guestPhone || "Guest Manuscript"}
                  </h2>
                </div>
                <button
                  onClick={() => setInspectingSub(null)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Drawer Content */}
              {isLoadingReport ? (
                <div className="py-12 text-center text-xs font-mono text-zinc-400">
                  Loading diagnostic findings...
                </div>
              ) : inspectingReport ? (
                <div className="space-y-4 text-xs">
                  {/* Score summary */}
                  <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
                        Evaluation Score
                      </span>
                      <div className="text-2xl font-mono font-bold text-zinc-900 mt-0.5">
                        {inspectingReport.overallScore}/100
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
                        Compliance
                      </span>
                      <Badge
                        variant={inspectingReport.overallScore >= 75 ? "success" : "danger"}
                        size="sm"
                        className="mt-1"
                      >
                        {inspectingReport.overallScore >= 75 ? "Standard Satisfied" : "Deficiencies Detected"}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-zinc-700 bg-white p-3 rounded-lg border border-zinc-200 text-xs leading-relaxed">
                    {inspectingReport.summaryVerdict}
                  </p>

                  {/* Findings summary list */}
                  <div className="space-y-2.5">
                    <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Evaluation Findings ({inspectingReport.findings.length})
                    </div>
                    {inspectingReport.findings.map((f) => (
                      <div
                        key={f.id}
                        className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                          f.status === "passed"
                            ? "border-emerald-200 bg-emerald-50/20"
                            : f.severity === "critical"
                            ? "border-rose-200 bg-rose-50/20"
                            : "border-amber-200 bg-amber-50/20"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-semibold text-zinc-600">
                            {f.ruleCode}
                          </span>
                          <Badge
                            variant={
                              f.status === "passed"
                                ? "success"
                                : f.severity === "critical"
                                ? "danger"
                                : "warning"
                            }
                            size="sm"
                          >
                            {f.status.toUpperCase()}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-zinc-900 text-xs">{f.ruleTitle}</h4>
                        <p className="text-zinc-600 text-[11px] line-clamp-2">{f.finding}</p>

                        {f.evidence && f.evidence[0] && (
                          <div className="bg-white p-2 rounded border border-zinc-200/60 text-[11px] font-serif italic text-zinc-600">
                            &ldquo;{f.evidence[0].quote.substring(0, 140)}...&rdquo;
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-zinc-400">
                  Report is currently being processed or payment is pending.
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
              <Link
                href={`/dashboard/submissions/${inspectingSub.id}`}
                className="text-xs font-semibold text-zinc-900 hover:underline"
              >
                View Full Audit Timeline &rarr;
              </Link>

              <Link href={`/report/${inspectingSub.id}`}>
                <Button variant="primary" size="sm">
                  Open Evidence Report
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
