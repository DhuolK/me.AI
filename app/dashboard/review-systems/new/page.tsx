"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

export default function NewReviewSystemPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [discipline, setDiscipline] = useState("Academic Research");
  const [audience, setAudience] = useState("Doctoral Candidates & Graduate Researchers");
  const [description, setDescription] = useState("");
  const [evaluationScope, setEvaluationScope] = useState("Chapters 1, 2, and 3.");
  const [ignoredScope, setIgnoredScope] = useState("Formatting margins and acknowledgements.");
  const [priceKes, setPriceKes] = useState(500);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // First get primary workspace
      const meRes = await fetch("/api/me");
      const meData = await meRes.json();
      const workspaceId = meData.primaryWorkspace?.id || "ws_thorne_academic";

      const res = await fetch("/api/review-systems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          name,
          discipline,
          audience,
          description,
          evaluationScope,
          ignoredScope,
          priceKes: Number(priceKes),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create Review System");

      router.push(`/dashboard/review-systems/${data.reviewSystem.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Creation failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/review-systems"
          className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Review Systems
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-serif font-medium text-zinc-900">
          Create New Review System
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Define your structured review methodology once, then publish an immutable version for distribution.
        </p>
      </div>

      <Card className="bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Review System Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Commercial Lease Risk Diagnostic"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Discipline / Domain"
              value={discipline}
              onChange={(e) => setDiscipline(e.target.value)}
              placeholder="e.g. Commercial Law"
              required
            />
            <Input
              label="Target Audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g. Tenants & Corporate Counsel"
              required
            />
          </div>

          <Textarea
            label="System Overview & Purpose"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this review evaluates and the standard of rigor it enforces..."
            rows={3}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Textarea
              label="What is Evaluated (Scope)"
              value={evaluationScope}
              onChange={(e) => setEvaluationScope(e.target.value)}
              placeholder="e.g. Indemnity clauses, termination triggers..."
              rows={2}
            />
            <Textarea
              label="What is Ignored"
              value={ignoredScope}
              onChange={(e) => setIgnoredScope(e.target.value)}
              placeholder="e.g. General layout, grammar formatting..."
              rows={2}
            />
          </div>

          <Input
            label="Per-Review Price (KES, 0 for Included)"
            type="number"
            value={priceKes}
            onChange={(e) => setPriceKes(Number(e.target.value))}
            min={0}
            step={50}
            hint="Clients pay via M-Pesa before evaluation. 0 makes this link included/free."
          />

          {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

          <div className="pt-4 border-t border-zinc-100 flex justify-end gap-3">
            <Link href="/dashboard/review-systems">
              <Button variant="ghost" size="md">
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
              <Sparkles className="h-4 w-4 mr-1.5" />
              Initialize Studio
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
