"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import { Plus, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { usePackStudio } from "@/lib/hooks/usePackStudio";
import { formatKes } from "@/lib/utils/currency";

export default function PackStudioPage() {
  const router = useRouter();

  const {
    title,
    setTitle,
    tagline,
    setTagline,
    description,
    setDescription,
    priceKes,
    setPriceKes,
    expertName,
    setExpertName,
    expertTitle,
    setExpertTitle,
    institution,
    setInstitution,
    rules,
    addRule,
    removeRule,
    updateRule,
    privateLink,
    setPrivateLink,
    marketplace,
    setMarketplace,
    embedWidget,
    setEmbedWidget,
    isSubmitting,
    successResult,
    publishPack,
  } = usePackStudio();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    publishPack();
  };

  return (
    <div className="min-h-screen bg-parchment text-off-black">
      <AnnouncementBar />
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <span className="tag-pill bg-white text-lake-blue font-bold mb-3">
            EXPERT PACK BUILDER STUDIO
          </span>
          <h1 className="font-serif text-4xl text-off-black mb-2">
            Turn Your Expertise into an Immutable Pack
          </h1>
          <p className="font-mono text-xs text-graphite">
            Package your rubrics, good/bad exemplars, and rules once. Earn {formatKes(priceKes)} every time a client or student uses your brain.
          </p>
        </div>

        {successResult ? (
          <div className="card-monad bg-white p-8">
            <CheckCircle2 className="w-12 h-12 text-lake-blue mb-4" />
            <h2 className="font-serif text-3xl text-off-black mb-2">Pack Published Successfully!</h2>
            <p className="font-mono text-xs text-graphite mb-6">
              Version <code>{successResult.version.id}</code> is now locked and live across all 3 access modes.
            </p>

            <div className="space-y-3 font-mono text-xs mb-8">
              <div className="p-3 bg-parchment rounded-inner border border-ash flex items-center justify-between">
                <span>Private Link:</span>
                <a href={successResult.links.privateLink} className="text-lake-blue underline">
                  {successResult.links.privateLink}
                </a>
              </div>
              <div className="p-3 bg-parchment rounded-inner border border-ash flex items-center justify-between">
                <span>Marketplace:</span>
                <a href={successResult.links.marketplace} className="text-lake-blue underline">
                  /market
                </a>
              </div>
              <div className="p-3 bg-parchment rounded-inner border border-ash flex items-center justify-between">
                <span>Embed Code:</span>
                <code className="text-smoke">&lt;iframe src="/embed/{successResult.pack.slug}" /&gt;</code>
              </div>
            </div>

            <button
              onClick={() => router.push(successResult.links.privateLink)}
              className="btn-pill btn-primary text-xs py-3 px-6"
            >
              Visit Live Pack
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-8 font-mono text-xs">
            {/* Meta Card */}
            <div className="card-monad bg-white space-y-4">
              <h3 className="font-serif text-2xl text-off-black">1. Pack Identity &amp; Pricing</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-smoke mb-1">Pack Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-ash rounded-pill px-4 py-2 bg-parchment text-off-black focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-smoke mb-1">Price per Review (KES)</label>
                  <input
                    type="number"
                    value={priceKes}
                    onChange={(e) => setPriceKes(Number(e.target.value))}
                    className="w-full border border-ash rounded-pill px-4 py-2 bg-parchment text-off-black focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-smoke mb-1">Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full border border-ash rounded-pill px-4 py-2 bg-parchment text-off-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-smoke mb-1">Detailed Diagnostic Scope</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-ash rounded-inner p-3 bg-parchment text-off-black focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-ash">
                <div>
                  <label className="block text-smoke mb-1">Expert Name</label>
                  <input
                    type="text"
                    value={expertName}
                    onChange={(e) => setExpertName(e.target.value)}
                    className="w-full border border-ash rounded-pill px-4 py-2 bg-parchment text-off-black focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-smoke mb-1">Title / Role</label>
                  <input
                    type="text"
                    value={expertTitle}
                    onChange={(e) => setExpertTitle(e.target.value)}
                    className="w-full border border-ash rounded-pill px-4 py-2 bg-parchment text-off-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-smoke mb-1">Institution</label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full border border-ash rounded-pill px-4 py-2 bg-parchment text-off-black focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Rules Builder */}
            <div className="card-monad bg-white space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-2xl text-off-black">2. Rules &amp; Exemplars ({rules.length})</h3>
                <button
                  type="button"
                  onClick={addRule}
                  className="btn-pill btn-ghost text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Rule</span>
                </button>
              </div>

              {rules.map((rule, idx) => (
                <div key={idx} className="p-5 rounded-inner border border-ash bg-parchment space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="tag-pill bg-white text-lake-blue font-bold">
                      RULE {String(idx + 1).padStart(2, "0")}
                    </span>
                    {rules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRule(idx)}
                        aria-label={`Remove rule ${idx + 1}`}
                        className="text-coral hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-smoke mb-1">Rule Title</label>
                      <input
                        type="text"
                        value={rule.title}
                        onChange={(e) => updateRule(idx, "title", e.target.value)}
                        className="w-full border border-ash rounded-pill px-3 py-1.5 bg-white text-off-black focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-smoke mb-1">Severity</label>
                      <select
                        value={rule.severity}
                        onChange={(e) =>
                          updateRule(
                            idx,
                            "severity",
                            e.target.value as "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
                          )
                        }
                        className="w-full border border-ash rounded-pill px-3 py-1.5 bg-white text-off-black focus:outline-none"
                      >
                        <option value="CRITICAL">CRITICAL</option>
                        <option value="HIGH">HIGH</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="LOW">LOW</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-smoke mb-1">Evaluation Criteria &amp; Penalty</label>
                    <textarea
                      rows={2}
                      value={rule.penaltyRationale}
                      onChange={(e) => updateRule(idx, "penaltyRationale", e.target.value)}
                      className="w-full border border-ash rounded-inner p-3 bg-white text-off-black focus:outline-none resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Access Mode Toggles */}
            <div className="card-monad bg-white space-y-4">
              <h3 className="font-serif text-2xl text-off-black">3. Distribution Access Toggles</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label className="p-4 rounded-inner border border-ash bg-parchment flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privateLink}
                    onChange={(e) => setPrivateLink(e.target.checked)}
                    className="rounded text-lake-blue"
                  />
                  <div>
                    <div className="font-bold text-off-black">Private Link</div>
                    <div className="text-[11px] text-smoke">Direct URL for your class</div>
                  </div>
                </label>
                <label className="p-4 rounded-inner border border-ash bg-parchment flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marketplace}
                    onChange={(e) => setMarketplace(e.target.checked)}
                    className="rounded text-lake-blue"
                  />
                  <div>
                    <div className="font-bold text-off-black">Marketplace</div>
                    <div className="text-[11px] text-smoke">Searchable on me.ai/market</div>
                  </div>
                </label>
                <label className="p-4 rounded-inner border border-ash bg-parchment flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={embedWidget}
                    onChange={(e) => setEmbedWidget(e.target.checked)}
                    className="rounded text-lake-blue"
                  />
                  <div>
                    <div className="font-bold text-off-black">Embed Widget</div>
                    <div className="text-[11px] text-smoke">iFrame for your portal</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4 border-t border-ash">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-pill btn-accent text-xs py-3 px-8 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing &amp; Freezing Version...</span>
                  </>
                ) : (
                  <span>Publish &amp; Lock Pack (v1.0.0)</span>
                )}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
