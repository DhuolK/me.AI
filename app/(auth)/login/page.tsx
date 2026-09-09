"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (targetEmail?: string) => {
    setIsLoading(true);
    setError("");
    try {
      const emailToUse = targetEmail || email;
      if (!emailToUse) {
        setError("Please enter your professional email");
        setIsLoading(false);
        return;
      }

      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToUse }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-zinc-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white font-mono font-bold text-sm">
              me
            </div>
            <span className="font-semibold text-xl tracking-tight text-zinc-900">me.AI</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl font-serif text-zinc-900">
          Professional Review Infrastructure
        </h2>
        <p className="mt-2 text-center text-xs text-zinc-500">
          Sign in to manage review systems, rules, cohorts, and client reports.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="bg-white px-6 py-8 shadow-sm sm:rounded-xl sm:px-10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-4"
          >
            <Input
              label="Professional Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. aris.thorne@graduate.edu"
              error={error}
              required
            />

            <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
              Sign In to Workspace
            </Button>
          </form>

          <div className="mt-6 border-t border-zinc-200 pt-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Multi-Role Test Accounts
              </p>
              <span className="text-[10px] font-mono text-zinc-400">Instant Switch</span>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleLogin("admin@meai.internal")}
                className="w-full text-left p-2.5 rounded-lg border border-purple-200 bg-purple-50/40 hover:bg-purple-50 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-zinc-900">System Administrator</span>
                    <span className="text-[9px] font-mono uppercase bg-purple-100 text-purple-700 px-1 py-0.2 rounded border border-purple-200 font-bold">
                      Platform Admin
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono">admin@meai.internal • Global Workspace Oversight</div>
                </div>
                <span className="text-xs text-purple-700 font-semibold font-mono">Sign In &rarr;</span>
              </button>

              <button
                type="button"
                onClick={() => handleLogin("aris.thorne@graduate.edu")}
                className="w-full text-left p-2.5 rounded-lg border border-blue-200 bg-blue-50/40 hover:bg-blue-50 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-zinc-900">Dr. Aris Thorne</span>
                    <span className="text-[9px] font-mono uppercase bg-blue-100 text-blue-700 px-1 py-0.2 rounded border border-blue-200 font-bold">
                      Workspace Owner
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono">aris.thorne@graduate.edu • Systems Research Lab</div>
                </div>
                <span className="text-xs text-blue-700 font-semibold font-mono">Sign In &rarr;</span>
              </button>

              <button
                type="button"
                onClick={() => handleLogin("marcus.fellow@graduate.edu")}
                className="w-full text-left p-2.5 rounded-lg border border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-zinc-900">Dr. Marcus Fellow</span>
                    <span className="text-[9px] font-mono uppercase bg-indigo-100 text-indigo-700 px-1 py-0.2 rounded border border-indigo-200 font-bold">
                      Collaborator
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono">marcus.fellow@graduate.edu • Academic Methodology Reviewer</div>
                </div>
                <span className="text-xs text-indigo-700 font-semibold font-mono">Sign In &rarr;</span>
              </button>

              <button
                type="button"
                onClick={() => handleLogin("karen.m@nairobilaw.co.ke")}
                className="w-full text-left p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-zinc-900">Adv. Karen Mwangi</span>
                    <span className="text-[9px] font-mono uppercase bg-emerald-100 text-emerald-700 px-1 py-0.2 rounded border border-emerald-200 font-bold">
                      Workspace Owner
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono">karen.m@nairobilaw.co.ke • Commercial Review & M-Pesa</div>
                </div>
                <span className="text-xs text-emerald-700 font-semibold font-mono">Sign In &rarr;</span>
              </button>

              <button
                type="button"
                onClick={() => handleLogin("elena.rostova@cam.ac.uk")}
                className="w-full text-left p-2.5 rounded-lg border border-zinc-200 bg-zinc-50/60 hover:bg-zinc-100 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-zinc-900">Elena Rostova</span>
                    <span className="text-[9px] font-mono uppercase bg-zinc-200 text-zinc-700 px-1 py-0.2 rounded border border-zinc-300 font-bold">
                      Guest Client
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono">elena.rostova@cam.ac.uk • Student Review Client</div>
                </div>
                <span className="text-xs text-zinc-700 font-semibold font-mono">Sign In &rarr;</span>
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
