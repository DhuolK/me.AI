"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Lock,
  Unlock,
  Share2,
  Check,
  Copy,
  GitBranch,
  Trash2,
  AlertTriangle,
  History,
  Sparkles,
  Layers,
  ChevronDown,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, Textarea } from "@/components/ui/Input";
import { ReviewSystem, ReviewSystemVersion, ReviewRule, DistributionLink } from "@/lib/types/domain";

export default function ReviewSystemStudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [reviewSystem, setReviewSystem] = useState<ReviewSystem | null>(null);
  const [currentVersion, setCurrentVersion] = useState<ReviewSystemVersion | null>(null);
  const [allVersions, setAllVersions] = useState<ReviewSystemVersion[]>([]);
  const [distributionLinks, setDistributionLinks] = useState<DistributionLink[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"rules" | "distribution" | "overview">("rules");
  const [isLoading, setIsLoading] = useState(true);

  // Branching & Publishing Modal States
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [branchVersionNumber, setBranchVersionNumber] = useState("");
  const [branchChangelog, setBranchChangelog] = useState("");
  const [isBranching, setIsBranching] = useState(false);

  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishVersionNumber, setPublishVersionNumber] = useState("");
  const [publishChangelog, setPublishChangelog] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  // New Rule Modal state
  const [showNewRule, setShowNewRule] = useState(false);
  const [newRuleCode, setNewRuleCode] = useState("");
  const [newRuleTitle, setNewRuleTitle] = useState("");
  const [newRuleCategory, setNewRuleCategory] = useState("Methodology");
  const [newRuleRequirement, setNewRuleRequirement] = useState("");
  const [newRuleRecommendation, setNewRuleRecommendation] = useState("");
  const [newRuleSeverity, setNewRuleSeverity] = useState<"critical" | "high" | "medium" | "low">("critical");
  const [isDeletingRule, setIsDeletingRule] = useState<string | null>(null);

  const loadData = () => {
    fetch(`/api/review-systems/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.reviewSystem) {
          setReviewSystem(data.reviewSystem);
          setCurrentVersion(data.currentVersion);
          setAllVersions(data.versions || [data.currentVersion]);
          setDistributionLinks(data.distributionLinks || []);
          if (data.currentVersion?.rules?.length > 0 && !selectedRuleId) {
            setSelectedRuleId(data.currentVersion.rules[0].id);
          }
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}/review/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleSwitchVersion = async (targetVersionId: string) => {
    try {
      const res = await fetch(`/api/review-systems/${id}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "switch_active",
          versionId: targetVersionId,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentVersion(data.version);
        if (data.version.rules?.length > 0) {
          setSelectedRuleId(data.version.rules[0].id);
        }
        loadData();
      }
    } catch {}
  };

  const handleBranchVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVersion) return;
    setIsBranching(true);
    try {
      const res = await fetch(`/api/review-systems/${id}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "branch_version",
          versionId: currentVersion.id,
          versionNumber: branchVersionNumber || undefined,
          changelog: branchChangelog || undefined,
        }),
      });
      if (res.ok) {
        setShowBranchModal(false);
        setBranchVersionNumber("");
        setBranchChangelog("");
        loadData();
      }
    } catch {}
    setIsBranching(false);
  };

  const handlePublishVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVersion) return;
    setIsPublishing(true);
    try {
      const res = await fetch(`/api/review-systems/${id}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "publish",
          versionId: currentVersion.id,
          versionNumber: publishVersionNumber || currentVersion.versionNumber.replace(/-draft.*$/, ""),
          changelog: publishChangelog || currentVersion.changelog,
        }),
      });
      if (res.ok) {
        setShowPublishModal(false);
        setPublishVersionNumber("");
        setPublishChangelog("");
        loadData();
      }
    } catch {}
    setIsPublishing(false);
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!currentVersion || currentVersion.isImmutable) return;
    setIsDeletingRule(ruleId);
    try {
      const res = await fetch(
        `/api/review-systems/${id}/rules?versionId=${currentVersion.id}&ruleId=${ruleId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        loadData();
      }
    } catch {}
    setIsDeletingRule(null);
  };

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVersion || currentVersion.isImmutable) return;

    try {
      const res = await fetch(`/api/review-systems/${id}/rules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          versionId: currentVersion.id,
          rule: {
            code: newRuleCode || `RULE_${currentVersion.rules.length + 1}`,
            title: newRuleTitle,
            category: newRuleCategory,
            requirement: newRuleRequirement,
            recommendation: newRuleRecommendation,
            severity: newRuleSeverity,
            ruleType: "required",
            applicableSection: "All",
            evidenceRequirement: "required",
            failureAction: "flag",
            weight: 7,
          },
        }),
      });

      if (res.ok) {
        setShowNewRule(false);
        setNewRuleTitle("");
        setNewRuleRequirement("");
        setNewRuleRecommendation("");
        loadData();
      }
    } catch {}
  };

  if (isLoading || !reviewSystem || !currentVersion) {
    return (
      <div className="py-20 text-center text-xs font-mono text-zinc-500">
        Loading Review System Studio...
      </div>
    );
  }

  const categories = ["All", ...Array.from(new Set(currentVersion.rules.map((r) => r.category)))];
  const filteredRules =
    selectedCategory === "All"
      ? currentVersion.rules
      : currentVersion.rules.filter((r) => r.category === selectedCategory);

  const selectedRule = currentVersion.rules.find((r) => r.id === selectedRuleId) || currentVersion.rules[0];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-zinc-200">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard/review-systems"
              className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 font-medium mr-2"
            >
              <ArrowLeft className="h-3 w-3" /> Systems
            </Link>

            {/* Version Switcher Dropdown */}
            <div className="inline-flex items-center gap-1 bg-zinc-100 border border-zinc-200 rounded-lg px-2 py-0.5">
              <span className="text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-wider">
                Ver:
              </span>
              <select
                value={currentVersion.id}
                onChange={(e) => handleSwitchVersion(e.target.value)}
                className="bg-transparent text-xs font-mono font-semibold text-zinc-800 focus:outline-none cursor-pointer py-0.5 pr-1"
              >
                {allVersions.map((v) => (
                  <option key={v.id} value={v.id}>
                    v{v.versionNumber} {v.isImmutable ? "🔒 (Locked)" : "✏️ (Draft)"}
                  </option>
                ))}
              </select>
            </div>

            <Badge variant={currentVersion.isImmutable ? "success" : "warning"}>
              {currentVersion.isImmutable ? (
                <span className="flex items-center gap-1">
                  <Lock className="h-2.5 w-2.5" /> Immutable
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Unlock className="h-2.5 w-2.5" /> Editable Draft
                </span>
              )}
            </Badge>

            <Badge variant="brand">{reviewSystem.discipline}</Badge>
          </div>

          <h1 className="text-xl font-serif font-semibold text-zinc-900">{reviewSystem.name}</h1>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {currentVersion.isImmutable ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const clean = currentVersion.versionNumber.replace(/-draft.*$/, "");
                const parts = clean.split(".").map(Number);
                const nextSuggested =
                  parts.length === 3 && !parts.some(isNaN)
                    ? `${parts[0]}.${parts[1] + 1}.0-draft`
                    : `${clean}.1-draft`;
                setBranchVersionNumber(nextSuggested);
                setBranchChangelog(`Branching from v${currentVersion.versionNumber} to refine rule specifications.`);
                setShowBranchModal(true);
              }}
            >
              <GitBranch className="h-3.5 w-3.5 mr-1.5 text-zinc-600" />
              Branch New Draft Version
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setPublishVersionNumber(currentVersion.versionNumber.replace(/-draft.*$/, ""));
                setPublishChangelog(currentVersion.changelog || "Production release version.");
                setShowPublishModal(true);
              }}
            >
              <Lock className="h-3.5 w-3.5 mr-1.5" />
              Publish Immutable Version
            </Button>
          )}

          {distributionLinks[0] && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopyLink(distributionLinks[0].token)}
            >
              {copiedToken ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-600" /> Link Copied
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5 mr-1.5 text-zinc-400" /> Share Review Link
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Immutable Notice Banner */}
      {currentVersion.isImmutable && (
        <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-zinc-600 font-mono">
            <Lock className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              Version <strong>v{currentVersion.versionNumber}</strong> is locked and immutable. To modify rules without altering active client evaluations, branch a new draft.
            </span>
          </div>
          <button
            onClick={() => setShowBranchModal(true)}
            className="text-[11px] font-mono font-semibold text-zinc-900 hover:underline shrink-0 ml-3"
          >
            Branch Draft &rarr;
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("rules")}
          className={`pb-2.5 px-3 border-b-2 transition-colors ${
            activeTab === "rules"
              ? "border-zinc-900 text-zinc-900"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          Structured Rules ({currentVersion.rules.length})
        </button>
        <button
          onClick={() => setActiveTab("distribution")}
          className={`pb-2.5 px-3 border-b-2 transition-colors ${
            activeTab === "distribution"
              ? "border-zinc-900 text-zinc-900"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          Distribution & Access ({distributionLinks.length})
        </button>
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-2.5 px-3 border-b-2 transition-colors ${
            activeTab === "overview"
              ? "border-zinc-900 text-zinc-900"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          Scope & Settings
        </button>
      </div>

      {activeTab === "rules" && (
        <div className="grid grid-cols-12 gap-5 min-h-[580px]">
          {/* Left Column: Categories */}
          <div className="col-span-12 md:col-span-3 space-y-3">
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider px-1">
              Methodology Categories
            </div>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedCategory === cat
                      ? "bg-zinc-900 text-white shadow-sm"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                >
                  <span>{cat}</span>
                  <span className="text-[10px] font-mono opacity-70">
                    {cat === "All"
                      ? currentVersion.rules.length
                      : currentVersion.rules.filter((r) => r.category === cat).length}
                  </span>
                </button>
              ))}
            </div>

            {!currentVersion.isImmutable && (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs mt-4"
                onClick={() => setShowNewRule(true)}
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Rule
              </Button>
            )}
          </div>

          {/* Center Column: Rules List */}
          <div className="col-span-12 md:col-span-4 space-y-2.5 overflow-y-auto max-h-[620px] pr-1">
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider px-1 flex items-center justify-between">
              <span>Rules in {selectedCategory}</span>
              <span className="text-[10px] font-mono">{filteredRules.length} rules</span>
            </div>

            {filteredRules.map((rule) => {
              const isSelected = selectedRule?.id === rule.id;
              return (
                <div
                  key={rule.id}
                  onClick={() => setSelectedRuleId(rule.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-white border-zinc-900 shadow-sm ring-1 ring-zinc-900"
                      : "bg-white border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-semibold text-zinc-500">
                      {rule.code}
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
                  <h3 className="text-xs font-semibold text-zinc-900 mt-1.5 line-clamp-1">
                    {rule.title}
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2">{rule.requirement}</p>
                </div>
              );
            })}
          </div>

          {/* Right Column: Selected Rule Inspector / Deep Editor */}
          <div className="col-span-12 md:col-span-5">
            {selectedRule ? (
              <Card className="p-6 bg-white space-y-5 sticky top-6">
                <div className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-4">
                  <div>
                    <span className="font-mono text-xs font-semibold text-zinc-400">
                      {selectedRule.code}
                    </span>
                    <h2 className="text-base font-semibold text-zinc-900 mt-0.5">
                      {selectedRule.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        selectedRule.severity === "critical"
                          ? "danger"
                          : selectedRule.severity === "high"
                          ? "warning"
                          : "neutral"
                      }
                    >
                      {selectedRule.severity.toUpperCase()}
                    </Badge>
                    {!currentVersion.isImmutable && (
                      <button
                        onClick={() => handleDeleteRule(selectedRule.id)}
                        disabled={isDeletingRule === selectedRule.id}
                        className="p-1 text-zinc-400 hover:text-rose-600 rounded transition-colors"
                        title="Delete rule from draft"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <div className="font-semibold text-zinc-500 uppercase tracking-wider text-[10px] mb-1">
                      Rule Type & Scope
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <Badge variant="outline">{selectedRule.ruleType}</Badge>
                      <span className="text-zinc-500">Applies to:</span>
                      <span className="text-zinc-800 font-medium">
                        {selectedRule.applicableSection}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="font-semibold text-zinc-500 uppercase tracking-wider text-[10px] mb-1">
                      Requirement Specification
                    </div>
                    <p className="text-zinc-800 bg-zinc-50 p-3 rounded-lg border border-zinc-200/70 leading-relaxed font-mono text-[11px]">
                      {selectedRule.requirement}
                    </p>
                  </div>

                  <div>
                    <div className="font-semibold text-zinc-500 uppercase tracking-wider text-[10px] mb-1">
                      Failure Remediation Recommendation
                    </div>
                    <p className="text-zinc-700 bg-blue-50/50 p-3 rounded-lg border border-blue-200/60 leading-relaxed">
                      {selectedRule.recommendation}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                    <span>Failure Action: {selectedRule.failureAction}</span>
                    <span>Evidence: {selectedRule.evidenceRequirement}</span>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center text-xs text-zinc-400">
                Select a rule from the list to inspect specifications.
              </Card>
            )}
          </div>
        </div>
      )}

      {activeTab === "distribution" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Active Distribution Endpoints</h3>
              <p className="text-xs text-zinc-500">
                Links connect clients to this immutable review system version.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {distributionLinks.map((link) => (
              <Card key={link.id} className="p-5 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={link.accessMode === "PAID" ? "brand" : "success"}>
                    {link.accessMode}
                  </Badge>
                  <span className="font-mono text-xs font-semibold text-zinc-900">
                    {link.priceKes === 0 ? "Free / Included" : `${link.priceKes} KES`}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-zinc-900">{link.name}</h4>
                  <p className="text-xs font-mono text-zinc-400 mt-1">Token: {link.token}</p>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-zinc-500">
                    {link.usageCount} submissions
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyLink(link.token)}
                    className="text-xs"
                  >
                    {copiedToken === link.token ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600 mr-1" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1 text-zinc-400" /> Copy Client Link
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === "overview" && (
        <Card className="p-6 bg-white space-y-4 max-w-2xl">
          <h3 className="text-sm font-semibold text-zinc-900">Scope and Retention Configuration</h3>
          <div className="space-y-3 text-xs">
            <div>
              <span className="font-semibold text-zinc-500 uppercase tracking-wider text-[10px] block mb-1">
                Evaluation Scope
              </span>
              <p className="text-zinc-800 bg-zinc-50 p-2.5 rounded border border-zinc-200">
                {reviewSystem.evaluationScope}
              </p>
            </div>
            <div>
              <span className="font-semibold text-zinc-500 uppercase tracking-wider text-[10px] block mb-1">
                Ignored Scope
              </span>
              <p className="text-zinc-800 bg-zinc-50 p-2.5 rounded border border-zinc-200">
                {reviewSystem.ignoredScope}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Branch Version Modal */}
      {showBranchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4">
          <Card className="w-full max-w-md bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-zinc-900">
              <GitBranch className="h-5 w-5 text-indigo-600" />
              <h3 className="text-base font-semibold">Branch New Draft Version</h3>
            </div>
            <p className="text-xs text-zinc-500">
              Creates an editable draft version pre-populated with all rules from <strong>v{currentVersion.versionNumber}</strong>. Existing client submissions stay locked to their original version.
            </p>

            <form onSubmit={handleBranchVersion} className="space-y-3">
              <Input
                label="Target Draft Version Tag"
                placeholder="e.g. 1.1.0-draft"
                value={branchVersionNumber}
                onChange={(e) => setBranchVersionNumber(e.target.value)}
                required
              />

              <Textarea
                label="Branch Changelog & Intent"
                placeholder="Describe what changes or rules will be introduced in this version..."
                value={branchChangelog}
                onChange={(e) => setBranchChangelog(e.target.value)}
                rows={3}
                required
              />

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                <Button variant="ghost" size="sm" type="button" onClick={() => setShowBranchModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" isLoading={isBranching}>
                  Create Draft Version
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Publish Immutable Version Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4">
          <Card className="w-full max-w-md bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-zinc-900">
              <Lock className="h-5 w-5 text-emerald-600" />
              <h3 className="text-base font-semibold">Publish Immutable Release</h3>
            </div>
            <p className="text-xs text-zinc-500">
              Publishing locks this version permanently. Once published, its rules cannot be edited or deleted, ensuring reliable, reproducible client evaluations.
            </p>

            <form onSubmit={handlePublishVersion} className="space-y-3">
              <Input
                label="Release Version Tag"
                placeholder="e.g. 1.0.0 or 1.1.0"
                value={publishVersionNumber}
                onChange={(e) => setPublishVersionNumber(e.target.value)}
                required
              />

              <Textarea
                label="Release Notes & Changelog"
                placeholder="Summary of structured rules, thresholds, and methodology changes..."
                value={publishChangelog}
                onChange={(e) => setPublishChangelog(e.target.value)}
                rows={3}
                required
              />

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                <Button variant="ghost" size="sm" type="button" onClick={() => setShowPublishModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" isLoading={isPublishing}>
                  Confirm & Publish
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* New Rule Modal */}
      {showNewRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4">
          <Card className="w-full max-w-lg bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-base font-semibold text-zinc-900">Add Structured Evaluation Rule</h3>

            <form onSubmit={handleAddRule} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Rule Code"
                  placeholder="e.g. RULE_METH_02"
                  value={newRuleCode}
                  onChange={(e) => setNewRuleCode(e.target.value)}
                />
                <Input
                  label="Category"
                  placeholder="e.g. Methodology"
                  value={newRuleCategory}
                  onChange={(e) => setNewRuleCategory(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Rule Title"
                placeholder="e.g. Missing Controlled Baselines"
                value={newRuleTitle}
                onChange={(e) => setNewRuleTitle(e.target.value)}
                required
              />

              <Textarea
                label="Requirement"
                placeholder="Specify the exact condition that must be satisfied in the text..."
                value={newRuleRequirement}
                onChange={(e) => setNewRuleRequirement(e.target.value)}
                rows={2}
                required
              />

              <Textarea
                label="Actionable Recommendation"
                placeholder="Instruct the author on how to remediate the defect..."
                value={newRuleRecommendation}
                onChange={(e) => setNewRuleRecommendation(e.target.value)}
                rows={2}
                required
              />

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                <Button variant="ghost" size="sm" type="button" onClick={() => setShowNewRule(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Save Rule to Draft
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
