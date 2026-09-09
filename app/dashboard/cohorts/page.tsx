"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  BookOpen,
  Calendar,
  AlertCircle,
  TrendingUp,
  BarChart2,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, Textarea } from "@/components/ui/Input";
import { Cohort, CohortMember } from "@/lib/types/domain";

export default function CohortsPage() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null);
  const [members, setMembers] = useState<CohortMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Modal Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("2026-09-01");
  const [endDate, setEndDate] = useState("2026-12-15");

  const loadCohorts = () => {
    fetch("/api/cohorts")
      .then((res) => res.json())
      .then((data) => {
        if (data.cohorts && data.cohorts.length > 0) {
          setCohorts(data.cohorts);
          setSelectedCohort(data.cohorts[0]);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadCohorts();
  }, []);

  useEffect(() => {
    if (selectedCohort) {
      fetch(`/api/cohorts/${selectedCohort.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.members) setMembers(data.members);
        })
        .catch(() => {});
    }
  }, [selectedCohort]);

  const handleCreateCohort = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const meRes = await fetch("/api/me");
      const meData = await meRes.json();
      const workspaceId = meData.primaryWorkspace?.id || "ws_thorne_academic";

      const res = await fetch("/api/cohorts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          name,
          description,
          reviewSystemId: "rs_thorne_phd_diagnostic",
          startDate,
          endDate,
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setName("");
        setDescription("");
        loadCohorts();
      }
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-medium text-zinc-900">Cohort Management</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Group student researchers or institutional cohorts for batch reviews, progress benchmarks, and weakness diagnostics.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Create Cohort
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left: Cohort Selector */}
        <div className="col-span-12 md:col-span-4 space-y-3">
          <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider px-1">
            Active Cohorts
          </div>

          <div className="space-y-2">
            {cohorts.map((cohort) => {
              const isSelected = selectedCohort?.id === cohort.id;
              return (
                <div
                  key={cohort.id}
                  onClick={() => setSelectedCohort(cohort)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-white border-zinc-900 shadow-sm ring-1 ring-zinc-900"
                      : "bg-white border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-900">{cohort.name}</h3>
                    <Badge variant="success" size="sm">
                      ACTIVE
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{cohort.description}</p>
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mt-3 pt-2 border-t border-zinc-100">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Ends Dec 2026
                    </span>
                    <span>12 Participants</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Cohort Analytics & Roster */}
        <div className="col-span-12 md:col-span-8 space-y-5">
          {selectedCohort ? (
            <>
              {/* Cohort Summary Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Card className="p-4 bg-white">
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                    Average Score
                  </span>
                  <div className="text-2xl font-mono font-semibold text-zinc-900 mt-1">74.2%</div>
                  <span className="text-[11px] text-emerald-600 font-medium">+8.4% on revision</span>
                </Card>
                <Card className="p-4 bg-white">
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                    Total Submissions
                  </span>
                  <div className="text-2xl font-mono font-semibold text-zinc-900 mt-1">28</div>
                  <span className="text-[11px] text-zinc-500 font-mono">12 students enrolled</span>
                </Card>
                <Card className="p-4 bg-white">
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                    Common Weakness
                  </span>
                  <div className="text-sm font-semibold text-amber-700 mt-1 line-clamp-1">
                    Baseline Comparators
                  </div>
                  <span className="text-[11px] text-zinc-500">Failed in 64% of drafts</span>
                </Card>
              </div>

              {/* Roster Table */}
              <Card className="p-0 overflow-hidden bg-white shadow-sm">
                <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
                  <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                    Enrolled Researchers Roster
                  </h3>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/cohorts/${selectedCohort.id}`}
                      className="text-xs font-medium text-zinc-900 hover:text-indigo-600 underline"
                    >
                      Open Full Analytics & Weakness Heatmap &rarr;
                    </Link>
                    <Badge variant="brand" size="sm">
                      {members.length > 0 ? members.length : "12"} Students
                    </Badge>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-200 bg-zinc-50/75 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                        <th className="py-2.5 px-4">Student Name</th>
                        <th className="py-2.5 px-4">Institutional Email</th>
                        <th className="py-2.5 px-4">Submissions</th>
                        <th className="py-2.5 px-4">Latest Score</th>
                        <th className="py-2.5 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 font-mono">
                      {members.length === 0 ? (
                        <>
                          <tr className="hover:bg-zinc-50/80">
                            <td className="py-3 px-4 font-sans font-semibold text-zinc-900">
                              Elena Rostova
                            </td>
                            <td className="py-3 px-4 text-zinc-600">e.rostova@cam.ac.uk</td>
                            <td className="py-3 px-4 text-zinc-800">2 (Rev 2)</td>
                            <td className="py-3 px-4 font-semibold text-emerald-600">86.0%</td>
                            <td className="py-3 px-4 text-right font-sans">
                              <Badge variant="success" size="sm">Passed</Badge>
                            </td>
                          </tr>
                          <tr className="hover:bg-zinc-50/80">
                            <td className="py-3 px-4 font-sans font-semibold text-zinc-900">
                              Marcus Vance
                            </td>
                            <td className="py-3 px-4 text-zinc-600">m.vance@stanford.edu</td>
                            <td className="py-3 px-4 text-zinc-800">1 (Rev 1)</td>
                            <td className="py-3 px-4 font-semibold text-amber-600">62.5%</td>
                            <td className="py-3 px-4 text-right font-sans">
                              <Badge variant="warning" size="sm">Needs Revision</Badge>
                            </td>
                          </tr>
                          <tr className="hover:bg-zinc-50/80">
                            <td className="py-3 px-4 font-sans font-semibold text-zinc-900">
                              Tariq Al-Mansoor
                            </td>
                            <td className="py-3 px-4 text-zinc-600">tariq.mansoor@ox.ac.uk</td>
                            <td className="py-3 px-4 text-zinc-800">3 (Rev 3)</td>
                            <td className="py-3 px-4 font-semibold text-emerald-600">91.0%</td>
                            <td className="py-3 px-4 text-right font-sans">
                              <Badge variant="success" size="sm">Passed</Badge>
                            </td>
                          </tr>
                        </>
                      ) : (
                        members.map((m) => (
                          <tr key={m.id} className="hover:bg-zinc-50/80">
                            <td className="py-3 px-4 font-sans font-semibold text-zinc-900">
                              {m.name || "Student Participant"}
                            </td>
                            <td className="py-3 px-4 text-zinc-600">{m.email}</td>
                            <td className="py-3 px-4 text-zinc-800">1</td>
                            <td className="py-3 px-4 font-semibold text-zinc-900">78.0%</td>
                            <td className="py-3 px-4 text-right font-sans">
                              <Badge variant="success" size="sm">Active</Badge>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-12 text-center text-xs text-zinc-400">
              Select or create a cohort to inspect roster and aggregate methodology metrics.
            </Card>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4">
          <Card className="w-full max-w-lg bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-base font-semibold text-zinc-900">Create New Institutional Cohort</h3>

            <form onSubmit={handleCreateCohort} className="space-y-3">
              <Input
                label="Cohort Name"
                placeholder="e.g. Fall 2026 Doctoral Methodology Seminar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Textarea
                label="Cohort Description & Objectives"
                placeholder="Specify the group purpose, timeline, and thesis milestones..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
                <Input
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                <Button variant="ghost" size="sm" type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Save & Initialize Cohort
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
