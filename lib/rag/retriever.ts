import { DocumentChunk, PackRule } from "@/lib/types/domain";

export interface RetrievedEvidence {
  rule: PackRule;
  relevantDocChunks: {
    chunk: DocumentChunk;
    score: number;
    matchTerms: string[];
  }[];
}

// Tokenizer helper with stopword filtering & memoization
const STOPWORDS = new Set([
  "the", "and", "or", "to", "in", "a", "is", "that", "for", "it", "as", "was",
  "with", "on", "by", "at", "from", "be", "this", "which", "an", "are", "not",
]);

function tokenize(text: string): string[] {
  if (!text || typeof text !== "string") return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

export class PureTsRetriever {
  /**
   * Retrieves relevant document chunks for each pack rule deterministically with high performance
   */
  retrieveEvidence(rules: PackRule[], chunks: DocumentChunk[], topK: number = 3): RetrievedEvidence[] {
    if (!rules || rules.length === 0) return [];
    if (!chunks || chunks.length === 0) {
      return rules.map((rule) => ({
        rule,
        relevantDocChunks: [],
      }));
    }

    // Precompute chunk token sets once (O(chunks) rather than O(rules * chunks))
    const precomputedChunks = chunks.map((chunk) => {
      const tokens = tokenize(chunk.text || "");
      const tokenCounts = new Map<string, number>();
      for (const t of tokens) {
        tokenCounts.set(t, (tokenCounts.get(t) || 0) + 1);
      }
      return {
        chunk,
        tokens,
        tokenCounts,
        tokenLength: tokens.length,
      };
    });

    const evidenceList: RetrievedEvidence[] = [];

    for (const rule of rules) {
      const ruleText = `${rule.title || ""} ${rule.description || ""} ${rule.requirement || ""} ${rule.recommendation || ""}`;
      const ruleTokens = tokenize(ruleText);
      const ruleTokenSet = new Set(ruleTokens);

      const scoredChunks = precomputedChunks.map(({ chunk, tokenCounts, tokenLength }) => {
        if (tokenLength === 0) {
          return { chunk, score: 0, matchTerms: [] };
        }

        const matchTerms: string[] = [];
        let matchScore = 0;

        for (const token of ruleTokenSet) {
          const count = tokenCounts.get(token);
          if (count !== undefined && count > 0) {
            matchScore += count;
            matchTerms.push(token);
          }
        }

        // Sub-linear TF-IDF style density score with match variety bonus
        const score = (matchScore / Math.sqrt(tokenLength)) * (1 + matchTerms.length * 0.25);

        return {
          chunk,
          score,
          matchTerms,
        };
      });

      scoredChunks.sort((a, b) => b.score - a.score);
      evidenceList.push({
        rule,
        relevantDocChunks: scoredChunks.slice(0, topK),
      });
    }

    return evidenceList;
  }
}

export const retriever = new PureTsRetriever();
