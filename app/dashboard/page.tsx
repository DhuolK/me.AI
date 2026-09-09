"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Layers,
  FileText,
  Clock,
  ArrowUpRight,
  Plus,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { ReviewSystem, Submission } from "@/lib/types/domain";

export default function DashboardOverviewPage() {
  const [reviewSystems, setReviewSystems] = useState<ReviewSystem[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/review-systems").then((r) => r.json()),
      fetch("/api/submissions").then((r) => r.json()),
    ])
      .then(([sysData, subData]) => {
        if (sysData.reviewSystems) setReviewSystems(sysData.reviewSystems);
        if (subData.submissions) setSubmissions(subData.submissions);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleCopy = (token: string) => {
    const url = `${window.location.origin}/review/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const pendingAttention = submissions.filter(
    (s) => s.status === "EVALUATING" || s.status === "UPLOADED" || s.status === "PAYMENT_PENDING"
  );

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-medium text-zinc-900">Workspace Operations</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Structured methodologies, client review links, and active evaluation pipelines.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/review-systems/new">
            <Button variant="primary" size="sm">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              New Review System
            </Button>
          </Link>
        </div>
      </div>

      {/* Operational Attention Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-white">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Systems</span>
            <Layers className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-mono font-semibold text-zinc-900">
            {reviewSystems.length}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {reviewSystems.filter((s) => s.status === "published").length} published & distributed
          </div>
        </Card>

        <Card className="p-4 bg-white">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Submissions</span>
            <FileText className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-mono font-semibold text-zinc-900">
            {submissions.length}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Across all active review links</div>
        </Card>

        <Card className={`p-4 ${pendingAttention.length > 0 ? "bg-amber-50/50 border-amber-200" : "bg-white"}`}>
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
              Needs Attention
            </span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-mono font-semibold text-zinc-900">
            {pendingAttention.length}
          </div>
          <div className="text-[11px] text-zinc-600 mt-1">
            {pendingAttention.length === 0
              ? "All submissions processed"
              : "In-flight evaluations & payments"}
          </div>
        </Card>
      </div>

      {/* Primary Section: Active Review Systems */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Published Review Systems</h2>
            <p className="text-xs text-zinc-500">
              Configured methodologies with immutable rule engines and distribution endpoints.
            </p>
          </div>
          <Link
            href="/dashboard/review-systems"
            className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View All &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviewSystems.map((rs) => (
            <Card key={rs.id} className="p-5 flex flex-col justify-between hover:border-zinc-300">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <Badge variant={rs.status === "published" ? "success" : "warning"}>
                    {rs.status.toUpperCase()}
                  </Badge>
                  <span className="text-xs font-mono font-semibold text-zinc-900">
                    {rs.priceKes === 0 ? "Included" : `${rs.priceKes} KES`}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-zinc-900 mt-2.5 line-clamp-1">{rs.name}</h3>
                <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{rs.description}</p>
                <div className="mt-2.5 text-[11px] font-mono text-zinc-400">
                  Discipline: <span className="text-zinc-600">{rs.discipline}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                <Link
                  href={`/dashboard/review-systems/${rs.id}`}
                  className="text-xs font-semibold text-zinc-900 hover:text-blue-600 inline-flex items-center gap-1"
                >
                  Edit Studio Rules &rarr;
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy("thorne-phd-review-2026")}
                  className="text-xs"
                >
                  {copiedToken ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-600 mr-1" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1 text-zinc-400" /> Share Link
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Dense Submissions Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Recent Submissions Stream</h2>
            <p className="text-xs text-zinc-500">
              Live audit stream of incoming documents, evaluation status, and reports.
            </p>
          </div>
          <Link
            href="/dashboard/submissions"
            className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            All Submissions &rarr;
          </Link>
        </div>

        <Card className="p-0 overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/75 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Submission ID</th>
                  <th className="py-2.5 px-4">Client Identity</th>
                  <th className="py-2.5 px-4">Review System</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Revision</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 font-mono">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-400 font-sans">
                      No submissions recorded yet. Share a review link to begin receiving documents.
                    </td>
                  </tr>
                ) : (
                  submissions.map((s) => (
                    <tr key={s.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-3 px-4 text-zinc-900 font-semibold">{s.id.substring(0, 14)}...</td>
                      <td className="py-3 px-4 text-zinc-700 font-sans">
                        {s.guestEmail || s.guestPhone || "Guest Participant"}
                      </td>
                      <td className="py-3 px-4 text-zinc-600 font-sans truncate max-w-xs">
                        Doctoral Dissertation Diagnostic
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <StatusIndicator status={s.status} />
                      </td>
                      <td className="py-3 px-4 text-zinc-600">v{s.currentVersionIndex}</td>
                      <td className="py-3 px-4 text-right font-sans">
                        <Link
                          href={`/report/${s.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                        >
                          Open Report <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
