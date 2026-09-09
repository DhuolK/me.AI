"use client";

import { X, ShieldCheck, Check, Database, Hash, FileCode, CheckCircle2 } from "lucide-react";

export interface AuditTrace {
  q1_packVersionId: string;
  q2_documentVersionHash: string;
  q3_retrievedChunkIds: number[];
  q4_retrievalSelectionReason: string;
  q5_contextPayloadDelivered: {
    ruleCount: number;
    chunkCount: number;
    totalChars: number;
  };
  q6_citationMappingMatrix: Array<{
    ruleId: string;
    ruleTitle: string;
    chunkId: number;
    quoteMatch: string;
  }>;
  q7_rawModelOutputLength: number;
  q8_validationStatus: {
    isValid: boolean;
    missingRuleCount: number;
    hallucinatedChunkCount: number;
    hallucinatedRuleCount?: number;
  };
  latencyMs: number;
}

interface AuditTraceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  auditTrace: AuditTrace;
}

export default function AuditTraceDrawer({ isOpen, onClose, auditTrace }: AuditTraceDrawerProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-ink/50 backdrop-blur-xs modal-overlay-enter"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-parchment h-full overflow-y-auto border-l border-ash p-8 shadow-2xl font-mono text-xs drawer-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-6 border-b border-ash mb-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-lake-blue" />
            <h3 className="font-serif text-2xl text-off-black">RAG Machine Audit</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-ash flex items-center justify-center text-graphite hover:bg-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-graphite mb-6">
          Every me.AI review leaves machine-readable evidence proving exact provenance across all 8 architectural invariants.
        </p>

        <div className="space-y-6">
          {/* Q1 */}
          <div className="bg-white p-5 rounded-[20px] border border-ash">
            <div className="text-lake-blue font-bold mb-1">Q1: Which Pack version was used?</div>
            <div className="text-off-black font-semibold">{auditTrace.q1_packVersionId}</div>
            <div className="text-[11px] text-smoke mt-1">Immutable semver snapshot (locked against mutation).</div>
          </div>

          {/* Q2 */}
          <div className="bg-white p-5 rounded-[20px] border border-ash">
            <div className="text-lake-blue font-bold mb-1">Q2: Which document version was reviewed?</div>
            <div className="text-off-black font-mono break-all">{auditTrace.q2_documentVersionHash}</div>
            <div className="text-[11px] text-smoke mt-1">SHA-256 fingerprint of input document text.</div>
          </div>

          {/* Q3 */}
          <div className="bg-white p-5 rounded-[20px] border border-ash">
            <div className="text-lake-blue font-bold mb-1">Q3: Which chunks were retrieved?</div>
            <div className="flex flex-wrap gap-2 mt-2">
              {auditTrace.q3_retrievedChunkIds.map((cid) => (
                <span key={cid} className="tag-pill bg-periwinkle-mist/30 text-off-black">
                  {cid}
                </span>
              ))}
            </div>
          </div>

          {/* Q4 */}
          <div className="bg-white p-5 rounded-[20px] border border-ash">
            <div className="text-lake-blue font-bold mb-1">Q4: Why were those chunks selected?</div>
            <div className="text-off-black">{auditTrace.q4_retrievalSelectionReason}</div>
          </div>

          {/* Q5 */}
          <div className="bg-white p-5 rounded-[20px] border border-ash">
            <div className="text-lake-blue font-bold mb-1">Q5: What evidence was supplied to the model?</div>
            <div className="text-off-black">
              {auditTrace.q5_contextPayloadDelivered.ruleCount} active Pack rules &amp;{" "}
              {auditTrace.q5_contextPayloadDelivered.chunkCount} document chunks (
              {auditTrace.q5_contextPayloadDelivered.totalChars} total characters).
            </div>
          </div>

          {/* Q6 */}
          <div className="bg-white p-5 rounded-[20px] border border-ash">
            <div className="text-lake-blue font-bold mb-1">Q6: Which citation points to which evidence?</div>
            <div className="space-y-2 mt-2">
              {auditTrace.q6_citationMappingMatrix.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-[12px] bg-parchment border border-ash flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-off-black">{item.ruleId}</span>
                  <span className="text-smoke">mapped to</span>
                  <span className="text-lake-blue">{item.chunkId}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Q7 */}
          <div className="bg-white p-5 rounded-[20px] border border-ash">
            <div className="text-lake-blue font-bold mb-1">Q7: What did the model return?</div>
            <div className="text-off-black">
              Raw structured JSON payload ({auditTrace.q7_rawModelOutputLength} bytes generated in {auditTrace.latencyMs}ms).
            </div>
          </div>

          {/* Q8 */}
          <div className="bg-white p-5 rounded-[20px] border border-ash">
            <div className="text-lake-blue font-bold mb-1">Q8: What validation rejected or accepted it?</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="tag-pill bg-mint/30 text-emerald-800 font-bold">
                {auditTrace.q8_validationStatus.isValid ? "ACCEPTED" : "REJECTED"}
              </span>
              <span className="text-[11px] text-smoke">
                {auditTrace.q8_validationStatus.hallucinatedChunkCount} hallucinated chunks · {auditTrace.q8_validationStatus.hallucinatedRuleCount} invalid rules
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
