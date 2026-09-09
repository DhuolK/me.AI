export default function PipelineDiagram() {
  const steps = [
    { num: "01", label: "Draft Ingestion", desc: "Raw text or multi-format file parsed without auth walls" },
    { num: "02", label: "Deterministic Chunking", desc: "Paragraph-level sliding windows with checksum IDs" },
    { num: "03", label: "Pack Rule Retrieval", desc: "Cosine & lexical search over immutable expert rubrics" },
    { num: "04", label: "Daraja Rails", desc: "Server-authoritative M-Pesa push & receipt issuance" },
    { num: "05", label: "Grounding Validation", desc: "Evaluation prompt locked strictly to retrieved evidence" },
    { num: "06", label: "Zero-Hallucination Gate", desc: "Automated validator rejects any ungrounded claim" },
    { num: "07", label: "Observable RAG Audit", desc: "8 machine-readable proofs compiled into receipt state" },
    { num: "08", label: "Do's & Don'ts Engine", desc: "Structural score & actionable defect isolation" },
    { num: "09", label: "Redline Vorschlag", desc: "Side-by-side exemplar diff with 1-click copy" },
    { num: "10", label: "Escalation Path", desc: "Direct 15-minute consultation booking with the author" },
  ];

  return (
    <section id="how-it-works" className="py-24 px-6 max-w-[1432px] mx-auto border-t border-ash">
      <div className="max-w-3xl mb-16 text-left">
        <span className="tag-pill bg-white text-graphite mb-4">
          HOW IT WORKS · 10-STEP PIPELINE
        </span>
        <h2 className="font-serif text-4xl sm:text-5xl text-off-black mb-4">
          From draft in to audit out in ten deterministic stages.
        </h2>
        <p className="font-mono text-graphite text-sm sm:text-base leading-relaxed">
          Every evaluation leaves behind verifiable evidence. No black-box guesses, no untracked prompts—just transparent rule matching.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {steps.map((s, idx) => (
          <div
            key={idx}
            className="bg-white border border-ash rounded-[24px] p-6 hover:border-lake-blue hover:shadow-[0_0_15px_rgba(43,89,209,0.08)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group min-h-[190px]"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-lake-blue font-medium">
                  STAGE {s.num}
                </span>
                <span className="w-2 h-2 rounded-full bg-ash group-hover:bg-lake-blue group-hover:scale-125 transition-all duration-200" />
              </div>
              <h3 className="font-serif text-lg text-off-black mb-1 group-hover:text-lake-blue transition-colors duration-200">
                {s.label}
              </h3>
            </div>
            <p className="font-mono text-xs text-smoke leading-relaxed mt-4 group-hover:text-graphite transition-colors duration-200">
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
