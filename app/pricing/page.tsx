import React from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-zinc-900 flex flex-col justify-between">
      {/* Top Nav */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-zinc-900 text-white font-mono font-bold text-xs flex items-center justify-center">
              me
            </div>
            <span className="font-semibold text-lg tracking-tight">me.AI</span>
            <span className="text-[10px] font-mono text-zinc-500 uppercase px-1.5 py-0.5 rounded border border-zinc-200">
              Pricing
            </span>
          </Link>

          <div className="flex items-center gap-4 text-xs font-medium">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="primary" size="sm">Studio Dashboard &rarr;</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-20 space-y-16">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge variant="brand">Predictable Infrastructure Pricing</Badge>
          <h1 className="text-4xl sm:text-5xl font-serif font-medium text-zinc-900">
            Professional Studio Plans
          </h1>
          <p className="text-sm text-zinc-600 leading-relaxed">
            Separate your workspace platform tier from client-charged reviews. Keep 100% of your earnings on Pro.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Starter Tier */}
          <Card className="p-8 bg-white space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-serif font-semibold text-zinc-900">Starter Academic</h3>
                  <p className="text-xs text-zinc-500 mt-1">For solo researchers and peer reviewers.</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-mono font-bold text-zinc-900">0</span>
                  <span className="text-xs text-zinc-400 font-mono block">KES / month</span>
                </div>
              </div>

              <ul className="space-y-3 text-xs text-zinc-700 pt-4 border-t border-zinc-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>1 Published Review System</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Up to 10 Structured Rules</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Public & Private Distribution Links</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>14-Day Document Retention</span>
                </li>
                <li className="flex items-center gap-2 text-zinc-400">
                  <span>• 10% platform take on client M-Pesa payments</span>
                </li>
              </ul>
            </div>

            <Link href="/dashboard" className="block w-full">
              <Button variant="outline" size="md" className="w-full">
                Get Started Free
              </Button>
            </Link>
          </Card>

          {/* Professional Studio Tier */}
          <Card className="p-8 bg-white space-y-6 flex flex-col justify-between ring-2 ring-zinc-900 shadow-lg relative">
            <div className="absolute -top-3 right-6">
              <Badge variant="brand">Most Popular</Badge>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-serif font-semibold text-zinc-900">Professional Studio</h3>
                  <p className="text-xs text-zinc-500 mt-1">For departments, legal counsel, and consulting practices.</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-mono font-bold text-zinc-900">2,900</span>
                  <span className="text-xs text-zinc-400 font-mono block">KES / month</span>
                </div>
              </div>

              <ul className="space-y-3 text-xs text-zinc-700 pt-4 border-t border-zinc-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span><strong>Unlimited</strong> Review Systems & Versions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span><strong>Unlimited</strong> Rules per System with Custom Severity</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Multi-Student Cohort Management & Weakness Analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span><strong>0% Platform Take</strong> — Keep 100% of Client Fees</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>90-Day Retention & Full Zero-Training Policy</span>
                </li>
              </ul>
            </div>

            <Link href="/dashboard/billing" className="block w-full">
              <Button variant="primary" size="md" className="w-full">
                Upgrade to Professional Studio &rarr;
              </Button>
            </Link>
          </Card>
        </div>
      </main>

      <footer className="border-t border-zinc-200 bg-white py-6 px-6 text-xs text-zinc-500 text-center font-mono">
        me.AI © 2026 — Professional Review Infrastructure
      </footer>
    </div>
  );
}
