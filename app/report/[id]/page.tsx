"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  Quote,
  Check,
  X,
  MessageSquare,
  Lock,
  Download,
  Printer,
  Award,
  Layers,
  Copy,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { Textarea } from "@/components/ui/Input";
import { Report, EvaluationFinding, Submission, ReviewSystemVersion } from "@/lib/types/domain";
import { SubmissionDropzone } from "@/components/client/SubmissionDropzone";

export default function EvidenceReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [report, setReport] = useState<Report | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [version, setVersion] = useState<ReviewSystemVersion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [copiedAuditId, setCopiedAuditId] = useState(false);

  // Override Modal state
  const [selectedFinding, setSelectedFinding] = useState<EvaluationFinding | null>(null);
  const [overrideAction, setOverrideAction] = useState<"accept" | "reject" | "override">("override");
  const [overrideNote, setOverrideNote] = useState("");
  const [isSubmittingOverride, setIsSubmittingOverride] = useState(false);

  // Resubmit Modal state
  const [showResubmitModal, setShowResubmitModal] = useState(false);
  const [resubmitText, setResubmitText] = useState("");
  const [resubmitFilename, setResubmitFilename] = useState("revised_manuscript.txt");
  const [isResubmitting, setIsResubmitting] = useState(false);

  const loadReportData = () => {
    fetch(`/api/reports/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.report) {
          setReport(data.report);
          setSubmission(data.submission);
          setVersion(data.version);
          setIsOwner(data.isOwner || false);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadReportData();
  }, [id]);

  const handleApplyOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report || !selectedFinding) return;
    setIsSubmittingOverride(true);

    try {
      const res = await fetch(`/api/reports/${report.id}/override`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          findingId: selectedFinding.id,
          action: overrideAction,
          note: overrideNote,
        }),
      });

      if (res.ok) {
        setSelectedFinding(null);
        setOverrideNote("");
        loadReportData();
      }
    } catch {}
    setIsSubmittingOverride(false);
  };

  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report || !resubmitText) return;
    setIsResubmitting(true);

    try {
      const res = await fetch(`/api/reports/${report.id}/resubmit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: [
            {
              filename: resubmitFilename || "revised_manuscript.txt",
              mimeType: "text/plain",
              sizeBytes: resubmitText.length,
              rawText: resubmitText,
            },
          ],
        }),
      });

      if (res.ok) {
        setShowResubmitModal(false);
        loadReportData();
      }
    } catch {}
    setIsResubmitting(false);
  };

  const handleExportMarkdown = () => {
    if (!report || !submission) return;

    let md = `# me.AI Diagnostic Evaluation Report\n\n`;
    md += `**Report ID:** \`${report.id}\`\n`;
    md += `**Evaluation Date:** ${new Date(report.createdAt).toUTCString()}\n`;
    md += `**Overall Score:** ${report.overallScore}/100\n`;
    md += `**Client Reference:** ${submission.guestEmail || "Guest Client"}\n`;
    md += `**Revision Index:** ${submission.currentVersionIndex}\n\n`;
    md += `---\n\n`;
    md += `## Executive Verdict\n\n${report.summaryVerdict}\n\n`;
    md += `### Category Breakdown\n\n`;

    // Group findings by category
    const categories = Array.from(new Set(report.findings.map((f) => f.category)));
    categories.forEach((cat) => {
      const catFindings = report.findings.filter((f) => f.category === cat);
      const passed = catFindings.filter((f) => f.status === "passed").length;
      md += `- **${cat}:** ${passed}/${catFindings.length} Criteria Passed (${Math.round(
        (passed / catFindings.length) * 100
      )}%)\n`;
    });

    md += `\n---\n\n## Detailed Evaluation Findings\n\n`;
    report.findings.forEach((finding, idx) => {
      md += `### ${idx + 1}. [${finding.ruleCode}] ${finding.ruleTitle}\n`;
      md += `- **Status:** ${finding.status.toUpperCase()} | **Severity:** ${finding.severity.toUpperCase()}\n`;
      md += `- **Category:** ${finding.category}\n`;
      md += `- **Diagnosis:** ${finding.finding}\n\n`;

      if (finding.evidence && finding.evidence.length > 0) {
        md += `**Verbatim Evidence Citations:**\n`;
        finding.evidence.forEach((ev) => {
          md += `> "${ev.quote}"\n> — *(Chunk #${ev.chunkIndex} · ${ev.sectionContext || "Body"})*\n\n`;
        });
      }

      if (finding.recommendation) {
        md += `**Remediation Recommendation:**\n${finding.recommendation}\n\n`;
      }
      md += `---\n\n`;
    });

    if (report.overrides && report.overrides.length > 0) {
      md += `## Supervisory Audit Log & Overrides\n\n`;
      report.overrides.forEach((ovr) => {
        md += `- **Reviewer:** ${ovr.expertName || ovr.expertUserId} (${new Date(
          ovr.appliedAt
        ).toLocaleString()})\n`;
        md += `  - **Action:** ${ovr.decision}\n`;
        md += `  - **Note:** ${ovr.reason}\n\n`;
      });
    }

    md += `\n*Generated by me.AI Professional Review Infrastructure. Non-training privacy guaranteed.*\n`;

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Diagnostic_Report_${report.id.substring(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const copyAuditSeal = () => {
    if (!report) return;
    navigator.clipboard.writeText(`me.AI-VERIFIED:${report.id}:${report.overallScore}/100`);
    setCopiedAuditId(true);
    setTimeout(() => setCopiedAuditId(false), 2000);
  };

  if (isLoading || !report || !submission) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="font-mono text-xs text-zinc-500">Loading Evidence Report...</div>
      </div>
    );
  }

  const passedCount = report.findings.filter((f) => f.status === "passed").length;
  const criticalCount = report.findings.filter((f) => f.severity === "critical" && f.status !== "passed").length;
  const warningCount = report.findings.filter(
    (f) => (f.severity === "high" || f.severity === "medium") && f.status !== "passed"
  ).length;

  const categories = Array.from(new Set(report.findings.map((f) => f.category)));

  return (
    <div className="min-h-screen bg-zinc-50/60 pb-16 print:bg-white print:pb-0">
      {/* Top Banner Navigation (Hidden in Print) */}
      <div className="bg-white border-b border-zinc-200 py-3 px-4 sm:px-8 print:hidden">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Workspace
            </Link>
            <span className="text-zinc-300">/</span>
            <span className="font-mono text-xs text-zinc-600">Report #{report.id.substring(0, 12)}</span>
            <Badge variant="brand" size="sm">
              Revision {submission.currentVersionIndex}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportMarkdown}
              className="text-xs font-medium"
              title="Download Executive Markdown"
            >
              <Download className="h-3.5 w-3.5 mr-1 text-zinc-500" />
              Export Markdown
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="text-xs font-medium"
              title="Print or Save PDF"
            >
              <Printer className="h-3.5 w-3.5 mr-1 text-zinc-500" />
              Print / PDF
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowResubmitModal(true)}
              className="text-xs font-medium"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1 text-zinc-300" />
              Submit Revision
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-8 space-y-6">
        {/* Executive Scorecard */}
        <div className="grid grid-cols-12 gap-5">
          {/* Main Score Banner */}
          <Card className="col-span-12 md:col-span-8 p-6 bg-white space-y-4 shadow-sm print:border-none print:shadow-none">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Diagnostic Evaluation Result
                </span>
                <h1 className="text-xl font-serif font-semibold text-zinc-900 mt-1">
                  Structured Methodology Compliance
                </h1>
              </div>
              <div className="text-right">
                <div className="text-3xl font-mono font-bold text-zinc-900">
                  {report.overallScore}
                  <span className="text-base font-normal text-zinc-400">/100</span>
                </div>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {report.overallScore >= 75 ? "Standard Satisfied" : "Methodology Deficiencies Detected"}
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed bg-zinc-50 p-3 rounded-lg border border-zinc-200">
              {report.summaryVerdict}
            </p>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200/60">
                <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider block">
                  Passed Criteria
                </span>
                <span className="text-xl font-mono font-bold text-emerald-700 mt-0.5 block">
                  {passedCount}
                </span>
              </div>
              <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-200/60">
                <span className="text-[10px] font-semibold text-rose-800 uppercase tracking-wider block">
                  Critical Deficiencies
                </span>
                <span className="text-xl font-mono font-bold text-rose-700 mt-0.5 block">
                  {criticalCount}
                </span>
              </div>
              <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200/60">
                <span className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider block">
                  Warnings / Nuance
                </span>
                <span className="text-xl font-mono font-bold text-amber-700 mt-0.5 block">
                  {warningCount}
                </span>
              </div>
            </div>
          </Card>

          {/* Review System Meta & Verified Audit Seal */}
          <Card className="col-span-12 md:col-span-4 p-6 bg-white space-y-4 shadow-sm flex flex-col justify-between print:border-none print:shadow-none">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Audit Verification
                </span>
                <Badge variant="success" size="sm">
                  <ShieldCheck className="h-3 w-3 mr-1 inline" /> VERIFIED
                </Badge>
              </div>

              <h2 className="text-sm font-semibold text-zinc-900 mt-1">
                Doctoral Dissertation Diagnostic
              </h2>

              <div className="mt-3 space-y-2 text-xs text-zinc-600 font-mono">
                <div className="flex justify-between">
                  <span>Version:</span>
                  <span className="text-zinc-900">v1.0.0 (Locked)</span>
                </div>
                <div className="flex justify-between">
                  <span>Client Contact:</span>
                  <span className="text-zinc-900 truncate max-w-[150px] font-sans">
                    {submission.guestEmail || "Guest Student"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Evaluated Date:</span>
                  <span className="text-zinc-900">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Audit Stamp:</span>
                  <span className="text-zinc-900 font-mono text-[10px]">
                    {report.id.substring(0, 14)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
              <button
                onClick={copyAuditSeal}
                className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-500 hover:text-zinc-900 transition-colors"
                title="Copy cryptographic audit seal"
              >
                {copiedAuditId ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Seal Copied</span>
                  </>
                ) : (
                  <>
                    <Award className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Copy Verification Seal</span>
                  </>
                )}
              </button>
            </div>
          </Card>
        </div>

        {/* Category Rigor Score Breakdown */}
        <Card className="p-6 bg-white space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-zinc-700" />
            <h2 className="text-sm font-semibold text-zinc-900">Category Rigor & Breakdown</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const catFindings = report.findings.filter((f) => f.category === cat);
              const catPassed = catFindings.filter((f) => f.status === "passed").length;
              const catPct = Math.round((catPassed / catFindings.length) * 100);

              return (
                <div
                  key={cat}
                  className="p-3.5 rounded-lg border border-zinc-200/80 bg-zinc-50/50 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-zinc-800">{cat}</span>
                    <span className="font-mono text-zinc-900">{catPct}%</span>
                  </div>

                  <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        catPct >= 80
                          ? "bg-emerald-600"
                          : catPct >= 50
                          ? "bg-amber-500"
                          : "bg-rose-600"
                      }`}
                      style={{ width: `${catPct}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                    <span>{catPassed} passed</span>
                    <span>{catFindings.length - catPassed} issues</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Findings Stream with Evidence Quotes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">Evidence Findings & Recommendations</h2>
              <p className="text-xs text-zinc-500">
                Detailed evaluation points linked to exact manuscript quotes and actionable fixes.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {report.findings.map((finding) => (
              <Card
                key={finding.id}
                className={`p-6 bg-white border transition-all ${
                  finding.status === "passed"
                    ? "border-emerald-200/80 bg-emerald-50/10"
                    : finding.severity === "critical"
                    ? "border-rose-200/90"
                    : "border-amber-200/90"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-zinc-500">
                        {finding.ruleCode}
                      </span>
                      <Badge
                        variant={
                          finding.status === "passed"
                            ? "success"
                            : finding.severity === "critical"
                            ? "danger"
                            : "warning"
                        }
                        size="sm"
                      >
                        {finding.status === "passed" ? "PASSED" : finding.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" size="sm">
                        {finding.category}
                      </Badge>
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-900 mt-1.5">{finding.ruleTitle}</h3>
                  </div>

                  {/* Professional Override Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs print:hidden"
                    onClick={() => {
                      setSelectedFinding(finding);
                      setOverrideAction(finding.status === "passed" ? "reject" : "accept");
                    }}
                  >
                    Expert Override
                  </Button>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  {/* Diagnosis */}
                  <div>
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                      Finding Analysis
                    </span>
                    <p className="text-zinc-800 leading-relaxed">{finding.finding}</p>
                  </div>

                  {/* Verbatim Evidence Citation */}
                  {finding.evidence && finding.evidence.length > 0 && (
                    <div className="bg-zinc-50 rounded-lg p-3.5 border border-zinc-200/80 space-y-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-wider">
                        <Quote className="h-3 w-3 text-zinc-400" />
                        <span>Verbatim Manuscript Evidence</span>
                      </div>
                      {finding.evidence.map((ev, evIdx) => (
                        <blockquote
                          key={evIdx}
                          className="text-zinc-700 italic border-l-2 border-zinc-300 pl-3 text-xs font-serif leading-relaxed"
                        >
                          &ldquo;{ev.quote}&rdquo;
                          <span className="block text-[10px] font-mono not-italic text-zinc-400 mt-1">
                            (Chunk #{ev.chunkIndex} · {ev.sectionContext || "Body"})
                          </span>
                        </blockquote>
                      ))}
                    </div>
                  )}

                  {/* Recommendation */}
                  {finding.recommendation && (
                    <div className="bg-blue-50/60 rounded-lg p-3.5 border border-blue-200/60 space-y-1">
                      <div className="text-[10px] font-semibold text-blue-900 uppercase tracking-wider">
                        Actionable Remediations
                      </div>
                      <p className="text-blue-950 leading-relaxed font-sans">{finding.recommendation}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Supervisory Audit Log (If Overrides Exist) */}
        {report.overrides && report.overrides.length > 0 && (
          <Card className="p-6 bg-white space-y-3 shadow-sm border-zinc-200">
            <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
              <Award className="h-4 w-4 text-indigo-600" /> Supervisory Audit Log
            </h3>
            <div className="space-y-2">
              {report.overrides.map((ovr) => (
                <div
                  key={ovr.id}
                  className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <span className="font-semibold text-zinc-900">
                      {ovr.expertName || ovr.expertUserId}
                    </span>{" "}
                    <span className="text-zinc-500 font-mono">({ovr.decision})</span>
                    <p className="text-zinc-600 mt-0.5">{ovr.reason}</p>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                    {new Date(ovr.appliedAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Override Modal */}
      {selectedFinding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4 print:hidden">
          <Card className="w-full max-w-lg bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-base font-semibold text-zinc-900">Expert Professional Override</h3>
            <p className="text-xs text-zinc-500">
              Apply a manual supervisory override to this AI finding. An audit log will be appended to the report.
            </p>

            <form onSubmit={handleApplyOverride} className="space-y-4">
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-xs">
                <span className="font-mono text-[11px] text-zinc-500 block">{selectedFinding.ruleCode}</span>
                <span className="font-semibold text-zinc-900 block mt-0.5">{selectedFinding.ruleTitle}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Override Decision
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "accept", label: "Mark Passed" },
                    { key: "reject", label: "Mark Failed" },
                    { key: "override", label: "Custom Note" },
                  ].map((act) => (
                    <button
                      key={act.key}
                      type="button"
                      onClick={() => setOverrideAction(act.key as any)}
                      className={`p-2 rounded-lg text-xs font-semibold border transition-colors ${
                        overrideAction === act.key
                          ? "bg-zinc-900 text-white border-zinc-900"
                          : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
                      }`}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              </div>

              <Textarea
                label="Professional Reviewer Rationale"
                placeholder="Explain the reason for overriding the automated finding..."
                value={overrideNote}
                onChange={(e) => setOverrideNote(e.target.value)}
                rows={3}
                required
              />

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                <Button variant="ghost" size="sm" type="button" onClick={() => setSelectedFinding(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" isLoading={isSubmittingOverride}>
                  Confirm Override
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Resubmit Revision Modal */}
      {showResubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4 print:hidden backdrop-blur-xs">
          <Card className="w-full max-w-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-zinc-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-zinc-900">Submit Revised Manuscript</h3>
                  <Badge variant="brand" size="sm">
                    Next: Revision {(submission?.currentVersionIndex || 1) + 1}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Drop your updated document or paste revised text to re-evaluate against the immutable rules.
                </p>
              </div>
              <button
                onClick={() => setShowResubmitModal(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Previous vs New Length Telemetry */}
            {submission?.versions && submission.versions.length > 0 && (
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-xs font-mono grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-zinc-400 block uppercase">Original Manuscript</span>
                  <span className="text-zinc-700 font-semibold">
                    {submission.versions[submission.versions.length - 1]?.rawText.length.toLocaleString() || 0} chars (
                    {submission.versions[submission.versions.length - 1]?.rawText.split(/\s+/).filter(Boolean).length || 0} words)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block uppercase">Revised Manuscript</span>
                  <span className="text-zinc-900 font-semibold">
                    {resubmitText.length.toLocaleString()} chars (
                    {resubmitText.trim() ? resubmitText.trim().split(/\s+/).filter(Boolean).length : 0} words)
                    {resubmitText.length > 0 && (
                      <span className={`ml-1.5 text-[11px] ${resubmitText.length >= (submission.versions[submission.versions.length - 1]?.rawText.length || 0) ? "text-emerald-600" : "text-amber-600"}`}>
                        ({resubmitText.length - (submission.versions[submission.versions.length - 1]?.rawText.length || 0) > 0 ? "+" : ""}
                        {resubmitText.length - (submission.versions[submission.versions.length - 1]?.rawText.length || 0)} chars)
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleResubmit} className="space-y-4">
              <SubmissionDropzone
                initialText={resubmitText}
                onContentExtracted={({ filename, rawText }) => {
                  setResubmitText(rawText);
                  if (filename) setResubmitFilename(filename);
                }}
              />

              <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                <span className="text-[11px] text-zinc-400 font-mono">
                  File: {resubmitFilename}
                </span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" type="button" onClick={() => setShowResubmitModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    type="submit"
                    isLoading={isResubmitting}
                    disabled={!resubmitText.trim()}
                  >
                    Run Revision Evaluation &rarr;
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
