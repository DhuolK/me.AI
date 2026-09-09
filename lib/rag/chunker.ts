import { DocumentChunk } from "@/lib/types/domain";

export interface ChunkOptions {
  maxChars?: number;
}

export function chunkText(
  submissionId: string,
  rawText: string,
  options: ChunkOptions = { maxChars: 800 }
): DocumentChunk[] {
  const maxChars = options.maxChars || 800;
  const paragraphs = rawText.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const chunks: DocumentChunk[] = [];
  let chunkIndex = 0;

  const createChunk = (text: string): DocumentChunk => ({
    id: `chunk_${submissionId}_${String(chunkIndex).padStart(2, "0")}`,
    submissionId,
    index: chunkIndex++,
    text: text.trim(),
    tokenCount: Math.ceil(text.trim().length / 4),
  });

  for (const para of paragraphs) {
    const cleanPara = para.trim();
    if (cleanPara.length <= maxChars) {
      chunks.push(createChunk(cleanPara));
    } else {
      const sentences = cleanPara.match(/[^.!?]+[.!?]+(\s|$)/g) || [cleanPara];
      let currentBuffer = "";

      for (const sentence of sentences) {
        if ((currentBuffer + sentence).length > maxChars && currentBuffer.length > 0) {
          chunks.push(createChunk(currentBuffer));
          currentBuffer = sentence;
        } else {
          currentBuffer += sentence;
        }
      }

      if (currentBuffer.trim().length > 0) {
        chunks.push(createChunk(currentBuffer));
      }
    }
  }

  return chunks;
}
