import crypto from "node:crypto";
import {
  Submission,
  ReviewSystemVersion,
  Report,
  EvaluationFinding,
  EvaluationEvidence,
  EvaluationJob,
  ReportRevisionDelta,
  ReviewRule,
} from "@/lib/types/domain";
import { chunkText } from "@/lib/rag/chunker";
import { retriever } from "@/lib/rag/retriever";
import { db } from "@/lib/db";

export class EvaluationEngine {
  /**
   * Executes the full asynchronous evaluation pipeline for a submission against an immutable ReviewSystemVersion.
   */
  async runEvaluation(
    submission: Submission,
    version: ReviewSystemVersion,
    rawText: string
  ): Promise<Report> {
    const startTime = Date.now();
    const jobId = `job_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

    // 1. Initialize evaluation job
    const job: EvaluationJob = {
      id: jobId,
      submissionId: submission.id,
      reviewSystemVersionId: version.id,
      status: "processing",
      stagesCompleted: ["FILE_INGESTED"],
      rawTextLength: rawText.length,
      chunkCount: 0,
      ruleCount: version.rules.length,
      createdAt: new Date().toISOString(),
    };
    await db.saveEvaluationJob(job);

    // 2. Chunking & Indexing
    const chunks = chunkText(submission.id, rawText, { maxChars: 750 });
    job.chunkCount = chunks.length;
    job.stagesCompleted.push("DOCUMENT_CHUNKED");

    // 3. Evidence Retrieval
    const retrievedEvidence = retriever.retrieveEvidence(version.rules, chunks, 2);
    job.stagesCompleted.push("EVIDENCE_RETRIEVED");

    // 4. Rule Evaluation against Evidence
    const findings: EvaluationFinding[] = [];
    let passedCount = 0;
    let needsAttentionCount = 0;
    let criticalCount = 0;

    for (let i = 0; i < version.rules.length; i++) {
      const rule = version.rules[i];
      const ev = retrievedEvidence[i];
      const topChunks = ev?.relevantDocChunks || [];
      const primaryMatch = topChunks[0];
      const matchedText = primaryMatch ? primaryMatch.chunk.text : rawText.substring(0, 300);
      const chunkIdx = primaryMatch ? primaryMatch.chunk.index : 0;

      // Evaluate rule conditions
      const evaluation = this.evaluateSingleRule(rule, matchedText, rawText);

      const evidenceItem: EvaluationEvidence = {
        chunkIndex: chunkIdx,
        quote: matchedText.length > 220 ? matchedText.substring(0, 220) + "..." : matchedText,
        sectionContext: rule.applicableSection,
        isVerified: true,
      };

      const findingId = `find_${submission.id}_${rule.code.toLowerCase()}_${i}`;

      if (evaluation.passed) {
        passedCount++;
        findings.push({
          id: findingId,
          ruleId: rule.id,
          ruleCode: rule.code,
          ruleTitle: rule.title,
          category: rule.category,
          severity: rule.severity,
          status: "passed",
          finding: `Adheres to methodology: ${rule.title}`,
          reason: evaluation.reason,
          evidence: [evidenceItem],
          recommendation: "Maintain this standard in subsequent sections.",
          weight: rule.weight || 5,
        });
      } else {
        if (rule.severity === "critical") {
          criticalCount++;
        } else {
          needsAttentionCount++;
        }

        findings.push({
          id: findingId,
          ruleId: rule.id,
          ruleCode: rule.code,
          ruleTitle: rule.title,
          category: rule.category,
          severity: rule.severity,
          status: rule.severity === "critical" ? "failed" : "warning",
          finding: evaluation.finding,
          reason: evaluation.reason,
          evidence: [evidenceItem],
          recommendation: rule.recommendation || evaluation.recommendation,
          weight: rule.weight || 5,
        });
      }
    }

    job.stagesCompleted.push("RULES_EVALUATED");

    // 5. Score Calculation
    const totalWeight = version.rules.reduce((acc, r) => acc + (r.weight || 5), 0);
    const earnedWeight = findings
      .filter((f) => f.status === "passed")
      .reduce((acc, f) => acc + f.weight, 0);

    const rawScore = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 70;
    // Apply penalty adjustments for critical severity issues
    const criticalPenalty = criticalCount * 12;
    const overallScore = Math.max(15, Math.min(99, rawScore - criticalPenalty));

    // 6. Summary Verdict
    let summaryVerdict = "";
    if (overallScore >= 85) {
      summaryVerdict = "Exemplary adherence to expert methodology. Minor polish recommended.";
    } else if (overallScore >= 65) {
      summaryVerdict = "Acceptable foundational structure. Several high-priority remediation items required.";
    } else {
      summaryVerdict = "Substantial deficiencies identified against core rules. Significant revision required.";
    }

    // 7. Check for previous version to compute Revision Delta (Resubmission support)
    let revisionDelta: ReportRevisionDelta | undefined;
    if (submission.currentVersionIndex > 1) {
      const prevReport = await db.getReport(submission.id);
      if (prevReport) {
        const scoreDelta = overallScore - prevReport.overallScore;
        const prevFailingCodes = new Set(
          prevReport.findings.filter((f) => f.status !== "passed").map((f) => f.ruleCode)
        );
        const currentFailingCodes = new Set(
          findings.filter((f) => f.status !== "passed").map((f) => f.ruleCode)
        );

        let resolved = 0;
        let newFailures = 0;
        let remaining = 0;

        for (const code of prevFailingCodes) {
          if (!currentFailingCodes.has(code)) resolved++;
          else remaining++;
        }
        for (const code of currentFailingCodes) {
          if (!prevFailingCodes.has(code)) newFailures++;
        }

        revisionDelta = {
          previousReportId: prevReport.id,
          scoreDelta,
          resolvedFindingsCount: resolved,
          newFindingsCount: newFailures,
          remainingFindingsCount: remaining,
          summary: `Score changed by ${scoreDelta >= 0 ? "+" : ""}${scoreDelta} points. Resolved ${resolved} previous issues with ${newFailures} new issues introduced.`,
        };
      }
    }

    // 8. Build Report
    const reportId = `rep_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const report: Report = {
      id: reportId,
      submissionId: submission.id,
      submissionVersionIndex: submission.currentVersionIndex,
      reviewSystemId: version.reviewSystemId,
      reviewSystemVersionId: version.id,
      overallScore,
      passedCount,
      needsAttentionCount,
      criticalCount,
      summaryVerdict,
      findings,
      overrides: [],
      revisionDelta,
      evaluationJobId: jobId,
      isPublishedToClient: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.saveReport(report);

    // 9. Update Job and Submission status
    job.status = "completed";
    job.stagesCompleted.push("REPORT_GENERATED");
    job.durationMs = Date.now() - startTime;
    job.completedAt = new Date().toISOString();
    await db.saveEvaluationJob(job);

    submission.status = "READY";
    submission.updatedAt = new Date().toISOString();
    await db.saveSubmission(submission);

    return report;
  }

  private evaluateSingleRule(
    rule: ReviewRule,
    matchedText: string,
    fullText: string
  ): { passed: boolean; finding: string; reason: string; recommendation: string } {
    const text = matchedText.toLowerCase();
    const full = fullText.toLowerCase();

    // Check specific rule requirements
    if (rule.ruleType === "required") {
      // Check for presence of quantitative empirical markers or explicit baselines
      if (rule.code.includes("GAP") || rule.title.toLowerCase().includes("problem")) {
        const hasMetrics = /\d+%|\d+\.\d+|latency|recall|throughput|benchmark|degrades/i.test(text);
        if (!hasMetrics) {
          return {
            passed: false,
            finding: "Unquantified or abstract problem statement.",
            reason: "Problem statement lacks empirical baseline measurements or concrete failure stakes.",
            recommendation: rule.recommendation,
          };
        }
      } else if (rule.code.includes("BASE") || rule.title.toLowerCase().includes("baseline")) {
        const hasBaselines = /baseline|bm25|hnsw|standard|control|sota|comparison/i.test(full);
        if (!hasBaselines) {
          return {
            passed: false,
            finding: "Missing standardized comparative baselines in methodology.",
            reason: "The evaluation fails to compare against standard baselines under identical test distributions.",
            recommendation: rule.recommendation,
          };
        }
      }
    } else if (rule.ruleType === "evidence-based" || rule.code.includes("INTEG")) {
      // Check for unhedged causal claims
      const hasCausalOverextension = /proves that|guarantees that|flawless|always leads to/i.test(text);
      if (hasCausalOverextension && !/p\s*<\s*0\.05|statistically significant|ablation/i.test(text)) {
        return {
          passed: false,
          finding: "Overextended causal claim without reported statistical significance.",
          reason: "Text asserts causality without supplying confidence intervals or significance tests.",
          recommendation: rule.recommendation,
        };
      }
    } else if (rule.ruleType === "structural" || rule.code.includes("FIG")) {
      // Check for orphan figures
      if (/figure|table|diagram/i.test(text) && !/depicts|demonstrates|indicates|shows that|inflection/i.test(text)) {
        return {
          passed: false,
          finding: "Figure or table mentioned without deductive analysis.",
          reason: "Visual asset is listed without explanatory prose interpreting the data anomalies.",
          recommendation: rule.recommendation,
        };
      }
    }

    return {
      passed: true,
      finding: "Criteria verified.",
      reason: "Document demonstrates compliance with specified criteria.",
      recommendation: "Continue to maintain standard.",
    };
  }
}

export const evaluationEngine = new EvaluationEngine();
