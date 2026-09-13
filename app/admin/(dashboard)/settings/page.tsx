import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { SiteSettingsRow } from "@/types/database";
import SettingsForm from "./SettingsForm";

export default async function AdminSettingsPage() {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle<SiteSettingsRow>();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl text-cream">Settings</h1>
      <SettingsForm
        initial={{
          site_title: data?.site_title ?? "Chhath Geet",
          site_description: data?.site_description ?? "Traditional Chhath Songs",
          hero_title: data?.hero_title ?? "CHHATH GEET",
          hero_subtitle:
            data?.hero_subtitle ?? "Songs of faith. Songs of tradition. Songs of Chhath.",
          background_url: data?.background_url ?? "",
        }}
      />
    </div>
  );
}