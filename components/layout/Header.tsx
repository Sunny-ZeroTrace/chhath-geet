import Link from "next/link";
import { Sun } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-gold-500/10 bg-ghat-900/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Sun className="h-5 w-5 text-gold-400" />
          <span className="font-display text-lg tracking-wide text-cream">
            Chhath Geet
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-cream/70">
          <Link href="/" className="transition hover:text-gold-400">
            Home
          </Link>
          <Link href="/search" className="transition hover:text-gold-400">
            Search
          </Link>
        </nav>
      </div>
    </header>
  );
}
