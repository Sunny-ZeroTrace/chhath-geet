import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware already redirects unauthenticated visitors away from /admin/*,
  // but every layout/page that reads or mutates data re-checks here too —
  // never rely on hiding the URL alone.
  if (!user) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-ghat-900">
      <AdminSidebar />
      <div className="flex-1 overflow-x-hidden px-6 py-8 sm:px-10">{children}</div>
    </div>
  );
}
