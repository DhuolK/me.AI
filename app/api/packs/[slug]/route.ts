import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const system = await db.getReviewSystem(slug);

    if (!system) {
      return NextResponse.json({ error: "Review System not found" }, { status: 404 });
    }

    const version = await db.getReviewSystemVersion(system.currentVersionId);

    return NextResponse.json({
      reviewSystem: system,
      activeVersion: version,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch review system" }, { status: 500 });
  }
}
