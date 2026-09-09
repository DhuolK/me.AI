"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  FileText,
  Users,
  BarChart3,
  CreditCard,
  LogOut,
  ShieldCheck,
  UserCheck,
  Building2,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { User, Workspace } from "@/lib/types/domain";

const DEMO_ACCOUNTS = [
  {
    id: "usr_platform_admin",
    name: "System Administrator",
    email: "admin@meai.internal",
    role: "platform_admin",
    label: "Platform Admin",
    badgeVariant: "brand",
  },
  {
    id: "usr_thorne_01",
    name: "Dr. Aris Thorne",
    email: "aris.thorne@graduate.edu",
    role: "workspace_owner",
    label: "Workspace Owner",
    badgeVariant: "brand",
  },
  {
    id: "usr_marcus_fellow",
    name: "Dr. Marcus Fellow",
    email: "marcus.fellow@graduate.edu",
    role: "workspace_collaborator",
    label: "Collaborator",
    badgeVariant: "neutral",
  },
  {
    id: "usr_karen_legal",
    name: "Adv. Karen Mwangi",
    email: "karen.m@nairobilaw.co.ke",
    role: "workspace_owner",
    label: "Workspace Owner",
    badgeVariant: "success",
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const fetchSession = () => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setWorkspace(data.primaryWorkspace);
          setWorkspaces(data.workspaces || []);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    router.push("/login");
  };

  const handleSwitchAccount = async (targetUserId: string) => {
    try {
      const res = await fetch("/api/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "switch_user", userId: targetUserId }),
      });
      if (res.ok) {
        setShowRoleSwitcher(false);
        fetchSession();
        router.refresh();
      }
    } catch (err) {
      console.error("Account switch error:", err);
    }
  };

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Review Systems", href: "/dashboard/review-systems", icon: Layers },
    { label: "Submissions", href: "/dashboard/submissions", icon: FileText },
    { label: "Cohorts", href: "/dashboard/cohorts", icon: Users },
    { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { label: "Billing & Ledger", href: "/dashboard/billing", icon: CreditCard },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-50/60">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-zinc-200 bg-white flex flex-col justify-between shrink-0">
        <div>
          {/* Logo & Workspace Context */}
          <div className="p-4 border-b border-zinc-200">
            <Link href="/dashboard" className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-zinc-900 flex items-center justify-center text-white font-mono font-bold text-xs">
                me
              </div>
              <span className="font-semibold text-lg tracking-tight text-zinc-900">me.AI</span>
              <span className="text-[10px] font-mono uppercase bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded border border-zinc-200 ml-auto">
                Studio
              </span>
            </Link>

            <div className="rounded-lg bg-zinc-50 p-2 border border-zinc-200/80">
              <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Active Workspace
              </div>
              <div className="text-xs font-semibold text-zinc-900 truncate mt-0.5">
                {workspace?.name || "Systems Research Lab"}
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <Badge variant="brand" size="sm">
                  {workspace?.planTier || "PRO"} Plan
                </Badge>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {workspace?.retentionDays || 90}d retention
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-zinc-900 text-white shadow-sm"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile, Multi-Role Switcher & Privacy Status */}
        <div className="p-3 border-t border-zinc-200 space-y-2 relative">
          <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] text-emerald-700 bg-emerald-50 rounded border border-emerald-200/60 font-mono">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <span>Zero-Training Guarantee</span>
          </div>

          {/* Account Profile Card with Role Dropdown */}
          <div className="relative">
            <div
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="p-2 rounded-lg bg-zinc-50 border border-zinc-200 cursor-pointer hover:bg-zinc-100 transition-colors flex items-center justify-between"
            >
              <div className="truncate mr-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-zinc-900 truncate">
                    {user?.name || "Dr. Aris Thorne"}
                  </span>
                  <span className="text-[9px] font-mono uppercase bg-zinc-200 text-zinc-700 px-1 py-0.2 rounded font-bold shrink-0">
                    {user?.role === "platform_admin"
                      ? "Admin"
                      : user?.role === "workspace_collaborator"
                      ? "Collaborator"
                      : "Owner"}
                  </span>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono truncate">
                  {user?.email || "aris.thorne@graduate.edu"}
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
            </div>

            {/* Role Switcher Popover */}
            {showRoleSwitcher && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border border-zinc-200 p-2 z-50 space-y-1">
                <div className="px-2 py-1 text-[10px] font-mono uppercase font-semibold text-zinc-400 flex items-center justify-between">
                  <span>Switch Test Account</span>
                  <UserCheck className="h-3 w-3 text-zinc-400" />
                </div>
                {DEMO_ACCOUNTS.map((acc) => {
                  const isCurrent = user?.id === acc.id;
                  return (
                    <button
                      key={acc.id}
                      onClick={() => handleSwitchAccount(acc.id)}
                      className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                        isCurrent
                          ? "bg-zinc-900 text-white font-medium"
                          : "hover:bg-zinc-100 text-zinc-700"
                      }`}
                    >
                      <div className="truncate">
                        <div className="font-semibold truncate">{acc.name}</div>
                        <div
                          className={`text-[10px] font-mono truncate ${
                            isCurrent ? "text-zinc-300" : "text-zinc-400"
                          }`}
                        >
                          {acc.label}
                        </div>
                      </div>
                      {isCurrent && (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0 ml-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 py-1.5 rounded hover:bg-zinc-100 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}
