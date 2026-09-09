import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { assertWorkspaceAccess } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { subscriptionManager } from "@/lib/payments/subscriptions";
import { financialLedger } from "@/lib/payments/ledger";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");

  const workspaces = await db.listWorkspacesForUser(user.id);
  const targetWsId = workspaceId || workspaces[0]?.id;
  if (!targetWsId) {
    return NextResponse.json({ error: "No workspace found" }, { status: 404 });
  }

  const workspace = await assertWorkspaceAccess(user, targetWsId, "admin");
  const plans = await subscriptionManager.getPlans();
  const currentPlan = (await db.getSubscriptionPlan(workspace.planTier)) || plans[0];
  const subscription = await db.getWorkspaceSubscription(workspace.id);
  const financialSummary = await financialLedger.getWorkspaceFinancialSummary(workspace.id);
  const ledgerEntries = await db.listLedgerEntries(workspace.id);
  const payouts = await db.listPayouts(workspace.id);

  return NextResponse.json({
    workspace,
    plans,
    currentPlan,
    subscription,
    financialSummary,
    ledgerEntries,
    payouts,
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, workspaceId, targetTier, amountKes, destinationPhone } = body;

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
    }

    if (action === "request_payout") {
      await assertWorkspaceAccess(user, workspaceId, "admin");
      if (!amountKes || !destinationPhone) {
        return NextResponse.json(
          { error: "amountKes and destinationPhone are required for payout" },
          { status: 400 }
        );
      }

      const payoutResult = await financialLedger.requestPayout({
        workspaceId,
        amountKes: Number(amountKes),
        destinationPhone,
        requestedBy: user.email,
      });

      return NextResponse.json(payoutResult);
    }

    if (!targetTier) {
      return NextResponse.json({ error: "targetTier is required for plan change" }, { status: 400 });
    }

    await assertWorkspaceAccess(user, workspaceId, "owner");
    const updated = await subscriptionManager.upgradeWorkspacePlan(workspaceId, targetTier);

    return NextResponse.json({ success: true, workspace: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to process billing request";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
