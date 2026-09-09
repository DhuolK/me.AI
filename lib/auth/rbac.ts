import { db } from "@/lib/db";
import { User, Workspace, Submission, Report, WorkspaceMemberRole } from "@/lib/types/domain";

export class AuthorizationError extends Error {
  constructor(message: string = "Unauthorized access to requested resource") {
    super(message);
    this.name = "AuthorizationError";
  }
}

const ROLE_HIERARCHY: Record<WorkspaceMemberRole, number> = {
  viewer: 1,
  member: 2,
  admin: 3,
  owner: 4,
};

/**
 * Asserts that the given user has access to the workspace with at least the required role.
 */
export async function assertWorkspaceAccess(
  user: User | null,
  workspaceId: string,
  minRole: WorkspaceMemberRole = "viewer"
): Promise<Workspace> {
  if (!user) {
    throw new AuthorizationError("Authentication required");
  }

  const workspace = await db.getWorkspace(workspaceId);
  if (!workspace) {
    throw new AuthorizationError("Workspace not found");
  }

  // 1. Platform Admin has universal override access across all workspaces
  if (user.role === "platform_admin") {
    return workspace;
  }

  // 2. Direct Workspace Owner has full access
  if (workspace.ownerId === user.id) {
    return workspace;
  }

  // 3. Check Workspace Membership and role rank
  const membership = await db.getWorkspaceMember(workspaceId, user.id);
  if (!membership) {
    throw new AuthorizationError("Access denied: You do not have permissions in this workspace");
  }

  const memberRank = ROLE_HIERARCHY[membership.role] || 0;
  const requiredRank = ROLE_HIERARCHY[minRole] || 0;

  if (memberRank < requiredRank) {
    throw new AuthorizationError(
      `Access denied: Action requires at least '${minRole}' role (current role: '${membership.role}')`
    );
  }

  return workspace;
}

/**
 * Asserts that the requestor (authenticated professional user OR guest with secure token)
 * is authorized to access the submission.
 */
export async function assertSubmissionAccess(
  submission: Submission,
  user: User | null,
  guestToken?: string | null
): Promise<boolean> {
  // 1. Guest matching exact secure submission token
  if (guestToken && submission.secureToken === guestToken) {
    return true;
  }

  // 2. Authenticated user who owns, collaborates on, or admins the review system workspace
  if (user) {
    if (user.role === "platform_admin") {
      return true;
    }

    const reviewSystem = await db.getReviewSystem(submission.reviewSystemId);
    if (reviewSystem) {
      const workspace = await db.getWorkspace(reviewSystem.workspaceId);
      if (workspace) {
        if (workspace.ownerId === user.id) {
          return true;
        }
        const membership = await db.getWorkspaceMember(workspace.id, user.id);
        if (membership) {
          return true;
        }
      }
    }
  }

  throw new AuthorizationError("Access denied to this submission");
}

/**
 * Asserts that the requestor has authorization to view or edit the report.
 */
export async function assertReportAccess(
  report: Report,
  user: User | null,
  guestToken?: string | null
): Promise<boolean> {
  const submission = await db.getSubmission(report.submissionId);
  if (!submission) {
    throw new AuthorizationError("Associated submission not found");
  }
  return assertSubmissionAccess(submission, user, guestToken);
}
