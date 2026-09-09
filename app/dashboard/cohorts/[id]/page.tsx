"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Plus,
  Calendar,
  Download,
  Share2,
  Check,
  Copy,
  AlertTriangle,
  TrendingUp,
  BarChart2,
  CheckCircle2,
  FileText,
  Mail,
  ShieldCheck,
  Flame,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Cohort, CohortMember, ReviewSystem, DistributionLink } from "@/lib/types/domain";

interface FailurePattern {
  ruleCode: string;
  ruleTitle: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  failureRatePct: number;
  failedCount: number;
  recommendation: string;
}

export default function CohortDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [members, setMembers] = useState<CohortMember[]>([]);
  const [reviewSystem, setReviewSystem] = useState<ReviewSystem | null>(null);
  const [distributionLink, setDistributionLink] = useState<DistributionLink | null>(null);
  const [failurePatterns, setFailurePatterns] = useState<FailurePattern[]>([]);
  const [stats, setStats] = useState<{
    totalEnrolled: number;
    averageScore: number;
    passRatePct: number;
    totalSubmissions: number;
  }>({
    totalEnrolled: 0,
    averageScore: 0,
    passRatePct: 0,
    totalSubmissions: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [copiedToken, setCopiedToken] = useState(false);

  // Enroll Modal state
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollEmail, setEnrollEmail] = useState("");
  const [enrollName, setEnrollName] = useState("");
  const [enrollIdentifier, setEnrollIdentifier] = useState("");
  const [isEnrolling, setIsEnrolling] = useState(false);

  const loadCohortData = () => {
    fetch(`/api/cohorts/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.cohort) {
          setCohort(data.cohort);
          setMembers(data.members || []);
          setReviewSystem(data.reviewSystem || null);
          setDistributionLink(data.distributionLink || null);
          setFailurePatterns(data.failurePatterns || []);
          if (data.stats) setStats(data.stats);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadCohortData();
  }, [id]);

  const handleCopyLink = () => {
    if (!distributionLink) return;
    const url = `${window.location.origin}/review/${distributionLink.token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollEmail) return;
    setIsEnrolling(true);

    try {
      const res = await fetch(`/api/cohorts/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: enrollEmail,
          name: enrollName,
          studentIdentifier: enrollIdentifier,
        }),
      });

      if (res.ok) {
        setShowEnrollModal(false);
        setEnrollEmail("");
        setEnrollName("");
        setEnrollIdentifier("");
        loadCohortData();
      }
    } catch {}
    setIsEnrolling(false);
  };

  const handleExportCSV = () => {
    if (!cohort || members.length === 0) return;

    let csv = "Student ID,Student Name,Institutional Email,Submission Count,Latest Score %,Status\n";
    members.forEach((m) => {
      csv += `"${m.studentIdentifier || ""}","${m.name || ""}","${m.email}","${
        m.submissionsCount || 1
      }","${m.latestScore ?? "N/A"}","${m.status}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Cohort_Roster_${cohort.name.replace(/\s+/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading || !cohort) {
    return (
      <div className="py-20 text-center text-xs font-mono text-zinc-500">
        Loading Cohort Analytics & Roster...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-zinc-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/cohorts"
              className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 font-medium mr-2"
            >
              <ArrowLeft className="h-3 w-3" /> Cohorts
            </Link>
            <Badge variant="success" size="sm">
              ACTIVE COHORT
            </Badge>
            {reviewSystem && <Badge variant="brand">{reviewSystem.discipline}</Badge>}
          </div>
          <h1 className="text-xl font-serif font-semibold text-zinc-900">{cohort.name}</h1>
          <p className="text-xs text-zinc-500">{cohort.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {distributionLink && (
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              {copiedToken ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-600" /> Link Copied
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5 mr-1.5 text-zinc-400" /> Copy Cohort Submission Link
                </>
              )}
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-3.5 w-3.5 mr-1.5 text-zinc-500" />
            Export Roster CSV
          </Button>

          <Button variant="primary" size="sm" onClick={() => setShowEnrollModal(true)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Enroll Student
          </Button>
        </div>
      </div>

      {/* Cohort Summary Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-white">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
            Cohort Average
          </span>
          <div className="text-2xl font-mono font-bold text-zinc-900 mt-1">
            {stats.averageScore.toFixed(1)}%
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">+7.2% overall gain on revision</span>
        </Card>

        <Card className="p-4 bg-white">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
            Passing Rate
          </span>
          <div className="text-2xl font-mono font-bold text-emerald-700 mt-1">{stats.passRatePct}%</div>
          <span className="text-[11px] text-zinc-500 font-mono">Score &gt;= 75% standard</span>
        </Card>

        <Card className="p-4 bg-white">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
            Enrolled Students
          </span>
          <div className="text-2xl font-mono font-bold text-zinc-900 mt-1">{members.length}</div>
          <span className="text-[11px] text-zinc-500 font-mono">
            {stats.totalSubmissions} drafts evaluated
          </span>
        </Card>

        <Card className="p-4 bg-white">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
            Target Deadline
          </span>
          <div className="text-sm font-semibold text-zinc-900 mt-2 flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-zinc-400" />
            <span>{cohort.endDate ? new Date(cohort.endDate).toLocaleDateString() : "Dec 15, 2026"}</span>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">Active Semester</span>
        </Card>
      </div>

      {/* Recurring Failure Patterns & Weakness Diagnostic */}
      <Card className="p-6 bg-white space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-amber-600" />
            <h2 className="text-sm font-semibold text-zinc-900">
              Recurring Methodology Weaknesses & Deficiencies
            </h2>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">
            Ranked by failure frequency across student manuscripts
          </span>
        </div>

        <div className="space-y-3">
          {failurePatterns.map((pat, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-zinc-200/90 bg-zinc-50/50 space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-zinc-500">{pat.ruleCode}</span>
                  <Badge
                    variant={
                      pat.severity === "critical"
                        ? "danger"
                        : pat.severity === "high"
                        ? "warning"
                        : "neutral"
                    }
                    size="sm"
                  >
                    {pat.severity.toUpperCase()}
                  </Badge>
                  <span className="text-xs font-semibold text-zinc-900">{pat.ruleTitle}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-rose-700">
                    {pat.failureRatePct}% of drafts failed
                  </span>
                  <span className="text-[11px] text-zinc-400 font-mono">({pat.failedCount} students)</span>
                </div>
              </div>

              <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-rose-600 h-full rounded-full transition-all"
                  style={{ width: `${pat.failureRatePct}%` }}
                />
              </div>

              <div className="text-xs text-zinc-600 bg-white p-3 rounded-lg border border-zinc-200/80 space-y-1">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
                  Recommended Cohort Teaching Intervention:
                </span>
                <p className="text-zinc-800 leading-relaxed">{pat.recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Roster & Individual Student Progress Table */}
      <Card className="p-0 overflow-hidden bg-white shadow-sm">
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
          <div>
            <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
              Enrolled Student Researchers & Diagnostic Benchmark
            </h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Individual submission history and latest verified compliance scores.
            </p>
          </div>
          <Badge variant="brand" size="sm">
            {members.length} Enrolled
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/75 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                <th className="py-2.5 px-4">Student ID</th>
                <th className="py-2.5 px-4">Student Name</th>
                <th className="py-2.5 px-4">Institutional Email</th>
                <th className="py-2.5 px-4">Submissions</th>
                <th className="py-2.5 px-4">Latest Score</th>
                <th className="py-2.5 px-4 text-right">Standard Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 font-mono">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-zinc-50/80">
                  <td className="py-3 px-4 text-zinc-500 text-[11px]">
                    {m.studentIdentifier || "N/A"}
                  </td>
                  <td className="py-3 px-4 font-sans font-semibold text-zinc-900">
                    {m.name || "Student Researcher"}
                  </td>
                  <td className="py-3 px-4 text-zinc-600">{m.email}</td>
                  <td className="py-3 px-4 text-zinc-800">{m.submissionsCount || 1} drafts</td>
                  <td className="py-3 px-4 font-semibold text-zinc-900">
                    {m.latestScore ? (
                      <span
                        className={
                          m.latestScore >= 75
                            ? "text-emerald-600"
                            : m.latestScore >= 60
                            ? "text-amber-600"
                            : "text-rose-600"
                        }
                      >
                        {m.latestScore.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-zinc-400">Pending</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-sans">
                    <Badge
                      variant={
                        m.status === "completed" || (m.latestScore || 0) >= 75
                          ? "success"
                          : m.status === "at_risk"
                          ? "danger"
                          : "warning"
                      }
                      size="sm"
                    >
                      {m.status === "completed" || (m.latestScore || 0) >= 75
                        ? "Passed Standard"
                        : m.status === "at_risk"
                        ? "At Risk"
                        : "Needs Revision"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Enroll Student Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4">
          <Card className="w-full max-w-md bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-base font-semibold text-zinc-900">Enroll Student Researcher</h3>
            <p className="text-xs text-zinc-500">
              Add a student to this cohort. They will receive access to submit manuscripts under this institutional review system.
            </p>

            <form onSubmit={handleEnrollStudent} className="space-y-3">
              <Input
                label="Student ID Number"
                placeholder="e.g. PHD/2026/042"
                value={enrollIdentifier}
                onChange={(e) => setEnrollIdentifier(e.target.value)}
              />

              <Input
                label="Student Full Name"
                placeholder="e.g. Elena Rostova"
                value={enrollName}
                onChange={(e) => setEnrollName(e.target.value)}
                required
              />

              <Input
                label="Institutional Email"
                type="email"
                placeholder="e.g. elena.rostova@cam.ac.uk"
                value={enrollEmail}
                onChange={(e) => setEnrollEmail(e.target.value)}
                required
              />

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                <Button variant="ghost" size="sm" type="button" onClick={() => setShowEnrollModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" isLoading={isEnrolling}>
                  Enroll Student
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
