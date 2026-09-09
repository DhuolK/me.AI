"use client";

import React, { useEffect, useState } from "react";
import {
  CreditCard,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Receipt,
  Download,
  Smartphone,
  ArrowDownLeft,
  Clock,
  X,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { LedgerEntry, Payout } from "@/lib/types/domain";

export default function BillingLedgerPage() {
  const [balanceKes, setBalanceKes] = useState(14500);
  const [currentPlan, setCurrentPlan] = useState("PRO");
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [workspaceId, setWorkspaceId] = useState<string>("ws_thorne_academic");
  const [isLoading, setIsLoading] = useState(true);

  // Payout Modal State
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(5000);
  const [payoutPhone, setPayoutPhone] = useState<string>("254712345678");
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);
  const [payoutError, setPayoutError] = useState<string | null>(null);
  const [payoutSuccess, setPayoutSuccess] = useState<string | null>(null);

  const loadBillingData = () => {
    fetch("/api/billing")
      .then((res) => res.json())
      .then((data) => {
        if (data.workspace?.id) setWorkspaceId(data.workspace.id);
        if (data.financialSummary?.currentBalanceKes !== undefined) {
          setBalanceKes(data.financialSummary.currentBalanceKes);
        } else if (data.balanceKes !== undefined) {
          setBalanceKes(data.balanceKes);
        }
        if (data.currentPlan?.tier) {
          setCurrentPlan(data.currentPlan.tier);
        } else if (data.currentPlan) {
          setCurrentPlan(data.currentPlan);
        }
        if (data.ledgerEntries) setLedgerEntries(data.ledgerEntries);
        if (data.payouts) setPayouts(data.payouts);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadBillingData();
  }, []);

  const handleSwitchPlan = async (tier: "FREE" | "PRO") => {
    try {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, targetTier: tier }),
      });
      if (res.ok) {
        setCurrentPlan(tier);
        loadBillingData();
      }
    } catch {}
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutError(null);
    setPayoutSuccess(null);
    setIsSubmittingPayout(true);

    try {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request_payout",
          workspaceId,
          amountKes: Number(payoutAmount),
          destinationPhone: payoutPhone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPayoutError(data.error || "Failed to process payout.");
      } else {
        setPayoutSuccess(
          `Payout of ${payoutAmount.toLocaleString()} KES successfully processed to ${payoutPhone}. Ref: ${
            data.payout?.mpesaB2CReference || "B2C_PROCESSED"
          }`
        );
        loadBillingData();
        setTimeout(() => {
          setShowPayoutModal(false);
          setPayoutSuccess(null);
        }, 2500);
      }
    } catch {
      setPayoutError("Network error occurred while submitting payout.");
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-medium text-zinc-900">Billing & Financial Ledger</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Double-entry financial accounting separating your platform workspace tier from client-paid review earnings.
        </p>
      </div>

      {/* Top Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 bg-white shadow-xs">
          <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            Available Review Payout Balance
          </div>
          <div className="text-3xl font-mono font-semibold text-zinc-900 mt-2">
            {balanceKes.toLocaleString()} <span className="text-sm text-zinc-500 font-sans">KES</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> M-Pesa B2C instant disbursement
            </span>
            <Button
              variant="primary"
              size="sm"
              className="text-xs"
              onClick={() => {
                setPayoutAmount(Math.min(5000, balanceKes));
                setShowPayoutModal(true);
              }}
              disabled={balanceKes <= 0}
            >
              Request Payout
            </Button>
          </div>
        </Card>

        <Card className="p-5 bg-white shadow-xs">
          <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            Client Review Revenue (30d)
          </div>
          <div className="text-3xl font-mono font-semibold text-zinc-900 mt-2">
            {ledgerEntries
              .filter((e) => e.category === "REVIEW_REVENUE")
              .reduce((sum, e) => sum + e.amountKes, 0)
              .toLocaleString() || "28,500"}{" "}
            <span className="text-sm text-zinc-500 font-sans">KES</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-3 flex items-center gap-1 font-mono">
            <span>
              {ledgerEntries.filter((e) => e.category === "REVIEW_REVENUE").length || 57} paid client evaluations processed
            </span>
          </div>
        </Card>

        <Card className="p-5 bg-zinc-900 text-white flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                Current Studio Tier
              </span>
              <Badge variant="brand">{currentPlan}</Badge>
            </div>
            <div className="text-xl font-semibold mt-2">Professional Workspace</div>
            <p className="text-xs text-zinc-400 mt-1">
              Unlimited review systems, custom rule engines, and multi-student cohort diagnostics.
            </p>
          </div>
          <div className="text-[11px] font-mono text-zinc-400 pt-3 border-t border-zinc-800">
            Next renewal: Oct 1, 2026 • 2,900 KES/mo
          </div>
        </Card>
      </div>

      {/* Subscription Plans Selector */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-zinc-900">Workspace Subscription Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Free Tier */}
          <Card className={`p-6 bg-white ${currentPlan === "FREE" ? "ring-2 ring-zinc-900" : ""}`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-zinc-900">Standard / Academic Starter</h3>
                <p className="text-xs text-zinc-500 mt-1">For independent reviewers experimenting with structured rules.</p>
              </div>
              <span className="font-mono text-lg font-semibold text-zinc-900">0 KES</span>
            </div>
            <ul className="mt-5 space-y-2.5 text-xs text-zinc-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> 1 Active Review System
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Up to 10 rules per system
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> 14-day document retention
              </li>
            </ul>
            <div className="mt-6 pt-4 border-t border-zinc-100">
              <Button
                variant={currentPlan === "FREE" ? "outline" : "primary"}
                size="sm"
                className="w-full text-xs"
                onClick={() => handleSwitchPlan("FREE")}
                disabled={currentPlan === "FREE"}
              >
                {currentPlan === "FREE" ? "Current Active Plan" : "Downgrade to Starter"}
              </Button>
            </div>
          </Card>

          {/* Pro Tier */}
          <Card className={`p-6 bg-white ${currentPlan === "PRO" ? "ring-2 ring-zinc-900 shadow-md" : ""}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-zinc-900">Professional Studio</h3>
                  <Badge variant="brand" size="sm">Recommended</Badge>
                </div>
                <p className="text-xs text-zinc-500 mt-1">For university departments, legal counsel, and professional evaluators.</p>
              </div>
              <div className="text-right">
                <span className="font-mono text-lg font-semibold text-zinc-900">2,900 KES</span>
                <span className="text-[10px] text-zinc-400 block font-mono">/ month</span>
              </div>
            </div>
            <ul className="mt-5 space-y-2.5 text-xs text-zinc-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Unlimited Review Systems & Versions
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Multi-Student Cohorts & Weakness Analytics
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> 90-day retention & Full Zero-Training Guarantee
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Automated M-Pesa client charge integration
              </li>
            </ul>
            <div className="mt-6 pt-4 border-t border-zinc-100">
              <Button
                variant={currentPlan === "PRO" ? "outline" : "primary"}
                size="sm"
                className="w-full text-xs"
                onClick={() => handleSwitchPlan("PRO")}
                disabled={currentPlan === "PRO"}
              >
                {currentPlan === "PRO" ? "Current Active Plan" : "Upgrade to Pro Studio"}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Double-Entry Ledger Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Double-Entry Accounting Ledger</h2>
            <p className="text-xs text-zinc-500">
              Immutable journal entries for review fees, platform commissions, and payout releases.
            </p>
          </div>
          <Badge variant="neutral" size="sm" className="font-mono">
            {ledgerEntries.length} Entries Recorded
          </Badge>
        </div>

        <Card className="p-0 overflow-hidden bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/75 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Entry ID</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4 text-right">Debit (KES)</th>
                  <th className="py-2.5 px-4 text-right">Credit (KES)</th>
                  <th className="py-2.5 px-4 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 font-mono">
                {ledgerEntries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-400 font-sans">
                      No financial transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  ledgerEntries.map((e) => (
                    <tr key={e.id} className="hover:bg-zinc-50/80">
                      <td className="py-3 px-4 font-semibold text-zinc-900">{e.id.substring(0, 16)}</td>
                      <td className="py-3 px-4 text-zinc-500">{new Date(e.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 font-sans">
                        <Badge
                          variant={
                            e.category === "REVIEW_REVENUE"
                              ? "success"
                              : e.category === "PAYOUT"
                              ? "brand"
                              : "neutral"
                          }
                          size="sm"
                        >
                          {e.category}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-sans text-zinc-700">{e.description}</td>
                      <td className="py-3 px-4 text-right text-rose-600 font-semibold">
                        {e.entryType === "DEBIT" ? `-${e.amountKes.toLocaleString()}` : "—"}
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-600 font-semibold">
                        {e.entryType === "CREDIT" ? `+${e.amountKes.toLocaleString()}` : "—"}
                      </td>
                      <td className="py-3 px-4 text-right text-zinc-900 font-bold">
                        {e.balanceAfterKes.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4 backdrop-blur-xs">
          <Card className="w-full max-w-md bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Smartphone className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">Request M-Pesa B2C Payout</h3>
                  <p className="text-[11px] text-zinc-500">Instant transfer directly to your verified phone number</p>
                </div>
              </div>
              <button
                onClick={() => setShowPayoutModal(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {payoutError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{payoutError}</span>
              </div>
            )}

            {payoutSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{payoutSuccess}</span>
              </div>
            )}

            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-xs">
                <div className="flex justify-between text-zinc-500">
                  <span>Available Balance:</span>
                  <span className="font-mono font-bold text-zinc-900">{balanceKes.toLocaleString()} KES</span>
                </div>
              </div>

              <Input
                label="Payout Amount (KES)"
                type="number"
                min={100}
                max={balanceKes}
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(Number(e.target.value))}
                required
              />

              <Input
                label="Destination M-Pesa Phone Number"
                placeholder="254712345678"
                value={payoutPhone}
                onChange={(e) => setPayoutPhone(e.target.value)}
                required
              />

              <div className="text-[11px] text-zinc-500 space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-600">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Double-entry debit will immediately be recorded in your ledger.</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  disabled={isSubmittingPayout}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={isSubmittingPayout || payoutAmount <= 0 || payoutAmount > balanceKes}
                >
                  {isSubmittingPayout ? "Processing Payout..." : `Disburse ${payoutAmount.toLocaleString()} KES`}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

