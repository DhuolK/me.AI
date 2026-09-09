import { EvaluationFinding, DocumentChunk, ReviewRule, EvaluationEvidence } from "@/lib/types/domain";

export class CitationAuditValidator {
  /**
   * Validates citations against known chunks and rules, strictly preventing hallucinations
   * and enforcing that every failing/warning finding contains at least one verified citation.
   */
  validateFindings(params: {
    findings: EvaluationFinding[];
    chunks: DocumentChunk[];
    rules: ReviewRule[];
  }): {
    isValid: boolean;
    missingRuleCount: number;
    hallucinatedChunkCount: number;
    verifiedCitationsCount: number;
    errors: string[];
  } {
    const validChunkIndices = new Set(params.chunks.map((c) => c.index));
    const validRuleCodes = new Set(params.rules.map((r) => r.code));
    const validRuleIds = new Set(params.rules.map((r) => r.id));

    let missingRuleCount = 0;
    let hallucinatedChunkCount = 0;
    let verifiedCitationsCount = 0;
    const errors: string[] = [];

    for (const finding of params.findings) {
      if (!validRuleCodes.has(finding.ruleCode) && !validRuleIds.has(finding.ruleId)) {
        missingRuleCount++;
        errors.push(`Rule ${finding.ruleCode} (${finding.ruleId}) is not in active rule set`);
      }

      if (finding.status !== "passed") {
        if (!finding.evidence || finding.evidence.length === 0) {
          errors.push(`Finding for ${finding.ruleCode} has no supporting evidence quotes`);
        } else {
          for (const ev of finding.evidence) {
            if (!validChunkIndices.has(ev.chunkIndex)) {
              hallucinatedChunkCount++;
              errors.push(`Chunk index #${ev.chunkIndex} does not exist in chunked manuscript`);
            } else {
              verifiedCitationsCount++;
            }
          }
        }
      }
    }

    const isValid = errors.length === 0 && hallucinatedChunkCount === 0;

    return {
      isValid,
      missingRuleCount,
      hallucinatedChunkCount,
      verifiedCitationsCount,
      errors,
    };
  }
}

export const citationValidator = new CitationAuditValidator();
