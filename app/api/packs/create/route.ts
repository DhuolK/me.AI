import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ReviewSystem, ReviewSystemVersion, ReviewRule } from "@/lib/types/domain";
import crypto from "node:crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      discipline,
      audience,
      evaluationScope,
      ignoredScope,
      priceKes,
      rules,
    } = body;

    if (!title || !priceKes || !rules || rules.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: title, priceKes, and at least 1 rule are required" },
        { status: 400 }
      );
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const systemId = `revsys_${crypto.randomUUID().replace(/-/g, "").substring(0, 8)}`;
    const versionId = `ver_${systemId}_v1_0_0`;

    const reviewRules: ReviewRule[] = rules.map((r: any, idx: number) => ({
      id: r.id || `rule_${systemId}_${idx + 1}`,
      ruleSystemVersionId: versionId,
      code: r.code || `RULE_${idx + 1}`,
      title: r.title || `Rule ${idx + 1}`,
      category: r.category || "General",
      description: r.description || "",
      ruleType: r.ruleType || "required",
      severity: r.severity?.toLowerCase() || "critical",
      applicableSection: r.applicableSection || "All",
      evidenceRequirement: r.evidenceRequirement || "required",
      requirement: r.requirement || r.description || "",
      failureAction: r.failureAction || "flag",
      recommendation: r.recommendation || "",
      weight: r.weight || 5,
      order: idx + 1,
    }));

    const reviewVersion: ReviewSystemVersion = {
      id: versionId,
      reviewSystemId: systemId,
      versionNumber: "1.0.0",
      changelog: "Initial version created",
      rules: reviewRules,
      examples: [],
      settings: {
        supportedFileTypes: ["pdf", "docx", "txt", "md"],
        maxFileSizeMb: 25,
        autoProcessOnPayment: true,
        scoringScale: "percentage",
        passingScore: 70,
        humanOversightRequired: false,
      },
      isPublished: true,
      publishedAt: new Date().toISOString(),
      isImmutable: true,
      createdAt: new Date().toISOString(),
    };

    const reviewSystem: ReviewSystem = {
      id: systemId,
      workspaceId: "ws_thorne_academic",
      name: title,
      slug,
      discipline: discipline || "General Analysis",
      audience: audience || "Professionals",
      description: description || `Structured evaluation for ${title}`,
      evaluationScope: evaluationScope || "All content sections",
      ignoredScope: ignoredScope || "Administrative metadata",
      priceKes: Number(priceKes) || 0,
      currentVersionId: versionId,
      status: "published",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.saveReviewSystem(reviewSystem);
    await db.saveReviewSystemVersion(reviewVersion);

    return NextResponse.json({
      success: true,
      reviewSystem,
      version: reviewVersion,
      links: {
        studio: `/dashboard/review-systems/${systemId}`,
        review: `/review/${slug}`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to publish review system" }, { status: 500 });
  }
}
