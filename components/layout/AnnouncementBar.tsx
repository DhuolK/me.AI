import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function AnnouncementBar() {
  return (
    <div className="bg-ink text-parchment text-xs font-mono tracking-tightest py-2.5 px-6 border-b border-ash flex items-center justify-between">
      <div className="flex items-center gap-3 mx-auto md:mx-0">
        <span className="inline-block w-2 h-2 rounded-full bg-mint animate-live-pulse" />
        <span className="uppercase">
          Editorial Tech Journal Edition · Grounded in Immutable Expert Packs
        </span>
        <span className="hidden lg:inline text-smoke">|</span>
        <span className="hidden lg:inline text-sky-blue uppercase">
          Server-Authoritative Daraja M-Pesa Rails
        </span>
      </div>

      <div className="hidden md:flex items-center gap-3">
        <Link
          href="/studio/new"
          className="tag-pill bg-white/10 hover:bg-white/20 text-parchment text-[11px] border-ash/40 py-1 px-3 transition-all duration-150 group"
        >
          Publish a Pack <span className="text-mint ml-1 inline-block transition-transform duration-150 group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </div>
  );
}
