import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, setSessionUser, clearSessionUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, user });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, action, role, name } = body;

    if (action === "logout") {
      await clearSessionUser();
      return NextResponse.json({ success: true, message: "Logged out" });
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    let user = await db.getUserByEmail(email);
    if (!user) {
      // Create user with appropriate default or specified role
      user = {
        id: `usr_${Date.now()}`,
        email,
        name: name || email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
        role: role || (email.includes("admin") ? "platform_admin" : "workspace_owner"),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await db.saveUser(user);
    }

    await setSessionUser(user.id);
    return NextResponse.json({ success: true, user });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Authentication failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
