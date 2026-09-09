"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Layers, ArrowUpRight, Copy, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ReviewSystem } from "@/lib/types/domain";

export default function ReviewSystemsIndexPage() {
  const [systems, setSystems] = useState<ReviewSystem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/review-systems")
      .then((res) => res.json())
      .then((data) => {
        if (data.reviewSystems) setSystems(data.reviewSystems);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleCopyLink = (token: string, id: string) => {
    const url = `${window.location.origin}/review/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-medium text-zinc-900">Review Systems</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Reusable evaluation engines containing structured rules, immutable versions, and distribution links.
          </p>
        </div>
        <Link href="/dashboard/review-systems/new">
          <Button variant="primary" size="sm">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Create Review System
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {systems.map((system) => (
          <Card key={system.id} className="flex flex-col justify-between hover:border-zinc-300 transition-all p-5">
            <div>
              <div className="flex items-center justify-between gap-2">
                <Badge variant={system.status === "published" ? "success" : "warning"}>
                  {system.status.toUpperCase()}
                </Badge>
                <span className="font-mono text-xs font-semibold text-zinc-900">
                  {system.priceKes === 0 ? "Included" : `${system.priceKes} KES`}
                </span>
              </div>

              <h2 className="text-sm font-semibold text-zinc-900 mt-3 line-clamp-1">{system.name}</h2>
              <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{system.description}</p>

              <div className="mt-4 space-y-1.5 text-[11px] font-mono text-zinc-500 border-t border-zinc-100 pt-3">
                <div className="flex justify-between">
                  <span>Discipline:</span>
                  <span className="text-zinc-800 font-sans truncate max-w-[140px]">{system.discipline}</span>
                </div>
                <div className="flex justify-between">
                  <span>Version:</span>
                  <span className="text-zinc-800">1.0.0</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-zinc-100 flex items-center justify-between">
              <Link href={`/dashboard/review-systems/${system.id}`}>
                <Button variant="outline" size="sm" className="text-xs">
                  Studio Rules &rarr;
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyLink("thorne-phd-review-2026", system.id)}
                className="text-xs text-zinc-600"
              >
                {copiedId === system.id ? (
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
  );
}
