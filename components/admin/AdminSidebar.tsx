"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ListMusic, Upload, Settings, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cx } from "@/lib/utils/format";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/songs", label: "Songs", icon: ListMusic },
  { href: "/admin/upload", label: "Upload Music", icon: Upload },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-gold-500/10 bg-ghat-900/60 px-3 py-6">
      <p className="mb-6 px-3 font-display text-lg text-cream">Chhath Geet</p>
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cx(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                isActive
                  ? "bg-gold-500/15 text-gold-400"
                  : "text-cream/60 hover:bg-ghat-800 hover:text-cream"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-cream/60 transition hover:bg-ghat-800 hover:text-cream"
      >
        <LogOut className="h-4 w-4" />
        Log out
      </button>
    </aside>
  );
}
