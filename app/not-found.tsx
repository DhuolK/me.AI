import Link from "next/link";
import { FileQuestion, ArrowRight, Home, Compass } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-parchment text-off-black flex items-center justify-center p-6 font-mono selection:bg-periwinkle-mist">
      <div className="card-monad max-w-lg w-full bg-white text-center shadow-xl p-10 border border-ash">
        <div className="w-14 h-14 rounded-full bg-periwinkle-mist/40 border border-ash flex items-center justify-center mx-auto mb-6">
          <FileQuestion className="w-6 h-6 text-lake-blue" />
        </div>

        <span className="tag-pill bg-periwinkle-mist/30 text-lake-blue text-[11px] mb-3">
          404 · RESOURCE NOT FOUND
        </span>

        <h1 className="font-serif text-3xl text-off-black mb-3">
          Pack or Receipt Not Found
        </h1>

        <p className="font-mono text-xs text-graphite leading-relaxed mb-8">
          The requested pack slug, review receipt, or embedded route does not exist or has been migrated. Check the URL or browse active packs.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="btn-pill btn-primary text-xs py-3 px-6 w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </Link>
          <Link
            href="/market"
            className="btn-pill btn-ghost text-xs py-3 px-6 w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Explore Marketplace</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
