import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { Workspace } from "@/lib/types/domain";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaces = await db.listWorkspacesForUser(user.id);
  return NextResponse.json({ workspaces });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, retentionDays } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Workspace name is required" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const workspace: Workspace = {
      id: `ws_${Date.now()}`,
      name,
      slug: `${slug}-${Math.random().toString(36).substring(2, 6)}`,
      ownerId: user.id,
      planTier: "FREE",
      retentionDays: retentionDays || 60,
      allowClientDataTraining: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.saveWorkspace(workspace);

    return NextResponse.json({ success: true, workspace }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create workspace";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
