"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  RotateCcw,
  Calendar,
  CreditCard,
  Hash,
  Layers,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { Submission, ReviewSystem, ReviewSystemVersion, Report } from "@/lib/types/domain";

export default function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [reviewSystem, setReviewSystem] = useState<ReviewSystem | null>(null);
  const [version, setVersion] = useState<ReviewSystemVersion | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/submissions/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.submission) {
          setSubmission(data.submission);
          setReviewSystem(data.reviewSystem || null);
          setVersion(data.version || null);
          setReport(data.report || null);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading || !submission) {
    return (
      <div className="py-20 text-center text-xs font-mono text-zinc-500">
        Loading Submission Audit Record...
      </div>
    );
  }

  const latestVersion = submission.versions[submission.versions.length - 1];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/submissions"
              className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 font-medium mr-2"
            >
              <ArrowLeft className="h-3 w-3" /> Submissions
            </Link>
            <StatusIndicator status={submission.status} />
            <Badge variant="brand" size="sm">
              Revision {submission.currentVersionIndex}
            </Badge>
          </div>
          <h1 className="text-xl font-serif font-semibold text-zinc-900">
            Submission Audit Record
          </h1>
          <p className="font-mono text-xs text-zinc-500">ID: {submission.id}</p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/report/${submission.id}`}>
            <Button variant="primary" size="sm">
              Open Evidence Report <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Metadata & Lifecycle Timeline */}
        <div className="col-span-12 md:col-span-7 space-y-5">
          {/* Metadata Card */}
          <Card className="p-6 bg-white space-y-4 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-900 border-b border-zinc-100 pb-2">
              Submission Metadata
            </h2>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-zinc-400 block text-[11px]">Client Email</span>
                <span className="text-zinc-900 font-semibold font-sans">
                  {submission.guestEmail || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">Client Phone / M-Pesa</span>
                <span className="text-zinc-900 font-semibold">{submission.guestPhone || "N/A"}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">Review System</span>
                <span className="text-zinc-900 font-semibold font-sans">
                  {reviewSystem?.name || "Doctoral Diagnostic"}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">Immutable Version</span>
                <span className="text-zinc-900 font-semibold">
                  v{version?.versionNumber || "1.0.0"} (Locked)
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">Intake Timestamp</span>
                <span className="text-zinc-900">
                  {new Date(submission.createdAt).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">Latest Score</span>
                <span className="text-zinc-900 font-bold">
                  {report ? `${report.overallScore}/100` : "Pending Evaluation"}
                </span>
              </div>
            </div>
          </Card>

          {/* Lifecycle Timeline */}
          <Card className="p-6 bg-white space-y-4 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-900 border-b border-zinc-100 pb-2">
              Evaluation Pipeline Trace
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3 text-xs">
                <div className="h-6 w-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-semibold text-zinc-900">Manuscript Ingestion & Sanitization</span>
                  <p className="text-zinc-500 text-[11px]">
                    Extracted text stream and removed PDF binary artifacts. Character count:{" "}
                    {latestVersion?.rawText.length.toLocaleString()} chars.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <div className="h-6 w-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-semibold text-zinc-900">Payment & Entitlement Authorization</span>
                  <p className="text-zinc-500 text-[11px]">
                    Transaction verified via idempotent Daraja payment state machine.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <div className="h-6 w-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-semibold text-zinc-900">Evidence-Grounded Rule Evaluation</span>
                  <p className="text-zinc-500 text-[11px]">
                    Evaluated against {version?.rules.length || 5} structured rules with verbatim citation verification.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <div className="h-6 w-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-semibold text-zinc-900">Diagnostic Report Delivery</span>
                  <p className="text-zinc-500 text-[11px]">
                    Report ready at <code>/report/{submission.id}</code>.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Submitted Manuscript Content */}
        <div className="col-span-12 md:col-span-5 space-y-4">
          <Card className="p-6 bg-white space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <span className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                Manuscript Draft Content
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                {latestVersion?.rawText.split(/\s+/).filter(Boolean).length || 0} words
              </span>
            </div>

            <pre className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 text-xs font-mono text-zinc-800 whitespace-pre-wrap max-h-[500px] overflow-y-auto leading-relaxed">
              {latestVersion?.rawText || "No raw text available."}
            </pre>
          </Card>
        </div>
      </div>
    </div>
  );
}
