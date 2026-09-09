import Link from "next/link";

interface NavbarProps {
  onOpenCheckout?: () => void;
}

export default function Navbar({ onOpenCheckout }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-parchment/90 backdrop-blur-md border-b border-ash">
      <div className="max-w-[1432px] mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="w-8 h-8 rounded-full bg-off-black text-parchment flex items-center justify-center font-mono font-medium text-xs group-hover:bg-lake-blue transition-colors">
            me
          </span>
          <span className="font-serif text-2xl tracking-tight text-off-black">
            me<span className="text-lake-blue">.AI</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-[14px] font-mono tracking-tight uppercase">
          <Link href="/market" className="text-graphite hover:text-off-black transition-colors">
            Marketplace
          </Link>
          <a href="#how-it-works" className="text-graphite hover:text-off-black transition-colors">
            How It Works
          </a>
          <a href="#for-experts" className="text-graphite hover:text-off-black transition-colors">
            For Experts
          </a>
          <a href="#faq" className="text-graphite hover:text-off-black transition-colors">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/studio/new"
            className="hidden sm:inline-flex btn-pill btn-ghost text-xs py-2.5 px-5"
          >
            Create Pack
          </Link>
          <button
            onClick={onOpenCheckout}
            className="btn-pill btn-accent text-xs py-2.5 px-6 shadow-sm"
          >
            Review My Draft ▸
          </button>
        </div>
      </div>
    </header>
  );
}
