"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Layers, Hash } from "lucide-react";

interface SubmissionDropzoneProps {
  onContentExtracted: (data: {
    filename: string;
    rawText: string;
    wordCount: number;
    charCount: number;
    detectedSections: string[];
  }) => void;
  initialText?: string;
}

export function SubmissionDropzone({ onContentExtracted, initialText = "" }: SubmissionDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [filename, setFilename] = useState<string | null>(null);
  const [text, setText] = useState<string>(initialText);
  const [wordCount, setWordCount] = useState<number>(() =>
    initialText.trim() ? initialText.trim().split(/\s+/).filter(Boolean).length : 0
  );
  const [charCount, setCharCount] = useState<number>(() => initialText.length);
  const [detectedSections, setDetectedSections] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeText = (rawContent: string, name: string) => {
    // Sanitize binary noise or null bytes
    let cleanText = rawContent.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "").trim();

    if (cleanText.startsWith("%PDF-")) {
      const matches = cleanText.match(/\(([^()]+)\)/g);
      if (matches && matches.length > 5) {
        cleanText = matches
          .map((m) => m.slice(1, -1))
          .filter((s) => s.length > 2 && /[a-zA-Z0-9]/.test(s))
          .join(" ");
      }
    }

    const words = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;
    const chars = cleanText.length;

    // Detect section headers
    const sectionMatches = cleanText.match(/(?:Chapter\s+\d+[^\n]*|Section\s+\d+[^\n]*|##\s+[^\n]+)/gi) || [];
    const uniqueSections = Array.from(
      new Set(sectionMatches.map((s) => s.replace(/^##\s*/, "").trim().substring(0, 45)))
    ).slice(0, 5);

    setFilename(name);
    setText(cleanText);
    setWordCount(words);
    setCharCount(chars);
    setDetectedSections(uniqueSections);

    onContentExtracted({
      filename: name,
      rawText: cleanText,
      wordCount: words,
      charCount: chars,
      detectedSections: uniqueSections,
    });
  };

  const processFile = async (file: File) => {
    setError(null);
    setIsProcessing(true);

    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      if (!["txt", "md", "pdf", "docx"].includes(ext)) {
        throw new Error("Unsupported format. Please upload .txt, .md, .pdf, or .docx files.");
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        analyzeText(result || "", file.name);
        setIsProcessing(false);
      };
      reader.onerror = () => {
        setError("Failed to read file.");
        setIsProcessing(false);
      };
      reader.readAsText(file);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "File processing failed");
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    analyzeText(val, filename || "pasted_draft.txt");
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-zinc-900 bg-zinc-50"
            : "border-zinc-200 hover:border-zinc-300 bg-zinc-50/50 hover:bg-zinc-50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.pdf,.docx"
          onChange={handleFileInput}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center shadow-xs">
            <UploadCloud className="w-5 h-5 text-zinc-600" />
          </div>
          <div>
            <span className="text-xs font-semibold text-zinc-900">
              Click to browse or drop manuscript file
            </span>
            <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
              Supports .txt, .md, .pdf, .docx (Max 25 MB)
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Editor & Live Stats */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
            Manuscript Draft Content
          </label>
          <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500">
            <span className="flex items-center gap-1">
              <Hash className="w-3 h-3" /> {charCount.toLocaleString()} chars
            </span>
            <span>·</span>
            <span>{wordCount.toLocaleString()} words</span>
            <span>·</span>
            <span>~{Math.max(1, Math.round(wordCount / 350))} page(s)</span>
          </div>
        </div>

        <textarea
          rows={9}
          className="w-full rounded-lg border border-zinc-300 p-3 text-xs font-mono text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-white"
          placeholder="Paste draft manuscript or drop document above..."
          value={text}
          onChange={handleTextareaChange}
          required
        />
      </div>

      {/* Detected Structure Badges */}
      {detectedSections.length > 0 && (
        <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-wider">
            <Layers className="w-3 h-3 text-zinc-400" />
            <span>Detected Manuscript Sections ({detectedSections.length})</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {detectedSections.map((sec, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded text-[11px] font-mono bg-white border border-zinc-200 text-zinc-700"
              >
                {sec}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
