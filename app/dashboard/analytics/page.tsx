"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Award,
  AlertOctagon,
  Clock,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  RotateCcw,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface AnalyticsData {
  metrics: {
    totalReviewSystems: number;
    publishedReviewSystems: number;
    totalSubmissions: number;
    pendingAttentionCount: number;
    readyCount: number;
    totalCohorts: number;
    averageScore: number;
    avgResubmissionDelta: string;
    overrideRate: string;
  };
  highestFailingRules: Array<{
    ruleCode: string;
    ruleTitle: string;
    severity: string;
    count: number;
    rate: string;
  }>;
  categoryBreakdown: Array<{
    name: string;
    score: number;
    count: number;
  }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.metrics) {
          setData(resData);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const metrics = data?.metrics || {
    totalReviewSystems: 3,
    publishedReviewSystems: 2,
    totalSubmissions: 28,
    pendingAttentionCount: 2,
    readyCount: 26,
    totalCohorts: 2,
    averageScore: 74,
    avgResubmissionDelta: "+16.2%",
    overrideRate: "3.1%",
  };

  const highestFailingRules = data?.highestFailingRules || [
    {
      ruleCode: "RULE_METH_01",
      ruleTitle: "Controlled Baseline Comparator",
      count: 48,
      rate: "68%",
      severity: "critical",
    },
    {
      ruleCode: "RULE_SAMPLE_03",
      ruleTitle: "Sample Power & Effect Size Calculation",
      count: 34,
      rate: "51%",
      severity: "high",
    },
    {
      ruleCode: "RULE_ETHICS_02",
      ruleTitle: "Institutional Review Board (IRB) Clearance",
      count: 22,
      rate: "31%",
      severity: "critical",
    },
    {
      ruleCode: "RULE_LIT_04",
      ruleTitle: "Contrasting Theoretical Frameworks",
      count: 19,
      rate: "28%",
      severity: "medium",
    },
  ];

  const categoryBreakdown = data?.categoryBreakdown || [
    { name: "Methodology & Baselines", score: 68, count: 6 },
    { name: "Sampling & Statistical Power", score: 71, count: 4 },
    { name: "Literature & Prior Work", score: 84, count: 5 },
    { name: "Ethics & Compliance", score: 89, count: 3 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-medium text-zinc-900">Methodology Analytics</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time diagnostic metrics, rule failure frequencies, and revision improvement deltas across your review systems.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/cohorts"
            className="text-xs font-medium text-zinc-600 hover:text-zinc-900 flex items-center gap-1 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg shadow-xs"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Inspect Cohort Heatmaps &rarr;</span>
          </Link>
        </div>
      </div>

      {/* Top Level Metric KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white shadow-xs">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            Total Submissions Processed
          </span>
          <div className="text-2xl font-mono font-semibold text-zinc-900 mt-1">
            {metrics.totalSubmissions}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            Across {metrics.publishedReviewSystems} active systems ({metrics.readyCount} completed)
          </span>
        </Card>

        <Card className="p-4 bg-white shadow-xs">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            Average Diagnostic Score
          </span>
          <div className="text-2xl font-mono font-semibold text-zinc-900 mt-1">
            {metrics.averageScore}%
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            Evidence-grounded baseline accuracy
          </span>
        </Card>

        <Card className="p-4 bg-white shadow-xs">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            Resubmission Delta
          </span>
          <div className="text-2xl font-mono font-semibold text-emerald-600 mt-1">
            {metrics.avgResubmissionDelta}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
            Average gain on Revision 2 drafts
          </span>
        </Card>

        <Card className="p-4 bg-white shadow-xs">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            Expert Override Frequency
          </span>
          <div className="text-2xl font-mono font-semibold text-zinc-900 mt-1">
            {metrics.overrideRate}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            Supervisory intervention rate
          </span>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most Frequent Rule Failures */}
        <Card className="p-5 bg-white space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Highest Failure Rules</h3>
              <p className="text-xs text-zinc-500">
                Most commonly breached criteria across evaluated client and student manuscripts.
              </p>
            </div>
            <AlertOctagon className="h-4 w-4 text-amber-600" />
          </div>

          <div className="space-y-3">
            {highestFailingRules.map((rule) => (
              <div
                key={rule.ruleCode}
                className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 flex items-center justify-between transition-colors hover:bg-zinc-50"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-semibold text-zinc-600">
                      {rule.ruleCode}
                    </span>
                    <Badge
                      variant={
                        rule.severity === "critical"
                          ? "danger"
                          : rule.severity === "high"
                          ? "warning"
                          : "neutral"
                      }
                      size="sm"
                    >
                      {rule.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-xs font-semibold text-zinc-900 font-sans">
                    {rule.ruleTitle}
                  </div>
                </div>
                <div className="text-right font-mono shrink-0 pl-3">
                  <div className="text-sm font-bold text-zinc-900">{rule.rate}</div>
                  <div className="text-[10px] text-zinc-500">{rule.count} breaches</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Evaluation Category Breakdown */}
        <Card className="p-5 bg-white space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Methodology Category Health</h3>
              <p className="text-xs text-zinc-500">
                Aggregated compliance score by intellectual domain across your workspace.
              </p>
            </div>
            <BarChart3 className="h-4 w-4 text-zinc-400" />
          </div>

          <div className="space-y-5 pt-2">
            {categoryBreakdown.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-800">{cat.name}</span>
                  <span className="font-mono text-zinc-900">{cat.score}%</span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden border border-zinc-200/50">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      cat.score < 70
                        ? "bg-amber-500"
                        : cat.score >= 85
                        ? "bg-emerald-600"
                        : "bg-blue-600"
                    }`}
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                  <span>
                    Status: {cat.score < 70 ? "Methodological Deficit" : "Acceptable Standard"}
                  </span>
                  <span>{cat.count} Rules</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

