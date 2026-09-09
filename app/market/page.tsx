"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import GuestCheckoutModal from "@/components/demand/GuestCheckoutModal";
import { Star, ShieldCheck, ArrowRight, BookOpen, Scale, FileText } from "lucide-react";

export default function MarketplacePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const packs = [
    {
      slug: "dr-thorne-thesis",
      title: "Academic Thesis Chapter 1–3 Diagnostic",
      expert: "Dr. Aris Thorne",
      institution: "Faculty of Graduate Studies",
      category: "ACADEMIC",
      priceKes: 500,
      rating: "4.9",
      reviewsCount: 84,
      rulesCount: 5,
      tag: "FLAGSHIP",
    },
    {
      slug: "adv-wafula-contracts",
      title: "B2B SaaS Master Services Agreement (MSA) Auditor",
      expert: "Adv. Brian Wafula",
      institution: "High Court of Kenya & Tech Counsel",
      category: "LEGAL",
      priceKes: 1500,
      rating: "5.0",
      reviewsCount: 42,
      rulesCount: 8,
      tag: "POPULAR",
    },
    {
      slug: "karanja-pitch-deck",
      title: "Early-Stage VC Pitch Deck Diagnostic",
      expert: "Njeri Karanja",
      institution: "Founding Partner, Savannah Ventures",
      category: "VENTURE",
      priceKes: 1000,
      rating: "4.8",
      reviewsCount: 119,
      rulesCount: 6,
      tag: "FEATURED",
    },
  ];

  const filteredPacks =
    selectedCategory === "ALL"
      ? packs
      : packs.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-parchment text-off-black">
      <AnnouncementBar />
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="max-w-3xl mb-12">
          <span className="tag-pill bg-white text-graphite mb-4">
            MODE 2 · OPEN MARKETPLACE
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-off-black mb-4">
            Discover Verified Expert Packs
          </h1>
          <p className="font-mono text-graphite text-sm sm:text-base">
            Rent top minds across academia, legal contracts, and venture finance. Zero subscription required — pay guest checkout per review.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-10 font-mono text-xs">
          {["ALL", "ACADEMIC", "LEGAL", "VENTURE"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`tag-pill transition-colors ${
                selectedCategory === cat
                  ? "bg-off-black text-white border-off-black"
                  : "bg-white text-graphite hover:bg-parchment"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Pack Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredPacks.map((pack) => (
            <div
              key={pack.slug}
              className="card-monad flex flex-col justify-between hover:border-lake-blue transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="tag-pill bg-periwinkle-mist/30 text-lake-blue font-bold text-[11px]">
                    {pack.tag}
                  </span>
                  <div className="flex items-center gap-1 font-mono text-xs text-off-black">
                    <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                    <span>{pack.rating}</span>
                    <span className="text-smoke">({pack.reviewsCount})</span>
                  </div>
                </div>

                <h3 className="font-serif text-2xl text-off-black mb-2">
                  {pack.title}
                </h3>
                <p className="font-mono text-xs text-graphite mb-4">
                  By {pack.expert} · {pack.institution}
                </p>
                <div className="font-mono text-xs text-smoke mb-6">
                  {pack.rulesCount} immutable rules &amp; good/bad exemplars
                </div>
              </div>

              <div>
                <div className="pt-4 border-t border-ash flex items-center justify-between mb-4">
                  <span className="font-mono text-xs text-smoke">Price</span>
                  <span className="font-serif text-xl text-off-black">
                    {pack.priceKes} KES
                  </span>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full btn-pill btn-primary text-xs py-3 justify-center"
                >
                  Upload &amp; Review
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <GuestCheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
