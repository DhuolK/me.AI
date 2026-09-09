import { db } from "../lib/db";
import { assertWorkspaceAccess, assertSubmissionAccess, AuthorizationError } from "../lib/auth/rbac";
import { User, Submission } from "../lib/types/domain";

async function runAuthAndRolesTests() {
  console.log("=================================================================");
  console.log("me.AI Multi-Role User Hierarchy & RBAC Test Suite");
  console.log("=================================================================\n");

  const results: { test: string; status: "PASS" | "FAIL"; details?: string }[] = [];

  function record(test: string, passed: boolean, details?: string) {
    results.push({ test, status: passed ? "PASS" : "FAIL", details });
    console.log(`[${passed ? "PASS" : "FAIL"}] ${test}`);
    if (details && !passed) {
      console.log(`       Details: ${details}`);
    }
  }

  // 1. Verify User Hierarchy Seed Records
  console.log("Phase 1: Verifying Seeded Hierarchy Accounts...");
  const admin = await db.getUserByEmail("admin@meai.internal");
  const owner = await db.getUserByEmail("aris.thorne@graduate.edu");
  const collaborator = await db.getUserByEmail("marcus.fellow@graduate.edu");
  const guest = await db.getUserByEmail("elena.rostova@cam.ac.uk");
  const externalOwner = await db.getUserByEmail("karen.m@nairobilaw.co.ke");

  record(
    "1.1 Seed users present with designated roles",
    Boolean(
      admin?.role === "platform_admin" &&
      owner?.role === "workspace_owner" &&
      collaborator?.role === "workspace_collaborator" &&
      guest?.role === "guest" &&
      externalOwner?.role === "workspace_owner"
    ),
    "One or more required role accounts missing or mismatched"
  );

  // 2. Workspace Access Verification
  console.log("\nPhase 2: Object-Level Workspace Access Verification...");
  const wsThorne = "ws_thorne_academic";
  const wsKaren = "ws_karen_legal";

  // Platform admin can access any workspace
  try {
    const ws = await assertWorkspaceAccess(admin, wsThorne, "owner");
    record("2.1 Platform Admin has universal override on Thorne workspace", ws.id === wsThorne);
  } catch (err: any) {
    record("2.1 Platform Admin has universal override on Thorne workspace", false, err.message);
  }

  try {
    const ws = await assertWorkspaceAccess(admin, wsKaren, "owner");
    record("2.2 Platform Admin has universal override on Karen workspace", ws.id === wsKaren);
  } catch (err: any) {
    record("2.2 Platform Admin has universal override on Karen workspace", false, err.message);
  }

  // Workspace Owner has owner access on own workspace
  try {
    const ws = await assertWorkspaceAccess(owner, wsThorne, "owner");
    record("2.3 Workspace Owner has full access to own workspace", ws.id === wsThorne);
  } catch (err: any) {
    record("2.3 Workspace Owner has full access to own workspace", false, err.message);
  }

  // Workspace Collaborator (Marcus) has member access on Thorne workspace
  try {
    const ws = await assertWorkspaceAccess(collaborator, wsThorne, "member");
    record("2.4 Collaborator has 'member' access to assigned workspace", ws.id === wsThorne);
  } catch (err: any) {
    record("2.4 Collaborator has 'member' access to assigned workspace", false, err.message);
  }

  // Workspace Collaborator cannot perform 'owner' actions
  let collaboratorDeniedOwner = false;
  try {
    await assertWorkspaceAccess(collaborator, wsThorne, "owner");
  } catch (err: any) {
    if (err instanceof AuthorizationError) {
      collaboratorDeniedOwner = true;
    }
  }
  record(
    "2.5 Collaborator is strictly blocked from owner-level workspace operations",
    collaboratorDeniedOwner
  );

  // Cross-workspace isolation: Karen cannot access Thorne workspace
  let crossAccessBlocked = false;
  try {
    await assertWorkspaceAccess(externalOwner, wsThorne, "viewer");
  } catch (err: any) {
    if (err instanceof AuthorizationError) {
      crossAccessBlocked = true;
    }
  }
  record(
    "2.6 Cross-workspace isolation blocks unrelated workspace owner",
    crossAccessBlocked
  );

  // Guest client cannot access workspace dashboard
  let guestWorkspaceBlocked = false;
  try {
    await assertWorkspaceAccess(guest, wsThorne, "viewer");
  } catch (err: any) {
    if (err instanceof AuthorizationError) {
      guestWorkspaceBlocked = true;
    }
  }
  record(
    "2.7 Guest clients are strictly blocked from internal workspace access",
    guestWorkspaceBlocked
  );

  // 3. Submission & Report Token Verification
  console.log("\nPhase 3: Submission & Guest Token Scoped Access...");
  const sampleSubmission: Submission = {
    id: "sub_test_01",
    reviewSystemId: "revsys_thesis_thorne",
    reviewSystemVersionId: "ver_thesis_thorne_1_0_0",
    guestEmail: "elena.rostova@cam.ac.uk",
    guestPhone: "+447911123456",
    secureToken: "sub_token_secret_12345",
    status: "READY",
    currentVersionIndex: 1,
    versions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Guest with valid secure token
  try {
    const accessGranted = await assertSubmissionAccess(sampleSubmission, null, "sub_token_secret_12345");
    record("3.1 Guest with valid submission token has view access", accessGranted);
  } catch (err: any) {
    record("3.1 Guest with valid submission token has view access", false, err.message);
  }

  // Guest with invalid token is blocked
  let invalidTokenBlocked = false;
  try {
    await assertSubmissionAccess(sampleSubmission, null, "wrong_token");
  } catch (err: any) {
    if (err instanceof AuthorizationError) {
      invalidTokenBlocked = true;
    }
  }
  record("3.2 Guest with forged or wrong token is rejected", invalidTokenBlocked);

  // Workspace owner can access submission without token
  try {
    const ownerAccess = await assertSubmissionAccess(sampleSubmission, owner, null);
    record("3.3 Workspace Owner can inspect submissions without guest token", ownerAccess);
  } catch (err: any) {
    record("3.3 Workspace Owner can inspect submissions without guest token", false, err.message);
  }

  // Unrelated workspace owner is blocked from submission
  let unrelatedOwnerBlocked = false;
  try {
    await assertSubmissionAccess(sampleSubmission, externalOwner, null);
  } catch (err: any) {
    if (err instanceof AuthorizationError) {
      unrelatedOwnerBlocked = true;
    }
  }
  record(
    "3.4 Unrelated Workspace Owner cannot inspect submissions from other workspaces",
    unrelatedOwnerBlocked
  );

  console.log("\n=================================================================");
  const total = results.length;
  const passed = results.filter((r) => r.status === "PASS").length;
  console.log(`Results: ${passed}/${total} passed (${((passed / total) * 100).toFixed(0)}%)`);
  console.log("=================================================================\n");

  if (passed !== total) {
    process.exit(1);
  }
}

runAuthAndRolesTests().catch((err) => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});
