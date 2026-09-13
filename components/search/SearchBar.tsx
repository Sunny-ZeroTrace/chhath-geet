"use client";

import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface SearchBarProps {
  initialValue?: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export default function SearchBar({
  initialValue = "",
  onSearch,
  placeholder = "Search Chhath Geet…",
  debounceMs = 300,
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => onSearch(value), debounceMs);
    return () => clearTimeout(timeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/50" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Search songs"
        className="w-full rounded-full border border-gold-500/20 bg-ghat-800/70 py-3 pl-11 pr-4 text-sm text-cream placeholder:text-cream/40 focus:border-gold-500/60 focus:outline-none focus:ring-1 focus:ring-gold-500/40"
      />
    </div>
  );
}
