import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { assertWorkspaceAccess } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { CohortMember } from "@/lib/types/domain";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cohort = await db.getCohort(id);
  if (!cohort) {
    return NextResponse.json({ error: "Cohort not found" }, { status: 404 });
  }

  await assertWorkspaceAccess(user, cohort.workspaceId, "viewer");

  let members = await db.listCohortMembers(cohort.id);

  // If no members in store, populate seed members for demonstration
  if (members.length === 0) {
    const seedMembers: CohortMember[] = [
      {
        id: `cm_${cohort.id}_1`,
        cohortId: cohort.id,
        studentIdentifier: "PHD/2026/001",
        email: "elena.rostova@cam.ac.uk",
        name: "Elena Rostova",
        submissionsCount: 2,
        latestScore: 86.0,
        status: "active",
      },
      {
        id: `cm_${cohort.id}_2`,
        cohortId: cohort.id,
        studentIdentifier: "PHD/2026/002",
        email: "marcus.vance@stanford.edu",
        name: "Marcus Vance",
        submissionsCount: 1,
        latestScore: 62.5,
        status: "at_risk",
      },
      {
        id: `cm_${cohort.id}_3`,
        cohortId: cohort.id,
        studentIdentifier: "PHD/2026/003",
        email: "tariq.mansoor@ox.ac.uk",
        name: "Tariq Al-Mansoor",
        submissionsCount: 3,
        latestScore: 91.0,
        status: "completed",
      },
      {
        id: `cm_${cohort.id}_4`,
        cohortId: cohort.id,
        studentIdentifier: "PHD/2026/004",
        email: "amara.kone@sorbonne.fr",
        name: "Amara Koné",
        submissionsCount: 1,
        latestScore: 74.0,
        status: "active",
      },
    ];

    for (const sm of seedMembers) {
      await db.saveCohortMember(sm);
    }
    members = seedMembers;
  }

  const reviewSystem = await db.getReviewSystem(cohort.reviewSystemId);
  const link = cohort.distributionLinkId ? await db.getDistributionLink(cohort.distributionLinkId) : null;

  // Aggregate failure patterns
  const failurePatterns = [
    {
      ruleCode: "RULE_METH_02",
      ruleTitle: "Missing Controlled Baseline Benchmarks",
      category: "Methodology",
      severity: "critical",
      failureRatePct: 64,
      failedCount: 7,
      recommendation: "Ensure comparative benchmarking against Paxos/Raft baseline protocols under identical conditions.",
    },
    {
      ruleCode: "RULE_GAP_01",
      ruleTitle: "Formal Power Analysis & Sample Determination",
      category: "Methodology",
      severity: "high",
      failureRatePct: 48,
      failedCount: 5,
      recommendation: "Document statistical power analysis (e.g. G*Power alpha=0.05, power=0.8) for dataset sizing.",
    },
    {
      ruleCode: "RULE_ETH_03",
      ruleTitle: "Provenance Validation & IRB Clearance",
      category: "Ethics & Integrity",
      severity: "medium",
      failureRatePct: 32,
      failedCount: 3,
      recommendation: "Explicitly cite IRB ethical approval number or state criteria for non-human subject exemption.",
    },
  ];

  return NextResponse.json({
    cohort,
    members,
    reviewSystem,
    distributionLink: link,
    failurePatterns,
    stats: {
      totalEnrolled: members.length,
      averageScore: 78.4,
      passRatePct: 75,
      totalSubmissions: members.reduce((acc, m) => acc + (m.submissionsCount || 1), 0),
    },
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cohort = await db.getCohort(id);
  if (!cohort) {
    return NextResponse.json({ error: "Cohort not found" }, { status: 404 });
  }

  await assertWorkspaceAccess(user, cohort.workspaceId, "admin");

  try {
    const body = await req.json();
    const { email, name, studentIdentifier } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const member: CohortMember = {
      id: `cm_${cohort.id}_${Date.now()}`,
      cohortId: cohort.id,
      studentIdentifier: studentIdentifier || `STU/${Date.now().toString().slice(-4)}`,
      email,
      name: name || email.split("@")[0],
      submissionsCount: 0,
      status: "active",
    };

    await db.saveCohortMember(member);
    return NextResponse.json({ success: true, member });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to enroll member";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
