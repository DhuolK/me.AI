import { evaluationEngine } from "@/lib/services/evaluation-engine";
import { db } from "@/lib/db";
import { Submission, ReviewSystemVersion, Report } from "@/lib/types/domain";

export class ReviewEngine {
  /**
   * Orchestrates review generation by delegating to the generalized evaluationEngine.
   */
  async generateReview(submission: Submission, version: ReviewSystemVersion, rawText: string): Promise<Report> {
    return evaluationEngine.runEvaluation(submission, version, rawText);
  }
}

export const reviewEngine = new ReviewEngine();
