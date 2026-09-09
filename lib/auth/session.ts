import { cookies } from "next/headers";
import { User } from "@/lib/types/domain";
import { db } from "@/lib/db";
import { SEED_USERS } from "@/lib/db/fixtures";

const SESSION_COOKIE_NAME = "meai_session_user_id";

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (userId) {
      const user = await db.getUser(userId);
      if (user) return user;
    }
  } catch {
    // In environments without cookies or during tests
  }

  // Fallback to primary seed professional for seamless DX/testing
  return SEED_USERS[0];
}

export async function setSessionUser(userId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, userId, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function clearSessionUser(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export function generateSecureToken(prefix: string = "sub"): string {
  const random = Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
  return `${prefix}_${random}`;
}
