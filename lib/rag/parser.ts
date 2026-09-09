export interface ParsedDocument {
  filename: string;
  fileType: "pdf" | "docx" | "txt" | "md";
  rawText: string;
  pageCount?: number;
  wordCount: number;
  extractedSections: Array<{
    title: string;
    content: string;
    estimatedPage?: number;
  }>;
}

export class NativeDocumentParser {
  /**
   * Sanitizes input text, removing binary noise, null bytes, and non-printable sequences.
   */
  sanitizeText(content: string | Buffer): string {
    let text = typeof content === "string" ? content : content.toString("utf-8");

    // Remove PDF binary header artifacts if raw stream was ingested
    if (text.startsWith("%PDF-")) {
      // Extract textual streams enclosed in parentheses or between BT/ET markers
      const textMatches = text.match(/\(([^()]+)\)/g);
      if (textMatches && textMatches.length > 5) {
        text = textMatches
          .map((m) => m.slice(1, -1))
          .filter((s) => s.length > 2 && /[a-zA-Z0-9]/.test(s))
          .join(" ");
      }
    }

    // Strip unprintable control characters except standard whitespace/newlines
    text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "");

    // Normalize multiple consecutive blank lines
    text = text.replace(/\n{3,}/g, "\n\n").trim();

    return text;
  }

  /**
   * Parses raw file buffers or plain text streams into structured, section-aware document models
   */
  async parse(filename: string, content: string | Buffer): Promise<ParsedDocument> {
    const ext = (filename.split(".").pop()?.toLowerCase() || "txt") as "pdf" | "docx" | "txt" | "md";
    const text = this.sanitizeText(content);

    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const sections: Array<{ title: string; content: string; estimatedPage?: number }> = [];

    // Parse section headers (e.g., Chapter 1, Section 2, Article 3, or Markdown ##)
    const rawSections = text.split(/(?=(?:Chapter\s+\d+|Section\s+\d+|Article\s+\d+|Clause\s+\d+|##\s+[^\n]+))/i);

    let pageTracker = 1;
    for (const sec of rawSections) {
      const trimmed = sec.trim();
      if (!trimmed) continue;

      const lines = trimmed.split("\n");
      const title = lines[0].replace(/^##\s*/, "").substring(0, 80);
      const body = lines.slice(1).join("\n").trim() || trimmed;

      sections.push({
        title,
        content: body,
        estimatedPage: pageTracker,
      });

      // Rough heuristic: 350 words per page
      const secWords = trimmed.split(/\s+/).length;
      pageTracker += Math.max(1, Math.round(secWords / 350));
    }

    if (sections.length === 0) {
      sections.push({
        title: "Main Content",
        content: text,
        estimatedPage: 1,
      });
    }

    return {
      filename,
      fileType: ext,
      rawText: text,
      pageCount: Math.max(1, pageTracker),
      wordCount: words,
      extractedSections: sections,
    };
  }
}

export const documentParser = new NativeDocumentParser();
