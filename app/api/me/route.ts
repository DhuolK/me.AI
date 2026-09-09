import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, setSessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaces = await db.listWorkspacesForUser(user.id);
  const primaryWorkspace = workspaces[0] || null;
  const subscription = primaryWorkspace ? await db.getWorkspaceSubscription(primaryWorkspace.id) : null;
  const plan = primaryWorkspace ? await db.getSubscriptionPlan(primaryWorkspace.planTier) : null;

  return NextResponse.json({
    user,
    workspaces,
    primaryWorkspace,
    subscription,
    plan,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, userId } = body;

    if (action === "switch_user" && userId) {
      const targetUser = await db.getUser(userId);
      if (!targetUser) {
        return NextResponse.json({ error: "Target user not found" }, { status: 404 });
      }
      await setSessionUser(targetUser.id);
      return NextResponse.json({ success: true, user: targetUser });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
